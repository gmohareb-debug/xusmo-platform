// =============================================================================
// Backup Agent
// Runs daily at 3am to create database backups for all managed sites.
// Exports the WordPress database via WP-CLI, compresses with gzip,
// and updates site.lastBackupAt. Creates URGENT approvals on failure.
// Usage: import { runBackup } from "@/workers/agents/backup";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sshExec, getSiteConnection } from "@/workers/agents/ssh";

const AGENT_NAME = "backup";

// ---------------------------------------------------------------------------
// Backup runner
// ---------------------------------------------------------------------------

export async function runBackup(): Promise<void> {
  console.log(`[${AGENT_NAME}] Starting backup run...`);

  // Find the AdminAgent record
  const agent = await prisma.adminAgent.findUnique({ where: { name: AGENT_NAME } });
  if (!agent || !agent.isEnabled) {
    console.log(`[${AGENT_NAME}] Agent is disabled or not found — skipping`);
    return;
  }

  // Create AgentRun
  const startTime = Date.now();
  const agentRun = await prisma.agentRun.create({
    data: {
      agentId: agent.id,
      status: "STARTED",
    },
  });

  let sitesChecked = 0;
  let issuesFound = 0;
  let autoFixed = 0;
  let escalated = 0;
  const errors: string[] = [];

  try {
    // Get all managed sites
    const sites = await prisma.site.findMany({
      where: { managed: true, status: "LIVE" },
    });

    console.log(`[${AGENT_NAME}] Found ${sites.length} managed sites to back up`);

    const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    for (const site of sites) {
      try {
        sitesChecked++;

        // Resolve SSH connection
        const conn = await getSiteConnection(site.id);

        const backupFile = `/tmp/backup-${site.id}-${dateStamp}.sql`;

        // Export database and compress
        await sshExec(
          conn.host,
          conn.user,
          `cd ${conn.wpPath} && wp db export ${backupFile} && gzip ${backupFile}`
        );

        // Update site.lastBackupAt
        await prisma.site.update({
          where: { id: site.id },
          data: { lastBackupAt: new Date() },
        });

        autoFixed++;

        await logActivity(
          site.id,
          "backup_completed",
          "agent",
          "info",
          `Database backup completed: ${backupFile}.gz`,
          { backupFile: `${backupFile}.gz`, dateStamp }
        );

        console.log(`[${AGENT_NAME}] Backup completed for ${site.businessName}`);
      } catch (siteError) {
        const msg = siteError instanceof Error ? siteError.message : "Unknown error";
        errors.push(`Site ${site.id} (${site.businessName}): ${msg}`);
        issuesFound++;

        // Create URGENT AgentApproval for backup failure
        await prisma.agentApproval.create({
          data: {
            agentId: agent.id,
            action: `Backup failed for site ${site.businessName} (${site.id})`,
            reason: `Database backup failed: ${msg}`,
            priority: "URGENT",
            metadata: {
              siteId: site.id,
              businessName: site.businessName,
              error: msg,
              dateStamp,
            },
          },
        });
        escalated++;

        await logActivity(
          site.id,
          "backup_failed",
          "agent",
          "critical",
          `Database backup failed: ${msg}`,
          { error: msg }
        );

        console.error(`[${AGENT_NAME}] Backup FAILED for site ${site.id}:`, msg);
      }
    }

    // Update AgentRun with COMPLETED status
    const durationMs = Date.now() - startTime;
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        durationMs,
        sitesChecked,
        issuesFound,
        autoFixed,
        escalated,
        actions: { sitesChecked, successful: autoFixed, failed: issuesFound, escalated },
        errors: errors.length > 0 ? errors.join("\n") : null,
      },
    });

    console.log(
      `[${AGENT_NAME}] Run completed — ${sitesChecked} sites, ${autoFixed} successful, ${issuesFound} failed (${durationMs}ms)`
    );
  } catch (fatalError) {
    const durationMs = Date.now() - startTime;
    const msg = fatalError instanceof Error ? fatalError.message : "Unknown fatal error";
    errors.push(msg);

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        durationMs,
        sitesChecked,
        issuesFound,
        autoFixed,
        escalated,
        errors: errors.join("\n"),
      },
    });

    console.error(`[${AGENT_NAME}] Fatal error:`, msg);
  }
}
