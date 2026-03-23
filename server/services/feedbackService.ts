import { desc, eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../db/client.js";
import { feedback } from "../db/schema.js";
import type { AuthUser } from "../models/auth.js";
import type { FeedbackInput } from "../models/feedback.js";
import { auditService } from "./auditService.js";

@injectable()
export class FeedbackService {
  public async list() {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  public async create(input: FeedbackInput, actor: AuthUser | null = null) {
    const [created] = await db.insert(feedback).values(input).returning();
    await auditService.publish({
      action: "feedback.created",
      entity: "feedback",
      entityId: created.id,
      actor,
      metadata: {
        status: created.status,
      },
    });
    return created;
  }

  public async update(id: number, input: FeedbackInput, actor: AuthUser | null = null) {
    const [updated] = await db
      .update(feedback)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, id))
      .returning();

    if (updated) {
      await auditService.publish({
        action: "feedback.updated",
        entity: "feedback",
        entityId: updated.id,
        actor,
        metadata: {
          status: updated.status,
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
          status: deleted.status,
        },
      });
    }

    return deleted ?? null;
  }
}

export const feedbackService = new FeedbackService();
