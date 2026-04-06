// =============================================================================
// SEO Agent
// Configures Yoast SEO meta titles and descriptions for all pages.
// Uses WP-CLI to set post meta: _yoast_wpseo_title, _yoast_wpseo_metadesc
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";
import { completeAgent } from "@/lib/queue";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SEOJobData {
  buildId: string;
  blueprintId: string;
}

// ---------------------------------------------------------------------------
// Process SEO job
// ---------------------------------------------------------------------------

export async function processSEOJob(job: Job<SEOJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "seo",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    // Engine builds skip SEO agent (no WordPress/Yoast to configure)
    const buildCheck = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      select: { generatorType: true },
    });
    const generatorType =
      (buildCheck as Record<string, unknown>).generatorType as string ??
      "gutenberg";

    if (generatorType === "engine") {
      console.log(`[seo] Build ${buildId}: skipping (engine build — no WP/Yoast)`);
      await prisma.build.update({
        where: { id: buildId },
        data: { currentAgent: "seo", progress: 65 },
      });
      const durationMs = Date.now() - startTime;
      await prisma.agentLog.update({
        where: { id: agentLog.id },
        data: { status: "COMPLETED", durationMs, completedAt: new Date() },
      });
      await completeAgent(buildId, blueprintId, "seo");
      return { skipped: true, reason: "engine build", durationMs };
    }

    await prisma.build.update({
      where: { id: buildId },
      data: { currentAgent: "seo", progress: 60 },
    });

    // Load Blueprint and Site
    const blueprint = await prisma.blueprint.findUniqueOrThrow({
      where: { id: blueprintId },
    });

    const build = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
    });

    const businessInfo = blueprint.businessInfo as { name: string; tagline: string; description: string };
    const seoData = blueprint.seoData as { focusKeywords: string[]; schemaType: string; metaDescription: string } | null;
    const pages = await prisma.page.findMany({
      where: { siteId: build.siteId! },
    });

    const wp = getExecutor(build.siteId ?? undefined);

    // Set SEO meta for each page
    let pagesProcessed = 0;
    for (const page of pages) {
      // Get the WordPress page ID by slug
      try {
        const wpPageIdStr = await wp.execute(
          `post list --post_type=page --name="${escapeShell(page.slug)}" --field=ID --format=ids`
        );
        const wpPageId = parseInt(wpPageIdStr.trim(), 10);
        if (isNaN(wpPageId)) continue;

        // Build meta title: "Page Title | Business Name"
        const metaTitle = `${page.title} | ${businessInfo.name}`;

        // Build meta description
        let metaDesc = "";
        if (page.slug === "home") {
          metaDesc = seoData?.metaDescription ?? `${businessInfo.name} — ${businessInfo.tagline}. ${businessInfo.description.slice(0, 120)}`;
        } else if (page.slug === "contact") {
          metaDesc = `Contact ${businessInfo.name}. Get in touch for a free quote or consultation.`;
        } else if (page.slug === "services") {
          metaDesc = `Professional services offered by ${businessInfo.name}. Quality you can trust.`;
        } else if (page.slug === "about") {
          metaDesc = `Learn about ${businessInfo.name}. ${businessInfo.description.slice(0, 100)}`;
        } else {
          metaDesc = `${page.title} — ${businessInfo.name}`;
        }

        // Set Yoast meta via post meta
        await wp.execute(
          `post meta update ${wpPageId} _yoast_wpseo_title "${escapeShell(metaTitle)}"`
        );
        await wp.execute(
          `post meta update ${wpPageId} _yoast_wpseo_metadesc "${escapeShell(metaDesc.slice(0, 160))}"`
        );

        // Update our DB record
        await prisma.page.update({
          where: { id: page.id },
          data: { metaTitle, metaDesc },
        });

        pagesProcessed++;
      } catch (err) {
        console.error(`[seo] Failed to set meta for page "${page.slug}":`, err);
      }
    }

    // Set site-level SEO: blogname and blogdescription
    await wp.execute(`option update blogname "${escapeShell(businessInfo.name)}"`);
    await wp.execute(`option update blogdescription "${escapeShell(businessInfo.tagline)}"`);

    // Generate LocalBusiness JSON-LD structured data
    const bpBusinessInfo = blueprint.businessInfo as {
      name: string; tagline: string; description: string;
      phone?: string; email?: string; location?: string;
    };
    const bpContactPrefs = blueprint.contactPrefs as { phone?: string; email?: string } | null;
    const bpSocialMedia = blueprint.socialMedia as { facebook?: string; instagram?: string } | null;

    const jsonLdSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": seoData?.schemaType || "LocalBusiness",
      name: bpBusinessInfo.name,
      description: bpBusinessInfo.description?.slice(0, 250) || bpBusinessInfo.tagline,
      url: build.siteId ? (await prisma.site.findUnique({ where: { id: build.siteId }, select: { wpUrl: true } }))?.wpUrl : undefined,
    };

    if (bpBusinessInfo.phone || bpContactPrefs?.phone) {
      jsonLdSchema.telephone = bpBusinessInfo.phone || bpContactPrefs?.phone;
    }
    if (bpBusinessInfo.email || bpContactPrefs?.email) {
      jsonLdSchema.email = bpBusinessInfo.email || bpContactPrefs?.email;
    }
    if (bpBusinessInfo.location) {
      jsonLdSchema.address = {
        "@type": "PostalAddress",
        streetAddress: bpBusinessInfo.location,
      };
    }

    const sameAs: string[] = [];
    if (bpSocialMedia?.facebook) sameAs.push(bpSocialMedia.facebook);
    if (bpSocialMedia?.instagram) sameAs.push(bpSocialMedia.instagram);
    if (sameAs.length > 0) {
      jsonLdSchema.sameAs = sameAs;
    }

    try {
      const schemaJson = JSON.stringify(jsonLdSchema);
      await wp.writeFile("/tmp/xusmo-jsonld.json", schemaJson);
      await wp.execute(
        `eval "update_option('xusmo_jsonld_schema', file_get_contents('/tmp/xusmo-jsonld.json'));"`
      );
      console.log("[seo] JSON-LD schema saved.");
    } catch (jsonldErr) {
      console.warn("[seo] JSON-LD generation failed (non-fatal):", jsonldErr);
    }

    // Update build status
    await prisma.build.update({
      where: { id: buildId },
      data: { status: "SEO_DONE", progress: 70 },
    });

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { pagesProcessed } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    // Queue next agent (qa)
    await completeAgent(buildId, blueprintId, "seo");

    return { pagesProcessed, durationMs };
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
      data: { status: "FAILED", failureReason: error instanceof Error ? error.message : "SEO configuration failed", failedAt: new Date() },
    });

    throw error;
  }
}

function escapeShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createSEOWorker(connection: { host: string; port: number }) {
  return new Worker<SEOJobData>("seo", processSEOJob, {
    connection,
    concurrency: 2,
  });
}
