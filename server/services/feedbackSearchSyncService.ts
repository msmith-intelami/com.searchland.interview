import { injectable } from "inversify";
import type { AuditEvent } from "../models/audit.js";
import { feedbackSearchService } from "./feedbackSearchService.js";

type SearchRecord = {
  author: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function isSearchRecord(value: unknown): value is SearchRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.author === "string" &&
    typeof record.email === "string" &&
    typeof record.message === "string" &&
    typeof record.status === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

@injectable()
export class FeedbackSearchSyncService {
  public async syncFromAuditEvent(event: AuditEvent) {
    if (event.entity !== "feedback") {
      return;
    }

    if (event.action === "feedback.deleted") {
      await feedbackSearchService.delete(event.entityId);
      return;
    }

    const record = this.getRecordFromEvent(event);

    if (!record) {
      return;
    }

    await feedbackSearchService.index({
      id: event.entityId,
      ...record,
    });
  }

  private getRecordFromEvent(event: AuditEvent) {
    const metadata = event.metadata ?? {};

    if (event.action === "feedback.created" && isSearchRecord(metadata.record)) {
      return metadata.record;
    }

    if (event.action === "feedback.updated" && isSearchRecord(metadata.after)) {
      return metadata.after;
    }

    return null;
  }
}

export const feedbackSearchSyncService = new FeedbackSearchSyncService();
