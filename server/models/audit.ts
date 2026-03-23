import { z } from "zod";
import type { AuthUser } from "./auth.js";

export const auditActionSchema = z.enum(["feedback.created", "feedback.updated", "feedback.deleted"]);

export const auditEntitySchema = z.enum(["feedback"]);

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntity = z.infer<typeof auditEntitySchema>;

export type AuditEvent = {
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
  actor: Pick<AuthUser, "id" | "email" | "name"> | null;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type StoredAuditEvent = AuditEvent & {
  _id?: string;
  routingKey: string;
};
