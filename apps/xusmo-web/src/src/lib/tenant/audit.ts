// =============================================================================
// Audit Logger (ported from Dropnex Logger)
// Structured audit logging with secret redaction.
// Usage: import { logAudit } from "@/lib/tenant/audit";
// =============================================================================

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Patterns to redact from logged details (mirrors Dropnex Logger secret redaction)
const REDACT_KEYS = [
  "api_key",
  "apiKey",
  "client_secret",
  "clientSecret",
  "password",
  "passwordHash",
  "token",
  "access_token",
  "refresh_token",
  "ssh_key",
  "sshKey",
  "encryption_key",
];

interface AuditEntry {
  tenantId?: string;
  userId?: string;
  action: string;
  component: string;
  objectType?: string;
  objectId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

function redactSecrets(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (REDACT_KEYS.some((rk) => key.toLowerCase().includes(rk.toLowerCase()))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof redacted[key] === "object" && redacted[key] !== null) {
      redacted[key] = redactSecrets(redacted[key] as Record<string, unknown>);
    }
  }
  return redacted;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId,
        action: entry.action,
        component: entry.component,
        objectType: entry.objectType,
        objectId: entry.objectId,
        details: entry.details ? redactSecrets(entry.details) as Prisma.InputJsonValue : undefined,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (err) {
    // Audit logging must never crash the app
    console.error("[AuditLog] Failed to write:", err);
  }
}
