// =============================================================================
// Performance Agent
// Runs weekly on Sunday at 2am for PREMIUM managed LIVE sites only.
// Performs a Lighthouse audit (placeholder), stores the score in
// SiteHealthCheck, updates site.lighthouseScore, and creates AgentApprovals
// with optimization suggestions when the score falls below 85.
// Usage: import { runPerformance } from "@/workers/agents/performance";
// =============================================================================

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

const AGENT_NAME = "performance";

// ---------------------------------------------------------------------------
// Performance runner
// ---------------------------------------------------------------------------

export async function runPerformance(): Promise<void> {
  console.log(`[${AGENT_NAME}] Starting performance audit run...`);

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
    // Get only PREMIUM managed LIVE sites
    const sites = await prisma.site.findMany({
      where: {
        managed: true,
        status: "LIVE",
        managedPlan: "PREMIUM",
      },
    });

    console.log(`[${AGENT_NAME}] Found ${sites.length} PREMIUM managed LIVE sites`);

    for (const site of sites) {
      try {
        sitesChecked++;

        // --- Lighthouse audit placeholder ---
        // In production this would run:
        //   const lhr = await lighthouse(site.wpUrl, { port: chromePort });
        //   const score = Math.round(lhr.lhr.categories.performance.score * 100);
        // For now we use a mock score based on existing data or a reasonable default.

        console.log(
          `[${AGENT_NAME}] Running Lighthouse audit for ${site.businessName} (${site.wpUrl ?? "no URL"})...`
        );
        console.log(
          `[${AGENT_NAME}] NOTE: Lighthouse integration is a placeholder — using mock score`
        );

        // Mock score: use existing lighthouseScore +/- variance, or 75 as baseline
        const baseScore = site.lighthouseScore ?? 75;
        const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const lighthouseScore = Math.max(0, Math.min(100, baseScore + variance));

        // --- Store in SiteHealthCheck ---
        await prisma.siteHealthCheck.create({
          data: {
            siteId: site.id,
            lighthouseScore,
            healthScore: site.healthScore,
            issues: lighthouseScore < 85
              ? [`Lighthouse score ${lighthouseScore} is below the 85 threshold`]
              : undefined,
          },
        });

        // --- Update site.lighthouseScore ---
        await prisma.site.update({
          where: { id: site.id },
          data: {
            lighthouseScore,
            lastCheckedAt: new Date(),
          },
        });

        // --- Create AgentApproval if score < 85 ---
        if (lighthouseScore < 85) {
          issuesFound++;

          const suggestions: string[] = [];
          if (lighthouseScore < 50) {
            suggestions.push("Major performance overhaul required");
            suggestions.push("Audit render-blocking resources and large payloads");
            suggestions.push("Consider enabling server-side caching (Redis object cache)");
          }
          if (lighthouseScore < 70) {
            suggestions.push("Optimize images: convert to WebP, add lazy loading");
            suggestions.push("Minify CSS/JS and defer non-critical scripts");
            suggestions.push("Enable browser caching via .htaccess or server config");
          }
          if (lighthouseScore < 85) {
            suggestions.push("Review Largest Contentful Paint (LCP) element");
            suggestions.push("Check for excessive DOM size or layout shifts");
            suggestions.push("Consider preloading critical fonts and above-the-fold images");
          }

          await prisma.agentApproval.create({
            data: {
              agentId: agent.id,
              action: `Performance optimization needed for ${site.businessName}`,
              reason: `Lighthouse score is ${lighthouseScore}/100 (below 85 threshold). Optimization recommended.`,
              priority: lighthouseScore < 50 ? "URGENT" : "NORMAL",
              metadata: {
                siteId: site.id,
                businessName: site.businessName,
                lighthouseScore,
                wpUrl: site.wpUrl,
                suggestions,
              },
            },
          });
          escalated++;

          await logActivity(
            site.id,
            "performance_audit",
            "agent",
            lighthouseScore < 50 ? "critical" : "warning",
            `Lighthouse score ${lighthouseScore}/100 — optimization suggestions created`,
            { lighthouseScore, suggestions }
          );

          console.log(
            `[${AGENT_NAME}] Site ${site.businessName}: score=${lighthouseScore} (BELOW THRESHOLD) — approval created`
          );
        } else {
          await logActivity(
            site.id,
            "performance_audit",
            "agent",
            "info",
            `Lighthouse score ${lighthouseScore}/100 — meets threshold`,
            { lighthouseScore }
          );

          console.log(
            `[${AGENT_NAME}] Site ${site.businessName}: score=${lighthouseScore} (OK)`
          );
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
        escalated,
        actions: { sitesChecked, issuesFound, escalated, note: "Lighthouse is a placeholder mock" },
        errors: errors.length > 0 ? errors.join("\n") : null,
      },
    });

    console.log(
      `[${AGENT_NAME}] Run completed — ${sitesChecked} PREMIUM sites, ${issuesFound} below threshold, ${escalated} escalated (${durationMs}ms)`
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
