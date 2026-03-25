import { desc, eq, ilike, or } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../db/client.js";
import { feedback } from "../db/schema.js";
import type { AuthUser } from "../models/auth.js";
import type { FeedbackInput } from "../models/feedback.js";
import { auditService } from "./auditService.js";
import { feedbackSearchService, type FeedbackSearchDocument } from "./feedbackSearchService.js";

type FeedbackRecord = {
  id: number;
  author: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function toAuditSnapshot(record: {
  id: number;
  author: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  // Audit records intentionally omit the relational primary key so the UI can
  // show business-relevant changes without leaking internal identifiers.
  return {
    author: record.author,
    email: record.email,
    message: record.message,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toSearchDocument(record: FeedbackRecord): FeedbackSearchDocument {
  return {
    id: record.id,
    author: record.author,
    email: record.email,
    message: record.message,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function fromSearchDocument(record: ReturnType<typeof toSearchDocument>): FeedbackRecord {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

@injectable()
export class FeedbackService {
  public async list() {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  public async search(query: string) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return this.list();
    }

    const elasticResults = await feedbackSearchService.search(normalizedQuery);

    if (elasticResults) {
      return elasticResults.map(fromSearchDocument);
    }

    return db
      .select()
      .from(feedback)
      .where(
        or(
          ilike(feedback.author, `%${normalizedQuery}%`),
          ilike(feedback.email, `%${normalizedQuery}%`),
          ilike(feedback.message, `%${normalizedQuery}%`),
          ilike(feedback.status, `%${normalizedQuery}%`),
        ),
      )
      .orderBy(desc(feedback.createdAt));
  }

  public async create(input: FeedbackInput, actor: AuthUser | null = null) {
    const [created] = await db.insert(feedback).values(input).returning();
    await auditService.publish({
      action: "feedback.created",
      entity: "feedback",
      entityId: created.id,
      actor,
      metadata: {
        record: toAuditSnapshot(created),
      },
    });
    return created;
  }

  public async update(id: number, input: FeedbackInput, actor: AuthUser | null = null) {
    const [existing] = await db.select().from(feedback).where(eq(feedback.id, id)).limit(1);

    if (!existing) {
      return null;
    }

    const [updated] = await db
      .update(feedback)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, id))
      .returning();

    if (updated) {
      // Updates capture both states so the audit view can explain what changed
      // instead of only recording that a write happened.
      await auditService.publish({
        action: "feedback.updated",
        entity: "feedback",
        entityId: updated.id,
        actor,
        metadata: {
          before: toAuditSnapshot(existing),
          after: toAuditSnapshot(updated),
        },
      });
    }

    return updated ?? null;
  }

  public async delete(id: number, actor: AuthUser | null = null) {
    const [deleted] = await db.delete(feedback).where(eq(feedback.id, id)).returning();

    if (deleted) {
      await auditService.publish({
        action: "feedback.deleted",
        entity: "feedback",
        entityId: deleted.id,
        actor,
        metadata: {
          record: toAuditSnapshot(deleted),
        },
      });
    }

    return deleted ?? null;
  }
}

export const feedbackService = new FeedbackService();
