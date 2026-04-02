// =============================================================================
// Site Health Monitoring
// Runs periodic checks on live sites via WP-CLI.
// =============================================================================

import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface HealthReport {
  siteId: string;
  businessName: string;
  siteUrl: string | null;
  checks: HealthCheck[];
  allPassed: boolean;
  checkedAt: string;
}

// ---------------------------------------------------------------------------
// Check single site health
// ---------------------------------------------------------------------------

export async function checkSiteHealth(siteId: string): Promise<HealthReport> {
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: { build: { select: { id: true } } },
  });

  const wp = getExecutor(siteId);
  const checks: HealthCheck[] = [];

  // 1. Is WordPress responsive?
  try {
    const siteurl = await wp.execute("option get siteurl");
    checks.push({
      name: "responsive",
      passed: siteurl.trim().length > 0,
      details: `Site URL: ${siteurl.trim()}`,
    });
  } catch (err) {
    checks.push({
      name: "responsive",
      passed: false,
      details: `WordPress not responding: ${err instanceof Error ? err.message : "unknown"}`,
    });
  }

  // 2. Plugin update count
  try {
    const updateCount = await wp.execute(
      "plugin list --update=available --format=count"
    );
    const count = parseInt(updateCount.trim(), 10) || 0;
    checks.push({
      name: "plugin_updates",
      passed: count === 0,
      details: count > 0 ? `${count} plugin(s) need updating` : "All plugins up to date",
    });
  } catch {
    checks.push({
      name: "plugin_updates",
      passed: true,
      details: "Could not check plugin updates",
    });
  }

  // 3. Core update available
  try {
    const coreUpdate = await wp.execute("core check-update --format=count");
    const hasUpdate = parseInt(coreUpdate.trim(), 10) > 0;
    checks.push({
      name: "core_update",
      passed: !hasUpdate,
      details: hasUpdate ? "WordPress core update available" : "Core is up to date",
    });
  } catch {
    checks.push({
      name: "core_update",
      passed: true,
      details: "Could not check core updates",
    });
  }

  // 4. Database size
  try {
    const dbSize = await wp.execute("db size --format=json");
    const sizeData = JSON.parse(dbSize);
    const sizeMB = sizeData?.size_mb ?? "?";
    checks.push({
      name: "db_size",
      passed: true,
      details: `Database size: ${sizeMB} MB`,
    });
  } catch {
    // db size command may not return JSON, try raw
    try {
      const dbSize = await wp.execute("db size");
      checks.push({
        name: "db_size",
        passed: true,
        details: `Database: ${dbSize.trim().slice(0, 100)}`,
      });
    } catch {
      checks.push({
        name: "db_size",
        passed: true,
        details: "Could not check database size",
      });
    }
  }

  // 5. Page count (basic content check)
  try {
    const pageCount = await wp.execute(
      "post list --post_type=page --post_status=publish --format=count"
    );
    const count = parseInt(pageCount.trim(), 10) || 0;
    checks.push({
      name: "page_count",
      passed: count > 0,
      details: `${count} published page(s)`,
    });
  } catch {
    checks.push({
      name: "page_count",
      passed: false,
      details: "Could not count pages",
    });
  }

  const allPassed = checks.every((c) => c.passed);

  // Log result
  if (site.build?.id) {
    await prisma.agentLog.create({
      data: {
        buildId: site.build.id,
        agentName: "monitoring",
        status: allPassed ? "COMPLETED" : "FAILED",
        output: { checks, allPassed } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        completedAt: new Date(),
      },
    });
  }

  // Update site lastCheckedAt
  await prisma.site.update({
    where: { id: siteId },
    data: { lastCheckedAt: new Date() },
  });

  return {
    siteId: site.id,
    businessName: site.businessName,
    siteUrl: site.wpUrl,
    checks,
    allPassed,
    checkedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Check all live sites
// ---------------------------------------------------------------------------

export async function checkAllSites(): Promise<{
  total: number;
  healthy: number;
  issues: number;
  reports: HealthReport[];
}> {
  const liveSites = await prisma.site.findMany({
    where: { status: "LIVE" },
    select: { id: true },
  });

  const reports: HealthReport[] = [];
  let healthy = 0;
  let issues = 0;

  for (const site of liveSites) {
    try {
      const report = await checkSiteHealth(site.id);
      reports.push(report);
      if (report.allPassed) healthy++;
      else issues++;
    } catch (err) {
      reports.push({
        siteId: site.id,
        businessName: "Error",
        siteUrl: null,
        checks: [
          {
            name: "health_check",
            passed: false,
            details: err instanceof Error ? err.message : "Unknown error",
          },
        ],
        allPassed: false,
        checkedAt: new Date().toISOString(),
      });
      issues++;
    }
  }

  return {
    total: liveSites.length,
    healthy,
    issues,
    reports,
  };
}
