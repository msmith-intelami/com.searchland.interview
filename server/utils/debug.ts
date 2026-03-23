export function isAuditSystemEnabled() {
  return process.env.AUDIT_ENABLED === "true";
}

export function isAuditDebugEnabled() {
  return process.env.AUDIT_DEBUG === "true";
}

export function logAuditDebug(message: string, details?: Record<string, unknown>) {
  if (!isAuditDebugEnabled()) {
    return;
  }

  if (details) {
    console.log(`[audit-debug] ${message}`, details);
    return;
  }

  console.log(`[audit-debug] ${message}`);
}
