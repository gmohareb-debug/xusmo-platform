// =============================================================================
// Plugin Updater Agent
// Runs every 6 hours to check and update plugins on managed sites.
// LOW risk plugins are auto-updated; MEDIUM risk require admin approval;
// HIGH risk are logged as warnings only.
// Usage: import { runPluginUpdater } from "@/workers/agents/plugin-updater";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { sshExec, getSiteConnection } from "@/workers/agents/ssh";

const AGENT_NAME = "plugin-updater";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WpPlugin {
  name: string;
  status: string;
  version: string;
  update_version?: string;
}

// ---------------------------------------------------------------------------
// Plugin Updater runner
// ---------------------------------------------------------------------------

export async function runPluginUpdater(): Promise<void> {
  console.log(`[${AGENT_NAME}] Starting plugin update run...`);

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

    console.log(`[${AGENT_NAME}] Found ${sites.length} managed sites`);

    for (const site of sites) {
      try {
        sitesChecked++;

        // Resolve SSH connection
        const conn = await getSiteConnection(site.id);

        // Get plugin list with update info
        const pluginJson = await sshExec(
          conn.host,
          conn.user,
          `cd ${conn.wpPath} && wp plugin list --format=json --fields=name,status,version,update_version`
        );
        const plugins: WpPlugin[] = JSON.parse(pluginJson);

        // Filter plugins that have updates available
        const updatable = plugins.filter((p) => p.update_version);

        if (updatable.length === 0) {
          console.log(`[${AGENT_NAME}] Site ${site.businessName}: all plugins up to date`);
          continue;
        }

        issuesFound += updatable.length;
        console.log(
          `[${AGENT_NAME}] Site ${site.businessName}: ${updatable.length} plugin(s) need updates`
        );

        for (const plugin of updatable) {
          try {
            // Look up PluginCatalog for risk level
            const catalog = await prisma.pluginCatalog.findUnique({
              where: { slug: plugin.name },
            });
            const riskLevel = catalog?.riskLevel ?? "MEDIUM";

            if (riskLevel === "LOW") {
              // --- AUTO-UPDATE ---
              try {
                await sshExec(
                  conn.host,
                  conn.user,
                  `cd ${conn.wpPath} && wp plugin update ${plugin.name}`
                );
                autoFixed++;

                await logActivity(
                  site.id,
                  "plugin_auto_update",
                  "agent",
                  "info",
                  `Auto-updated plugin ${plugin.name} from ${plugin.version} to ${plugin.update_version}`,
                  {
                    pluginSlug: plugin.name,
                    oldVersion: plugin.version,
                    newVersion: plugin.update_version,
                    riskLevel,
                  }
                );

                console.log(
                  `[${AGENT_NAME}] Auto-updated ${plugin.name} ${plugin.version} -> ${plugin.update_version} on ${site.businessName}`
                );
              } catch (updateErr) {
                const msg = updateErr instanceof Error ? updateErr.message : "unknown";
                errors.push(
                  `Failed to auto-update ${plugin.name} on site ${site.id}: ${msg}`
                );
                await logActivity(
                  site.id,
                  "plugin_update_failed",
                  "agent",
                  "warning",
                  `Failed to auto-update plugin ${plugin.name}: ${msg}`,
                  { pluginSlug: plugin.name, error: msg }
                );
              }
            } else if (riskLevel === "MEDIUM") {
              // --- REQUIRE ADMIN APPROVAL ---
              await prisma.agentApproval.create({
                data: {
                  agentId: agent.id,
                  action: `Update plugin ${plugin.name} from ${plugin.version} to ${plugin.update_version} on ${site.businessName}`,
                  reason: `Medium-risk plugin update requires admin approval. Plugin: ${plugin.name}, Current: ${plugin.version}, Available: ${plugin.update_version}`,
                  priority: "NORMAL",
                  metadata: {
                    siteId: site.id,
                    businessName: site.businessName,
                    pluginSlug: plugin.name,
                    currentVersion: plugin.version,
                    updateVersion: plugin.update_version,
                    riskLevel,
                  },
                },
              });
              escalated++;

              console.log(
                `[${AGENT_NAME}] Escalated ${plugin.name} update on ${site.businessName} (MEDIUM risk)`
              );
            } else {
              // --- HIGH RISK: LOG WARNING ONLY ---
              await logActivity(
                site.id,
                "plugin_update_warning",
                "agent",
                "warning",
                `High-risk plugin ${plugin.name} has update available: ${plugin.version} -> ${plugin.update_version}. Manual review required.`,
                {
                  pluginSlug: plugin.name,
                  currentVersion: plugin.version,
                  updateVersion: plugin.update_version,
                  riskLevel,
                }
              );

              console.log(
                `[${AGENT_NAME}] HIGH risk — logged warning for ${plugin.name} on ${site.businessName}`
              );
            }

            // Update SitePlugin.updateAvailable
            await prisma.sitePlugin.upsert({
              where: { siteId_slug: { siteId: site.id, slug: plugin.name } },
              update: {
                version: plugin.version,
                updateAvailable: plugin.update_version ?? null,
                lastCheckedAt: new Date(),
              },
              create: {
                siteId: site.id,
                slug: plugin.name,
                version: plugin.version,
                isActive: plugin.status === "active",
                updateAvailable: plugin.update_version ?? null,
                lastCheckedAt: new Date(),
                pluginId: catalog?.id ?? null,
              },
            });
          } catch (pluginErr) {
            const msg = pluginErr instanceof Error ? pluginErr.message : "unknown";
            errors.push(`Plugin ${plugin.name} on site ${site.id}: ${msg}`);
          }
        }
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
      `[${AGENT_NAME}] Run completed — ${sitesChecked} sites, ${issuesFound} updates found, ${autoFixed} auto-fixed, ${escalated} escalated (${Date.now() - startTime}ms)`
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
