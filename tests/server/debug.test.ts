import assert from "node:assert/strict";
import test from "node:test";
import { auditConsumerService } from "../../server/services/auditConsumerService.ts";
import { auditLogService } from "../../server/services/auditLogService.ts";
import { auditService } from "../../server/services/auditService.ts";
import { isAuditDebugEnabled, isAuditSystemEnabled } from "../../server/utils/debug.ts";

test("isAuditSystemEnabled follows AUDIT_ENABLED", () => {
  const previousValue = process.env.AUDIT_ENABLED;

  process.env.AUDIT_ENABLED = "true";
  assert.equal(isAuditSystemEnabled(), true);

  process.env.AUDIT_ENABLED = "false";
  assert.equal(isAuditSystemEnabled(), false);

  process.env.AUDIT_ENABLED = previousValue;
});

test("isAuditDebugEnabled follows AUDIT_DEBUG", () => {
  const previousValue = process.env.AUDIT_DEBUG;

  process.env.AUDIT_DEBUG = "true";
  assert.equal(isAuditDebugEnabled(), true);

  process.env.AUDIT_DEBUG = "false";
  assert.equal(isAuditDebugEnabled(), false);

  process.env.AUDIT_DEBUG = previousValue;
});

test("audit services become safe no-ops when the audit system is disabled", async () => {
  const previousAuditEnabled = process.env.AUDIT_ENABLED;
  const previousRabbitUrl = process.env.RABBITMQ_URL;

  process.env.AUDIT_ENABLED = "false";
  delete process.env.RABBITMQ_URL;

  await assert.doesNotReject(async () => {
    await auditService.publish({
      action: "feedback.created",
      entity: "feedback",
      entityId: 1,
      actor: null,
      metadata: { status: "new" },
    });
  });

  await assert.doesNotReject(async () => {
    await auditConsumerService.start();
  });

  assert.deepEqual(
    await auditLogService.listForUser({
      id: "1",
      email: "admin@example.com",
      name: "Admin",
    }),
    [],
  );

  process.env.AUDIT_ENABLED = previousAuditEnabled;
  process.env.RABBITMQ_URL = previousRabbitUrl;
});
