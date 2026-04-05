// =============================================================================
// Data Flywheel — Learning Signals
// Tracks 5 learning signals to continuously improve Xusmo:
// 1. Classification overrides
// 2. Feature additions/removals
// 3. Revision reasons
// 4. QA gate failures
// 5. Build duration by industry
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// 1. Classification Overrides
// ---------------------------------------------------------------------------

export async function logClassificationOverride(
  leadId: string,
  originalCode: string,
  correctedCode: string
) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { businessDescription: true },
  });

  // Store as an agent log on any associated build, or create a standalone log
  const build = await prisma.build.findFirst({
    where: { blueprint: { leadId } },
    select: { id: true },
  });

  if (build) {
    await prisma.agentLog.create({
      data: {
        buildId: build.id,
        agentName: "flywheel_classification",
        status: "COMPLETED",
        input: {
          leadId,
          originalCode,
          correctedCode,
          description: lead?.businessDescription?.slice(0, 500),
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        completedAt: new Date(),
      },
    });
  }

  console.log(
    `[flywheel] Classification override: ${originalCode} → ${correctedCode} (lead ${leadId})`
  );
}

// ---------------------------------------------------------------------------
// 2. Feature Additions/Removals
// ---------------------------------------------------------------------------

export async function logFeatureChange(
  leadId: string,
  industryCode: string,
  added: string[],
  removed: string[]
) {
  const build = await prisma.build.findFirst({
    where: { blueprint: { leadId } },
    select: { id: true },
  });

  if (build) {
    await prisma.agentLog.create({
      data: {
        buildId: build.id,
        agentName: "flywheel_features",
        status: "COMPLETED",
        input: {
          leadId,
          industryCode,
          featuresAdded: added,
          featuresRemoved: removed,
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        completedAt: new Date(),
      },
    });
  }

  console.log(
    `[flywheel] Feature change for ${industryCode}: +[${added.join(",")}] -[${removed.join(",")}]`
  );
}

// ---------------------------------------------------------------------------
// 3. Revision Stats
// ---------------------------------------------------------------------------

export async function getRevisionStats(dateRange?: { from: Date; to: Date }) {
  const where = dateRange
    ? { requestedAt: { gte: dateRange.from, lte: dateRange.to } }
    : {};

  const revisions = await prisma.revision.findMany({
    where,
    select: {
      requestType: true,
      status: true,
      site: {
        select: {
          industryId: true,
          archetype: true,
        },
      },
    },
  });

  // Group by type
  const byType = new Map<string, number>();
  const byIndustry = new Map<string, Map<string, number>>();

  for (const rev of revisions) {
    const type = rev.requestType ?? "unknown";
    byType.set(type, (byType.get(type) ?? 0) + 1);

    const industryId = rev.site.industryId ?? "unknown";
    if (!byIndustry.has(industryId)) {
      byIndustry.set(industryId, new Map());
    }
    const industryMap = byIndustry.get(industryId)!;
    industryMap.set(type, (industryMap.get(type) ?? 0) + 1);
  }

  return {
    total: revisions.length,
    byType: Object.fromEntries(byType),
    byIndustry: Object.fromEntries(
      [...byIndustry.entries()].map(([k, v]) => [k, Object.fromEntries(v)])
    ),
  };
}

// ---------------------------------------------------------------------------
// 4. QA Failure Stats
// ---------------------------------------------------------------------------

export async function getQAFailureStats(dateRange?: { from: Date; to: Date }) {
  const where = dateRange
    ? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
    : {};

  const reports = await prisma.qaReport.findMany({
    where,
    select: {
      passed: true,
      notes: true,
      build: {
        select: { industryId: true, archetype: true },
      },
    },
  });

  const total = reports.length;
  const failed = reports.filter((r) => !r.passed).length;
  const failureRate = total > 0 ? (failed / total) * 100 : 0;

  // Group failures by industry
  const failuresByIndustry = new Map<string, number>();
  for (const r of reports.filter((r) => !r.passed)) {
    const ind = r.build.industryId ?? "unknown";
    failuresByIndustry.set(ind, (failuresByIndustry.get(ind) ?? 0) + 1);
  }

  return {
    total,
    failed,
    passed: total - failed,
    failureRate: Math.round(failureRate * 100) / 100,
    failuresByIndustry: Object.fromEntries(failuresByIndustry),
  };
}

// ---------------------------------------------------------------------------
// 5. Build Duration Stats
// ---------------------------------------------------------------------------

export async function getBuildDurationStats(dateRange?: {
  from: Date;
  to: Date;
}) {
  const where: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    status: { in: ["PREVIEW_READY", "APPROVED", "PUBLISHED"] },
  };

  if (dateRange) {
    where.createdAt = { gte: dateRange.from, lte: dateRange.to };
  }

  const builds = await prisma.build.findMany({
    where,
    select: {
      industryId: true,
      totalBuildTime: true,
      archetype: true,
    },
  });

  // Group by industry
  const byIndustry = new Map<string, number[]>();
  for (const b of builds) {
    const ind = b.industryId ?? "unknown";
    if (!byIndustry.has(ind)) byIndustry.set(ind, []);
    byIndustry.get(ind)!.push(b.totalBuildTime);
  }

  const stats = [...byIndustry.entries()].map(([industryId, durations]) => ({
    industryId,
    avgDuration: Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length
    ),
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    buildCount: durations.length,
  }));

  // Sort by avg duration descending (slowest first)
  stats.sort((a, b) => b.avgDuration - a.avgDuration);

  return stats;
}

// ---------------------------------------------------------------------------
// Weekly Flywheel Report
// ---------------------------------------------------------------------------

export async function getFlywheelReport() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateRange = { from: thirtyDaysAgo, to: new Date() };

  // Classification overrides
  const overrideLogs = await prisma.agentLog.findMany({
    where: {
      agentName: "flywheel_classification",
      startedAt: { gte: thirtyDaysAgo },
    },
    select: { input: true },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  const overrides = overrideLogs.map((l) => {
    const input = l.input as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      original: input?.originalCode,
      corrected: input?.correctedCode,
      description: input?.description?.slice(0, 100),
    };
  });

  // Feature changes
  const featureLogs = await prisma.agentLog.findMany({
    where: {
      agentName: "flywheel_features",
      startedAt: { gte: thirtyDaysAgo },
    },
    select: { input: true },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  const featureChanges = featureLogs.map((l) => {
    const input = l.input as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      industryCode: input?.industryCode,
      added: input?.featuresAdded ?? [],
      removed: input?.featuresRemoved ?? [],
    };
  });

  // Other stats
  const [revisionStats, qaStats, durationStats] = await Promise.all([
    getRevisionStats(dateRange),
    getQAFailureStats(dateRange),
    getBuildDurationStats(dateRange),
  ]);

  // Industries ready for tier promotion (totalBuilds > 50)
  const tierPromotionCandidates = await prisma.industryDefault.findMany({
    where: { totalBuilds: { gte: 50 }, llmTier: { gt: 1 } },
    select: { industryCode: true, displayName: true, totalBuilds: true, llmTier: true },
  });

  return {
    period: "Last 30 days",
    classificationOverrides: overrides,
    featureChanges,
    revisionStats,
    qaStats,
    buildDurationStats: durationStats.slice(0, 10),
    tierPromotionCandidates,
  };
}
