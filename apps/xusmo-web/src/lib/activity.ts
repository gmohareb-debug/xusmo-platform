// =============================================================================
// Activity Log Helper
// Creates ActivityLog records for auditing site operations.
// Usage: import { logActivity } from "@/lib/activity";
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Severity type
// ---------------------------------------------------------------------------

export type ActivitySeverity = "info" | "warning" | "critical";

// ---------------------------------------------------------------------------
// Log an activity
// ---------------------------------------------------------------------------

export async function logActivity(
  siteId: string | null,
  action: string,
  category: string,
  severity: ActivitySeverity,
  message: string,
  metadata?: object,
  userId?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        siteId: siteId ?? undefined,
        userId: userId ?? undefined,
        action,
        category,
        severity,
        message,
        metadata: metadata ? (metadata as any) : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });
  } catch (error) {
    // Never let logging failures bubble up and break the caller
    console.error("[activity] Failed to write activity log:", error, {
      siteId,
      action,
      category,
      severity,
      message,
    });
  }
}
