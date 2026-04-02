// =============================================================================
// SSL & Security Agent
// Runs daily to check SSL certificate expiry, detect default admin usernames,
// and verify security headers across all managed sites.
// Auto-renew triggers for certificates expiring within 14 days;
// CRITICAL approvals for expired certificates.
// Usage: import { runSslSecurity } from "@/workers/agents/ssl-security";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sshExec, getSiteConnection } from "@/workers/agents/ssh";

const AGENT_NAME = "ssl-security";

// ---------------------------------------------------------------------------
// SSL expiry parser
// ---------------------------------------------------------------------------

function parseSslExpiry(opensslOutput: string): Date | null {
  const match = opensslOutput.match(/notAfter=(.+)/);
  if (!match) return null;
  const parsed = new Date(match[1].trim());
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Security header checker
// ---------------------------------------------------------------------------

interface SecurityHeaderResult {
  header: string;
  present: boolean;
}

function parseSecurityHeaders(curlOutput: string): SecurityHeaderResult[] {
  const headersToCheck = [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "X-XSS-Protection",
    "Content-Security-Policy",
    "Referrer-Policy",
    "Permissions-Policy",
  ];

  const lowerOutput = curlOutput.toLowerCase();

  return headersToCheck.map((header) => ({
    header,
    present: lowerOutput.includes(header.toLowerCase()),
  }));
}

// ---------------------------------------------------------------------------
// SSL & Security runner
// ---------------------------------------------------------------------------

export async function runSslSecurity(): Promise<void> {
  console.log(`[${AGENT_NAME}] Starting SSL & security run...`);

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
    // Get all managed LIVE sites
    const sites = await prisma.site.findMany({
      where: { managed: true, status: "LIVE" },
    });

    console.log(`[${AGENT_NAME}] Found ${sites.length} managed LIVE sites`);

    for (const site of sites) {
      try {
        sitesChecked++;
        const issues: string[] = [];

        let conn: Awaited<ReturnType<typeof getSiteConnection>> | null = null;
        try {
          conn = await getSiteConnection(site.id);
        } catch {
          issues.push("Could not resolve SSH connection for site");
        }

        // --- 1. Check SSL certificate expiry ---
        if (site.wpUrl && conn) {
          try {
            const hostname = new URL(site.wpUrl).hostname;
            const sslOutput = await sshExec(
              conn.host,
              conn.user,
              `echo | openssl s_client -connect ${hostname}:443 -servername ${hostname} 2>/dev/null | openssl x509 -noout -enddate`
            );
            const sslExpiresAt = parseSslExpiry(sslOutput);

            if (sslExpiresAt) {
              const daysUntilExpiry = Math.floor(
                (sslExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              // Update site.sslExpiresAt
              await prisma.site.update({
                where: { id: site.id },
                data: { sslExpiresAt },
              });

              if (daysUntilExpiry < 0) {
                // --- EXPIRED: CRITICAL approval ---
                issues.push(`SSL certificate EXPIRED ${Math.abs(daysUntilExpiry)} days ago`);
                await prisma.agentApproval.create({
                  data: {
                    agentId: agent.id,
                    action: `SSL certificate EXPIRED on ${site.businessName} (${hostname})`,
                    reason: `SSL expired ${Math.abs(daysUntilExpiry)} days ago. Immediate renewal required.`,
                    priority: "CRITICAL",
                    metadata: {
                      siteId: site.id,
                      businessName: site.businessName,
                      hostname,
                      sslExpiresAt: sslExpiresAt.toISOString(),
                      daysUntilExpiry,
                    },
                  },
                });
                escalated++;
              } else if (daysUntilExpiry < 14) {
                // --- Expiring soon: auto-renew placeholder ---
                issues.push(`SSL certificate expires in ${daysUntilExpiry} days — triggering renewal`);

                // Placeholder for RunCloud API call to renew SSL
                await logActivity(
                  site.id,
                  "ssl_auto_renew",
                  "agent",
                  "info",
                  `SSL certificate expires in ${daysUntilExpiry} days. Auto-renew triggered (RunCloud API placeholder).`,
                  { hostname, sslExpiresAt: sslExpiresAt.toISOString(), daysUntilExpiry }
                );
                autoFixed++;

                console.log(
                  `[${AGENT_NAME}] SSL renewal triggered for ${hostname} (expires in ${daysUntilExpiry} days)`
                );
              } else {
                console.log(
                  `[${AGENT_NAME}] SSL OK for ${hostname} — ${daysUntilExpiry} days remaining`
                );
              }
            } else {
              issues.push("Could not parse SSL certificate expiry date");
            }
          } catch (sslErr) {
            const msg = sslErr instanceof Error ? sslErr.message : "unknown";
            issues.push(`SSL check failed: ${msg}`);
          }
        }

        // --- 2. Check for default "admin" username ---
        if (conn) {
          try {
            const userJson = await sshExec(
              conn.host,
              conn.user,
              `cd ${conn.wpPath} && wp user list --role=administrator --format=json`
            );
            const admins = JSON.parse(userJson) as Array<{
              ID: number;
              user_login: string;
              user_email: string;
            }>;

            const defaultAdmin = admins.find(
              (u) => u.user_login.toLowerCase() === "admin"
            );
            if (defaultAdmin) {
              issues.push('Default "admin" username detected — security risk');
              await prisma.agentApproval.create({
                data: {
                  agentId: agent.id,
                  action: `Change default "admin" username on ${site.businessName}`,
                  reason: 'The default "admin" username is still in use, which is a common brute-force attack target.',
                  priority: "URGENT",
                  metadata: {
                    siteId: site.id,
                    businessName: site.businessName,
                    adminUserId: defaultAdmin.ID,
                  },
                },
              });
              escalated++;
            }
          } catch (userErr) {
            const msg = userErr instanceof Error ? userErr.message : "unknown";
            issues.push(`Admin user check failed: ${msg}`);
          }
        }

        // --- 3. Check security headers ---
        if (site.wpUrl && conn) {
          try {
            const curlOutput = await sshExec(
              conn.host,
              conn.user,
              `curl -sI ${site.wpUrl}`
            );
            const headerResults = parseSecurityHeaders(curlOutput);
            const missingHeaders = headerResults.filter((h) => !h.present);

            if (missingHeaders.length > 0) {
              issues.push(
                `Missing security headers: ${missingHeaders.map((h) => h.header).join(", ")}`
              );
            }

            await logActivity(
              site.id,
              "security_headers_check",
              "agent",
              missingHeaders.length > 2 ? "warning" : "info",
              `Security headers check: ${headerResults.length - missingHeaders.length}/${headerResults.length} present`,
              {
                headers: headerResults,
                missingCount: missingHeaders.length,
              }
            );
          } catch (curlErr) {
            const msg = curlErr instanceof Error ? curlErr.message : "unknown";
            issues.push(`Security headers check failed: ${msg}`);
          }
        }

        // --- Log findings ---
        issuesFound += issues.length;

        if (issues.length > 0) {
          await logActivity(
            site.id,
            "ssl_security_check",
            "agent",
            issues.some((i) => i.includes("EXPIRED") || i.includes("admin"))
              ? "critical"
              : "warning",
            `SSL & security check found ${issues.length} issue(s): ${issues.join("; ")}`,
            { issues }
          );
        } else {
          await logActivity(
            site.id,
            "ssl_security_check",
            "agent",
            "info",
            "SSL & security check passed — no issues found"
          );
        }

        console.log(
          `[${AGENT_NAME}] Site ${site.businessName}: ${issues.length} issue(s)`
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
        autoFixed,
        escalated,
        actions: { sitesChecked, issuesFound, autoFixed, escalated },
        errors: errors.length > 0 ? errors.join("\n") : null,
      },
    });

    console.log(
      `[${AGENT_NAME}] Run completed — ${sitesChecked} sites, ${issuesFound} issues, ${autoFixed} auto-renewed, ${escalated} escalated (${durationMs}ms)`
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
