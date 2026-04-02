// =============================================================================
// Backup System — Create and restore WordPress database backups
// Uses WP-CLI via the WordPress executor (Docker or SSH)
// Usage: import { createBackup, restoreBackup } from "@/lib/backup/backup";
// =============================================================================

import { getExecutor } from "@/lib/wordpress/ssh";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BackupResult {
  success: boolean;
  backupId?: string;
  timestamp?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Create backup — exports WordPress DB via WP-CLI
// ---------------------------------------------------------------------------

export async function createBackup(siteId: string): Promise<BackupResult> {
  try {
    const wp = getExecutor(siteId);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `backup-${siteId}-${timestamp}`;

    // Export database via WP-CLI
    await wp.execute(`db export /tmp/${backupName}.sql`);

    // Update site backup timestamp
    await prisma.site.update({
      where: { id: siteId },
      data: { lastBackupAt: new Date() },
    });

    // Log health check with backup status
    await prisma.siteHealthCheck.create({
      data: {
        siteId,
        backupOk: true,
        issues: { type: "backup_created", backupName },
      },
    });

    return {
      success: true,
      backupId: backupName,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[backup] Failed to create backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Restore backup — imports a previously exported DB dump
// ---------------------------------------------------------------------------

export async function restoreBackup(
  siteId: string,
  backupName: string
): Promise<RestoreResult> {
  try {
    const wp = getExecutor(siteId);

    // Import the SQL dump
    await wp.execute(`db import /tmp/${backupName}.sql`);

    // Flush caches after restore
    try {
      await wp.execute("cache flush");
    } catch {
      // Cache flush is non-critical
      console.warn("[backup] Cache flush skipped (non-fatal)");
    }

    return { success: true };
  } catch (error) {
    console.error("[backup] Failed to restore backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Check if backup is needed (older than given hours)
// ---------------------------------------------------------------------------

export async function isBackupNeeded(
  siteId: string,
  maxAgeHours: number = 168 // 7 days
): Promise<boolean> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { lastBackupAt: true },
  });

  if (!site?.lastBackupAt) return true;

  const ageMs = Date.now() - site.lastBackupAt.getTime();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  return ageMs > maxAgeMs;
}
