// =============================================================================
// Patrol Agent
// Runs every 6 hours against all managed LIVE sites.
// Performs: uptime ping, WP version check, plugin/theme inventory, SSL expiry,
// backup freshness, and health score calculation.
// Usage: import { runPatrol } from "@/workers/agents/patrol";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sshExec, getSiteConnection } from "@/workers/agents/ssh";

const AGENT_NAME = "patrol";

// ---------------------------------------------------------------------------
// Health score calculation
// ---------------------------------------------------------------------------

interface HealthFactors {
  uptimeOk: boolean;
  responseTimeMs: number;
  wpVersionOk: boolean;
  pluginsOk: boolean;
  themeVersionOk: boolean;
  sslOk: boolean;
  backupOk: boolean;
}

function calculateHealthScore(factors: HealthFactors): number {
  let score = 100;

  if (!factors.uptimeOk) score -= 30;
  if (factors.responseTimeMs > 3000) score -= 15;
  else if (factors.responseTimeMs > 1500) score -= 5;

  if (!factors.wpVersionOk) score -= 10;
  if (!factors.pluginsOk) score -= 10;
  if (!factors.themeVersionOk) score -= 5;
  if (!factors.sslOk) score -= 20;
  if (!factors.backupOk) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// SSL expiry parser
// ---------------------------------------------------------------------------

function parseSslExpiry(opensslOutput: string): Date | null {
  // Output format: notAfter=Mar 15 12:00:00 2026 GMT
  const match = opensslOutput.match(/notAfter=(.+)/);
  if (!match) return null;
  const parsed = new Date(match[1].trim());
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Patrol runner
// ---------------------------------------------------------------------------

export async function runPatrol(): Promise<void> {
  console.log(`[${AGENT_NAME}] Starting patrol run...`);

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
  let escalated = 0;
  const errors: string[] = [];

  try {
    // Get all managed LIVE sites
    const sites = await prisma.site.findMany({
      where: { managed: true, status: "LIVE" },
    });

    console.log(`[${AGENT_NAME}] Found ${sites.length} managed LIVE sites`);

    for (const site of sites) {
      try {
        sitesChecked++;
        const issues: string[] = [];
        let uptimeOk = true;
        let responseTimeMs = 0;
        let wpVersionOk = true;
        let pluginsOk = true;
        let themeVersionOk = true;
        let sslOk = true;
        let backupOk = true;
        let wpVersion: string | null = null;
        let sslExpiresAt: Date | null = null;

        // --- 1. Ping URL for uptime + response time ---
        if (site.wpUrl) {
          try {
            const pingStart = Date.now();
            const res = await fetch(site.wpUrl, {
              method: "HEAD",
              signal: AbortSignal.timeout(10_000),
            });
            responseTimeMs = Date.now() - pingStart;
            uptimeOk = res.ok;
            if (!res.ok) {
              issues.push(`Site returned HTTP ${res.status}`);
            }
          } catch (err) {
            uptimeOk = false;
            responseTimeMs = 10_000;
            issues.push(`Ping failed: ${err instanceof Error ? err.message : "timeout"}`);
          }
        }

        // --- 2. SSH checks (WP version, plugins, themes) ---
        let conn: Awaited<ReturnType<typeof getSiteConnection>> | null = null;
        try {
          conn = await getSiteConnection(site.id);
        } catch {
          issues.push("Could not resolve SSH connection for site");
        }

        if (conn) {
          // WP core version
          try {
            wpVersion = await sshExec(
              conn.host,
              conn.user,
              `cd ${conn.wpPath} && wp core version`
            );
          } catch (err) {
            wpVersionOk = false;
            issues.push(`WP version check failed: ${err instanceof Error ? err.message : "unknown"}`);
          }

          // Plugin list
          try {
            const pluginJson = await sshExec(
              conn.host,
              conn.user,
              `cd ${conn.wpPath} && wp plugin list --format=json`
            );
            const plugins = JSON.parse(pluginJson) as Array<{
              name: string;
              status: string;
              version: string;
              update_version?: string;
            }>;
            const outdated = plugins.filter((p) => p.update_version);
            if (outdated.length > 0) {
              pluginsOk = false;
              issues.push(`${outdated.length} plugin(s) have updates available`);
            }
          } catch (err) {
            issues.push(`Plugin list check failed: ${err instanceof Error ? err.message : "unknown"}`);
          }

          // Theme list
          try {
            const themeJson = await sshExec(
              conn.host,
              conn.user,
              `cd ${conn.wpPath} && wp theme list --format=json`
            );
            const themes = JSON.parse(themeJson) as Array<{
              name: string;
              status: string;
              version: string;
              update_version?: string;
            }>;
            const outdated = themes.filter((t) => t.update_version);
            if (outdated.length > 0) {
              themeVersionOk = false;
              issues.push(`${outdated.length} theme(s) have updates available`);
            }
          } catch (err) {
            issues.push(`Theme list check failed: ${err instanceof Error ? err.message : "unknown"}`);
          }

          // --- 3. SSL expiry ---
          if (site.wpUrl) {
            try {
              const hostname = new URL(site.wpUrl).hostname;
              const sslOutput = await sshExec(
                conn.host,
                conn.user,
                `echo | openssl s_client -connect ${hostname}:443 -servername ${hostname} 2>/dev/null | openssl x509 -noout -enddate`
              );
              sslExpiresAt = parseSslExpiry(sslOutput);
              if (sslExpiresAt) {
                const daysUntilExpiry = Math.floor(
                  (sslExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                if (daysUntilExpiry < 0) {
                  sslOk = false;
                  issues.push(`SSL certificate EXPIRED ${Math.abs(daysUntilExpiry)} days ago`);
                } else if (daysUntilExpiry < 14) {
                  sslOk = false;
                  issues.push(`SSL certificate expires in ${daysUntilExpiry} days`);
                }
              }
            } catch (err) {
              issues.push(`SSL check failed: ${err instanceof Error ? err.message : "unknown"}`);
            }
          }
        }

        // --- 4. Backup freshness ---
        if (site.lastBackupAt) {
          const hoursSinceBackup =
            (Date.now() - site.lastBackupAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceBackup > 24) {
            backupOk = false;
            issues.push(`Last backup was ${Math.floor(hoursSinceBackup)} hours ago (>24h)`);
          }
        } else {
          backupOk = false;
          issues.push("No backup recorded for this site");
        }

        // --- 5. Calculate health score ---
        const healthScore = calculateHealthScore({
          uptimeOk,
          responseTimeMs,
          wpVersionOk,
          pluginsOk,
          themeVersionOk,
          sslOk,
          backupOk,
        });

        // --- 6. Insert SiteHealthCheck record ---
        await prisma.siteHealthCheck.create({
          data: {
            siteId: site.id,
            healthScore,
            responseTimeMs,
            wpVersionOk,
            themeVersionOk,
            pluginsOk,
            sslOk,
            backupOk,
            uptimeOk,
            issues: issues.length > 0 ? issues : undefined,
          },
        });

        // --- 7. Update Site fields ---
        await prisma.site.update({
          where: { id: site.id },
          data: {
            healthScore,
            responseTimeMs,
            lastHealthCheck: new Date(),
            ...(wpVersion ? { wpVersion } : {}),
            ...(sslExpiresAt ? { sslExpiresAt } : {}),
          },
        });

        // --- 8. Create AgentApproval for critical/warning issues ---
        if (issues.length > 0) {
          issuesFound += issues.length;

          const isCritical = !uptimeOk || !sslOk;
          const priority = isCritical ? "CRITICAL" : healthScore < 70 ? "URGENT" : "NORMAL";

          if (priority === "CRITICAL" || priority === "URGENT") {
            await prisma.agentApproval.create({
              data: {
                agentId: agent.id,
                action: `Patrol detected issues on site ${site.businessName} (${site.id})`,
                reason: issues.join("; "),
                priority,
                metadata: {
                  siteId: site.id,
                  businessName: site.businessName,
                  healthScore,
                  issues,
                },
              },
            });
            escalated++;
          }

          await logActivity(
            site.id,
            "patrol_check",
            "agent",
            isCritical ? "critical" : "warning",
            `Patrol found ${issues.length} issue(s): ${issues.join("; ")}`,
            { healthScore, responseTimeMs, issues }
          );
        } else {
          await logActivity(
            site.id,
            "patrol_check",
            "agent",
            "info",
            `Patrol check passed — health score: ${healthScore}`,
            { healthScore, responseTimeMs }
          );
        }

        console.log(
          `[${AGENT_NAME}] Site ${site.businessName}: score=${healthScore}, issues=${issues.length}`
        );
      } catch (siteError) {
        const msg = siteError instanceof Error ? siteError.message : "Unknown error";
        errors.push(`Site ${site.id} (${site.businessName}): ${msg}`);
        console.error(`[${AGENT_NAME}] Error processing site ${site.id}:`, msg);
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
        escalated,
        actions: { sitesChecked, issuesFound, escalated },
        errors: errors.length > 0 ? errors.join("\n") : null,
      },
    });

    console.log(
      `[${AGENT_NAME}] Run completed — ${sitesChecked} sites, ${issuesFound} issues, ${escalated} escalated (${durationMs}ms)`
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
        escalated,
        errors: errors.join("\n"),
      },
    });

    console.error(`[${AGENT_NAME}] Fatal error:`, msg);
  }
}
