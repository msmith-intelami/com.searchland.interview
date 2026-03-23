import { injectable } from "inversify";
import type { Filter } from "mongodb";
import { getDocumentCollection } from "../db/documentClient.js";
import type { AuthUser } from "../models/auth.js";
import type { AuditEvent, StoredAuditEvent } from "../models/audit.js";
import { logAuditDebug } from "../utils/debug.js";

@injectable()
export class AuditLogService {
  public async insert(event: AuditEvent, routingKey: string) {
    const collection = await this.getCollection();

    if (!collection) {
      logAuditDebug("Mongo insert skipped because audit collection is unavailable", { routingKey });
      return;
    }

    await collection.insertOne({
      ...event,
      routingKey,
    });

    logAuditDebug("stored audit document", {
      routingKey,
      entityId: event.entityId,
      actorId: event.actor?.id ?? null,
      collection: process.env.MONGODB_AUDIT_COLLECTION ?? "audit_logs",
    });
  }

  public async listForUser(user: AuthUser) {
    const collection = await this.getCollection();

    if (!collection) {
      return [];
    }

    const filter: Filter<StoredAuditEvent> = {
      "actor.id": user.id,
    };

    return collection.find(filter).sort({ timestamp: -1 }).limit(100).toArray();
  }

  private async getCollection() {
    const collectionName = process.env.MONGODB_AUDIT_COLLECTION ?? "audit_logs";
    return getDocumentCollection<StoredAuditEvent>(collectionName);
  }
}

export const auditLogService = new AuditLogService();
