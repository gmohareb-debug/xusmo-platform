// =============================================================================
// Asset Agent
// Handles images for built sites. MVP uses placeholder Cover blocks with
// solid colors from the Blueprint's primaryColors. Later: AI image generation.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";
import { completeAgent } from "@/lib/queue";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AssetJobData {
  buildId: string;
  blueprintId: string;
}

interface DesignPrefs {
  primaryColors: string[];
  tone: string;
  imageryThemes: string[];
}

// ---------------------------------------------------------------------------
// Gutenberg Cover Block (solid color with text overlay)
// ---------------------------------------------------------------------------

function coverBlock(
  text: string,
  bgColor: string,
  textColor = "#ffffff",
  level: 1 | 2 | 3 = 2
): string {
  return `<!-- wp:cover {"customOverlayColor":"${bgColor}","isDark":true} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim" style="background-color:${bgColor}"></span><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":${level},"style":{"color":{"text":"${textColor}"}}} -->
<h${level} class="wp-block-heading has-text-align-center has-text-color" style="color:${textColor}">${escapeHtml(text)}</h${level}>
<!-- /wp:heading --></div></div>
<!-- /wp:cover -->`;
}

// ---------------------------------------------------------------------------
// Colored group block (for section backgrounds)
// ---------------------------------------------------------------------------

function coloredGroup(
  inner: string,
  bgColor: string
): string {
  return `<!-- wp:group {"style":{"color":{"background":"${bgColor}"}}} -->
<div class="wp-block-group has-background" style="background-color:${bgColor}">${inner}</div>
<!-- /wp:group -->`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Determine which image blocks each page needs
// ---------------------------------------------------------------------------

function getPageImageBlocks(
  pageSlug: string,
  businessName: string,
  tagline: string,
  colors: string[]
): string[] {
  const primary = colors[0] ?? "#1a1a2e";
  const secondary = colors[1] ?? "#e94560";
  const blocks: string[] = [];

  switch (pageSlug) {
    case "home":
      // Hero cover block
      blocks.push(
        coverBlock(`${businessName}\n${tagline}`, primary, "#ffffff", 1)
      );
      break;

    case "about":
      // Team/owner placeholder
      blocks.push(
        coloredGroup(
          `<!-- wp:heading {"textAlign":"center","level":3,"style":{"color":{"text":"#ffffff"}}} -->
<h3 class="wp-block-heading has-text-align-center has-text-color" style="color:#ffffff">Meet Our Team</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#cccccc"}}} -->
<p class="has-text-align-center has-text-color" style="color:#cccccc">Team photos coming soon</p>
<!-- /wp:paragraph -->`,
          secondary
        )
      );
      break;

    case "services":
      // Service icon-style header
      blocks.push(coverBlock("Our Professional Services", primary));
      break;

    case "portfolio":
    case "gallery":
      // Gallery placeholders (skip for now — plan says skip until real images)
      break;

    default:
      break;
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Process asset job
// ---------------------------------------------------------------------------

export async function processAssetJob(job: Job<AssetJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "asset",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    // Engine builds skip asset agent (images handled by engine components)
    const buildCheck = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      select: { generatorType: true },
    });
    const generatorType =
      (buildCheck as Record<string, unknown>).generatorType as string ??
      "gutenberg";

    if (generatorType === "engine") {
      console.log(`[asset] Build ${buildId}: skipping (engine build)`);
      await prisma.build.update({
        where: { id: buildId },
        data: { currentAgent: "asset", progress: 80 },
      });
      const durationMs = Date.now() - startTime;
      await prisma.agentLog.update({
        where: { id: agentLog.id },
        data: { status: "COMPLETED", durationMs, completedAt: new Date() },
      });
      await completeAgent(buildId, blueprintId, "asset");
      return { skipped: true, reason: "engine build", durationMs };
    }

    await prisma.build.update({
      where: { id: buildId },
      data: { currentAgent: "asset", progress: 72 },
    });

    // Load Blueprint and Site
    const blueprint = await prisma.blueprint.findUniqueOrThrow({
      where: { id: blueprintId },
    });

    const build = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
    });

    const businessInfo = blueprint.businessInfo as { name: string; tagline: string };
    const designPrefs = blueprint.designPrefs as unknown as DesignPrefs;
    const colors = designPrefs.primaryColors ?? ["#1a1a2e", "#e94560", "#0f3460"];

    const pages = await prisma.page.findMany({
      where: { siteId: build.siteId! },
    });

    const wp = getExecutor(build.siteId ?? undefined);
    let pagesUpdated = 0;

    for (const page of pages) {
      const imageBlocks = getPageImageBlocks(
        page.slug,
        businessInfo.name,
        businessInfo.tagline,
        colors
      );

      if (imageBlocks.length === 0) continue;

      try {
        // Get WordPress page ID
        const wpPageIdStr = await wp.execute(
          `post list --post_type=page --name="${escapeShell(page.slug)}" --field=ID --format=ids`
        );
        const wpPageId = parseInt(wpPageIdStr.trim(), 10);
        if (isNaN(wpPageId)) continue;

        // Get existing content
        const existingContent = await wp.execute(
          `post get ${wpPageId} --field=post_content`
        );

        // Prepend image blocks to existing content
        const newContent = imageBlocks.join("\n\n") + "\n\n" + existingContent;
        await wp.writeFile("/tmp/xusmo-page-content.html", newContent);
        await wp.execute(
          `eval "wp_update_post(['ID' => ${wpPageId}, 'post_content' => file_get_contents('/tmp/xusmo-page-content.html')]);"`
        );

        // Actually — simpler approach: use wp post update with base64
        // The eval approach is tricky. Let's use a file-based approach:
        // Write to temp file, then update post content from it.
        // For Docker, we can pipe content directly.

        pagesUpdated++;
      } catch (err) {
        console.error(`[asset] Failed to update page "${page.slug}":`, err);
      }
    }

    // Update build status
    await prisma.build.update({
      where: { id: buildId },
      data: { status: "ASSETS_DONE", progress: 75 },
    });

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { pagesUpdated } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    // Queue next agent (qa)
    await completeAgent(buildId, blueprintId, "asset");

    return { pagesUpdated, durationMs };
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
        failureReason: error instanceof Error ? error.message : "Asset processing failed",
        failedAt: new Date(),
      },
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

export function createAssetWorker(connection: { host: string; port: number }) {
  return new Worker<AssetJobData>("asset", processAssetJob, {
    connection,
    concurrency: 2,
  });
}
