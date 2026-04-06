// =============================================================================
// Builder Agent
// Takes content from Content Agent and builds the WordPress site.
// Applies full theme.json from archetype preset, enqueues Google Fonts,
// and provisions pages via WP-CLI.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { provisionSite } from "@/lib/wordpress/provision";
import { buildThemeJson } from "@/lib/wordpress/fonts";
import { getThemePreset, mergeUserColors } from "@/lib/wordpress/theme-presets";
import { getExecutor } from "@/lib/wordpress/ssh";
import { completeAgent } from "@/lib/queue";
import type { Archetype } from "@/lib/classification/archetypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BuilderJobData {
  buildId: string;
  blueprintId: string;
}

interface DesignPrefs {
  primaryColors: string[];
  tone: string;
  fontPreference: string;
  layoutDensity: string;
  imageryThemes: string[];
}

// ---------------------------------------------------------------------------
// Process builder job
// ---------------------------------------------------------------------------

export async function processBuilderJob(job: Job<BuilderJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "builder",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    // Check generator type — engine builds don't need WordPress provisioning
    const existingBuild = await prisma.build.findUnique({
      where: { id: buildId },
      select: { siteId: true, status: true, generatorType: true },
    });
    const generatorType =
      (existingBuild as Record<string, unknown> | null)?.generatorType as
        | string
        | undefined ?? "gutenberg";

    if (generatorType === "engine" || existingBuild?.siteId) {
      const reason = generatorType === "engine"
        ? "engine build — WP deferred to publish"
        : "dev pipeline already provisioned";
      console.log(
        `[builder] Build ${buildId}: skipping (${reason})`
      );
      const durationMs = Date.now() - startTime;

      // For engine builds, mark progress and status
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: "BUILD_DONE",
          currentAgent: "builder",
          progress: 50,
        },
      });

      await prisma.agentLog.update({
        where: { id: agentLog.id },
        data: { status: "COMPLETED", durationMs, completedAt: new Date() },
      });
      await completeAgent(buildId, blueprintId, "build");
      return { siteId: existingBuild?.siteId ?? null, pagesCreated: 0, durationMs };
    }

    // ── Gutenberg path: full WordPress provisioning ──

    // Update build status
    await prisma.build.update({
      where: { id: buildId },
      data: { status: "IN_PROGRESS", currentAgent: "builder", progress: 30 },
    });

    // Provision the WordPress site
    const result = await provisionSite(blueprintId);

    // Apply archetype-based theme
    try {
      const blueprint = await prisma.blueprint.findUnique({
        where: { id: blueprintId },
        include: { lead: { select: { archetype: true } } },
      });

      if (blueprint) {
        const archetype = (blueprint.lead.archetype ?? "SERVICE") as Archetype;
        const designPrefs = blueprint.designPrefs as unknown as DesignPrefs | null;

        // 1. Get the archetype preset
        let preset = getThemePreset(archetype);

        // 2. Merge user color preferences if they provided custom colors
        if (designPrefs?.primaryColors && designPrefs.primaryColors.length > 0) {
          preset = mergeUserColors(preset, designPrefs.primaryColors);
        }

        // 3. Build the full theme.json
        const themeJson = buildThemeJson(preset);
        const themeJsonStr = JSON.stringify(themeJson, null, "\t");

        const wp = getExecutor(result.site.id);

        // 4. Write theme.json — use writeFile (docker cp) to bypass shell quoting
        const themeDir = await wp.execute(`eval "echo get_stylesheet_directory();"`);
        await wp.writeFile(`${themeDir}/theme.json`, themeJsonStr);

        // 5. Enqueue Google Fonts via wp_options
        const fontsUrl = preset.googleFontsUrl;
        await wp.writeFile("/tmp/xusmo-fonts-url.txt", fontsUrl);
        await wp.execute(
          `eval "update_option('xusmo_google_fonts_url', trim(file_get_contents('/tmp/xusmo-fonts-url.txt')));"`
        );

        // 6. Set custom CSS variables for border radius and other custom properties
        const customCss = `:root {
  --sf-border-radius-sm: ${preset.borderRadius.small};
  --sf-border-radius-md: ${preset.borderRadius.medium};
  --sf-border-radius-lg: ${preset.borderRadius.large};
  --sf-border-radius-pill: ${preset.borderRadius.pill};
  --sf-section-padding: ${preset.sectionPadding};
}`;
        await wp.writeFile("/tmp/xusmo-custom-css.txt", customCss);
        await wp.execute(
          `eval "update_option('xusmo_custom_css', file_get_contents('/tmp/xusmo-custom-css.txt'));"`
        );

        console.log(
          `[builder] Theme applied: archetype=${archetype}, heading="${preset.fonts.heading}", body="${preset.fonts.body}", primary=${preset.colors.primary}`
        );
      }
    } catch (styleError) {
      console.error("[builder] Theme application error (non-fatal):", styleError);
    }

    // Link site to build
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "BUILD_DONE",
        siteId: result.site.id,
        currentAgent: "builder",
        progress: 50,
      },
    });

    // Complete agent log
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: {
          siteId: result.site.id,
          siteUrl: result.siteUrl,
          pagesCreated: result.pageIds.size,
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    // Queue next agent (seo)
    await completeAgent(buildId, blueprintId, "build");

    return { siteId: result.site.id, pagesCreated: result.pageIds.size, durationMs };
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
        failureReason: error instanceof Error ? error.message : "Build failed",
        failedAt: new Date(),
      },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createBuilderWorker(connection: { host: string; port: number }) {
  return new Worker<BuilderJobData>("build", processBuilderJob, {
    connection,
    concurrency: 2,
  });
}
