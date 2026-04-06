// =============================================================================
// Publishing Agent
// Promotes a site from staging to live after customer approval.
// Handles: WordPress indexing, subdomain assignment, sitemap, SSL flag.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";
import { sendNotification } from "@/lib/notifications/email";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PublishJobData {
  buildId: string;
  blueprintId: string;
}

// ---------------------------------------------------------------------------
// Process publishing job
// ---------------------------------------------------------------------------

export async function processPublishJob(job: Job<PublishJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "publishing",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    // Load build with site and subscription
    const build = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      include: {
        site: { include: { domain: true } },
        blueprint: { select: { leadId: true } },
      },
    });

    if (build.status !== "APPROVED") {
      throw new Error(`Build is ${build.status}, expected APPROVED`);
    }
    if (!build.site) {
      throw new Error("No site linked to build");
    }

    const site = build.site;

    // Check subscription is active
    const subscription = await prisma.subscription.findFirst({
      where: { siteId: site.id, status: "ACTIVE" },
    });

    // Allow publishing even without subscription in dev mode
    const isDev = process.env.NODE_ENV !== "production";
    if (!subscription && !isDev) {
      throw new Error("No active subscription found. Payment required before publishing.");
    }

    await prisma.build.update({
      where: { id: buildId },
      data: { status: "PUBLISHING", currentAgent: "publishing" },
    });

    const wp = getExecutor(site.id);
    const steps: string[] = [];

    // 1. Enable search engine indexing
    try {
      await wp.execute("option update blog_public 1");
      steps.push("Enabled search engine indexing");
    } catch (err) {
      steps.push(`Warning: Could not enable indexing — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 2. Assign URL
    let siteUrl = site.wpUrl;
    if (site.domain?.domainName && site.domain.status === "ACTIVE") {
      // Custom domain
      siteUrl = `https://${site.domain.domainName}`;
      try {
        await wp.execute(`option update siteurl "${siteUrl}"`);
        await wp.execute(`option update home "${siteUrl}"`);
        steps.push(`Set custom domain: ${siteUrl}`);
      } catch (err) {
        steps.push(`Warning: Could not set custom domain — ${err instanceof Error ? err.message : "unknown"}`);
      }
    } else {
      // Assign subdomain slug
      const slug = site.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40);
      siteUrl = isDev
        ? `http://localhost:8088/${slug}`
        : `https://${slug}.xusmo.io`;
      steps.push(`Assigned URL: ${siteUrl}`);
    }

    // 3. Generate sitemap via Yoast
    try {
      await wp.execute("yoast index --reindex");
      steps.push("Generated Yoast sitemap");
    } catch {
      // Yoast CLI may not be available
      steps.push("Skipped sitemap generation (Yoast CLI not available)");
    }

    // 4. Set permalink structure
    try {
      await wp.execute('rewrite structure "/%postname%/" --hard');
      await wp.execute("rewrite flush --hard");
      steps.push("Set pretty permalinks");
    } catch (err) {
      steps.push(`Warning: Permalink setup — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 5. Update Site record
    await prisma.site.update({
      where: { id: site.id },
      data: {
        status: "LIVE",
        wpUrl: siteUrl,
        sslActive: !isDev,
        publishedAt: new Date(),
      },
    });
    steps.push("Site status set to LIVE");

    // 6. Update Build record
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "PUBLISHED",
        currentAgent: "publishing",
        completedAt: new Date(),
      },
    });

    // 7. Update Lead status
    if (build.blueprint?.leadId) {
      await prisma.lead.update({
        where: { id: build.blueprint.leadId },
        data: { status: "PUBLISHED" },
      });
    }

    steps.push("Build marked as PUBLISHED");

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { steps, siteUrl } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    console.log(`[publishing] Site published: ${siteUrl} (${durationMs}ms)`);

    // Send notification
    sendNotification(site.userId, "SITE_PUBLISHED", {
      businessName: site.businessName,
      siteUrl: siteUrl ?? "",
    }).catch((err) => console.error("[publishing] Notification error:", err));

    // Queue security agent
    const { securityQueue } = await import("@/lib/queue");
    await securityQueue.add(
      "security-job",
      { buildId, blueprintId },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );
    console.log("[publishing] Queued security agent");

    return { siteUrl, steps, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs,
        completedAt: new Date(),
      },
    });

    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "FAILED",
        failureReason: error instanceof Error ? error.message : "Publishing failed",
        failedAt: new Date(),
      },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createPublishingWorker(connection: { host: string; port: number }) {
  return new Worker<PublishJobData>("publish", processPublishJob, {
    connection,
    concurrency: 1,
  });
}
