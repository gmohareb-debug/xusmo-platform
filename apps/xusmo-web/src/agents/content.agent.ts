// =============================================================================
// Content Agent — Thin Prisma/BullMQ wrapper around @xusmo/gutenberg
// Loads blueprint from DB, delegates generation to the package, saves results.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/db";
import { completeAgent } from "@/lib/queue";
import { routeLLM } from "@/lib/llm/router";
import {
  generatePageContent,
  buildFallbackSlots,
  type GeneratePageContentOptions,
  type BlueprintBusinessInfo,
  type BlueprintService,
  type BlueprintPage,
  type BlueprintStory,
  type BlueprintTeamMember,
  type BlueprintTestimonial,
  type BlueprintFaq,
  type ContactPrefs,
  type DesignPackage,
  type Archetype,
  type LLMFunction,
} from "@xusmo/gutenberg";

// Re-export buildFallbackSlots for reassemble.ts
export { buildFallbackSlots };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentJobData {
  buildId: string;
  blueprintId: string;
  themePoolEntryId?: string | null;
  /** When true, skip queuing the next BullMQ agent (dev pipeline handles it inline) */
  skipQueue?: boolean;
}

// ---------------------------------------------------------------------------
// LLM adapter — wraps routeLLM to match the package's LLMFunction interface
// ---------------------------------------------------------------------------

const llmAdapter: LLMFunction = async (task, prompt, systemPrompt, industryCode) => {
  return routeLLM(task as any, prompt, systemPrompt, industryCode);
};

// ---------------------------------------------------------------------------
// Process content job — Pattern Hydration Pipeline
// ---------------------------------------------------------------------------

export async function processContentJob(job: Job<ContentJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "content",
      status: "STARTED",
      input: job.data as any,
    },
  });

  try {
    // Check generator type — engine builds use @xusmo/engine, not @xusmo/gutenberg
    const buildRecord = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      select: { generatorType: true },
    });
    const generatorType =
      (buildRecord as Record<string, unknown>).generatorType as string ??
      "gutenberg";

    if (generatorType === "engine") {
      return processEngineContentJob(job, agentLog.id, startTime);
    }

    // ── Gutenberg path (original) ──

    // Load Blueprint + Lead info
    const blueprint = await prisma.blueprint.findUniqueOrThrow({
      where: { id: blueprintId },
      include: {
        lead: {
          select: {
            industryName: true,
            archetype: true,
            industryId: true,
            industry: {
              select: {
                industryCode: true,
                isRegulated: true,
                defaultDisclaimers: true,
              },
            },
          },
        },
      },
    });

    // Reconstruct typed data from DB JSON columns
    const businessInfo = blueprint.businessInfo as unknown as BlueprintBusinessInfo;
    const services = blueprint.services as unknown as BlueprintService[];
    const pages = blueprint.pages as unknown as BlueprintPage[];
    const trustSignals = blueprint.trustSignals as unknown as Array<{ type: string; value: string }>;
    const contactPrefs = blueprint.contactPrefs as unknown as ContactPrefs;
    const story = (blueprint.story as unknown as BlueprintStory) ?? {
      foundingStory: "",
      differentiator: "",
      targetAudience: "",
      uniqueSellingPoint: "",
      certifications: "",
      serviceAreas: "",
    };
    const team = (blueprint.team as unknown as BlueprintTeamMember[]) ?? [];
    const testimonials = (blueprint.testimonials as unknown as BlueprintTestimonial[]) ?? [];
    const faqs = (blueprint.faqs as unknown as BlueprintFaq[]) ?? [];
    const businessHours = (blueprint.businessHours as string) ?? "";

    const industryName = blueprint.lead.industryName ?? "General Business";
    const archetype = (blueprint.lead.archetype ?? "SERVICE") as Archetype;
    const industryCode = blueprint.lead.industry?.industryCode;
    const isRegulated = blueprint.lead.industry?.isRegulated ?? false;

    // Extract tone, target audience, and primary goal from blueprint
    const designPrefsData = blueprint.designPrefs as Record<string, unknown> | null;
    const goalsData = (blueprint.goals as unknown as string[]) ?? [];
    const tone = (designPrefsData?.tone as string) || undefined;
    const targetAudience = story.targetAudience || undefined;
    const primaryGoal = goalsData[0] || undefined;

    // Load design package from theme
    let designPackage: DesignPackage | null = null;
    const jobThemeId = job.data.themePoolEntryId as string | undefined;
    if (jobThemeId) {
      try {
        const theme = await prisma.themePoolEntry.findUnique({
          where: { id: jobThemeId },
          select: { designPackage: true },
        });
        if (theme?.designPackage) {
          designPackage = theme.designPackage as DesignPackage;
          console.log("[content-agent] Using design package from pipeline theme");
        }
      } catch {
        // Non-fatal
      }
    }
    if (!designPackage) {
      try {
        const build = await prisma.build.findUnique({
          where: { id: buildId },
          select: { siteId: true },
        });
        if (build?.siteId) {
          const site = await prisma.site.findUnique({
            where: { id: build.siteId },
            select: { themePoolEntryId: true },
          });
          if (site?.themePoolEntryId) {
            const theme = await prisma.themePoolEntry.findUnique({
              where: { id: site.themePoolEntryId },
              select: { designPackage: true },
            });
            if (theme?.designPackage) {
              designPackage = theme.designPackage as DesignPackage;
              console.log("[content-agent] Using design package from site theme");
            }
          }
        }
      } catch {
        // Non-fatal
      }
    }

    // Update build status
    await prisma.build.update({
      where: { id: buildId },
      data: { currentAgent: "content", progress: 10 },
    });

    // Build generation options
    const genOptions: GeneratePageContentOptions = {
      businessInfo,
      services,
      story,
      team,
      testimonials,
      faqs,
      trustSignals,
      contactPrefs,
      businessHours,
      industryName,
      archetype,
      industryCode,
      isRegulated,
      tone,
      targetAudience,
      primaryGoal,
      designPackage,
    };

    // Generate content for each page using @xusmo/gutenberg
    let totalTokens = 0;
    let totalCost = 0;
    let llmModel = "template";
    const pagesWithContent: BlueprintPage[] = [];

    for (const page of pages) {
      const content = await generatePageContent(page.slug, genOptions, llmAdapter);
      if (content) llmModel = "gemini-pro";
      pagesWithContent.push({ ...page, content });

      // Update progress per page
      const progressPerPage = Math.floor(15 / pages.length);
      await prisma.build.update({
        where: { id: buildId },
        data: {
          progress: Math.min(10 + progressPerPage * pagesWithContent.length, 25),
        },
      });
    }

    // Update Blueprint with generated content
    await prisma.blueprint.update({
      where: { id: blueprintId },
      data: { pages: pagesWithContent as any },
    });

    // Update build
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "CONTENT_DONE",
        currentAgent: "content",
        progress: 25,
        totalLlmCost: { increment: totalCost },
      },
    });

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: {
          pagesGenerated: pagesWithContent.length,
          llmModel,
          totalTokens,
          totalCost,
        } as any,
        durationMs,
        completedAt: new Date(),
        tokensUsed: totalTokens,
        llmModel,
        llmCost: totalCost,
      },
    });

    // Queue next agent (builder) — skip when dev pipeline handles provisioning inline
    if (!job.data.skipQueue) {
      await completeAgent(buildId, blueprintId, "content");
    }

    return {
      pagesGenerated: pagesWithContent.length,
      durationMs,
      llmModel,
      totalCost,
    };
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
        failureReason: error instanceof Error
          ? error.message
          : "Content generation failed",
        failedAt: new Date(),
      },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Engine content path — uses @xusmo/engine AI pipeline instead of @xusmo/gutenberg
// ---------------------------------------------------------------------------

async function processEngineContentJob(
  job: Job<ContentJobData>,
  agentLogId: string,
  startTime: number
) {
  const { buildId, blueprintId } = job.data;

  try {
    // Load blueprint for the prompt
    const blueprint = await prisma.blueprint.findUniqueOrThrow({
      where: { id: blueprintId },
      include: { lead: { select: { industryName: true, archetype: true } } },
    });

    const businessInfo = blueprint.businessInfo as Record<string, unknown>;
    const businessName = (businessInfo?.businessName as string) ?? "My Business";
    const industry = blueprint.lead.industryName ?? "General Business";
    const prompt = `Build a professional website for "${businessName}", a ${industry} business.`;

    await prisma.build.update({
      where: { id: buildId },
      data: { currentAgent: "content", progress: 10 },
    });

    // Run engine generation
    const { generateViaEngine } = await import(
      "@/lib/generators/engine-adapter"
    );
    const { siteDoc, gutenbergPages } = await generateViaEngine(prompt);

    // Store the React component JSON as designDocument
    const siteId = (
      await prisma.build.findUnique({
        where: { id: buildId },
        select: { siteId: true },
      })
    )?.siteId;

    if (siteId) {
      await prisma.site.update({
        where: { id: siteId },
        data: { designDocument: siteDoc as any },
      });
    }

    // Store generated pages in the blueprint so downstream agents can access them
    const pages = Object.entries(gutenbergPages).map(([slug, content]) => ({
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      content,
    }));

    await prisma.blueprint.update({
      where: { id: blueprintId },
      data: { pages: pages as any },
    });

    await prisma.build.update({
      where: { id: buildId },
      data: { status: "CONTENT_DONE", currentAgent: "content", progress: 25 },
    });

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLogId },
      data: {
        status: "COMPLETED",
        output: {
          pagesGenerated: pages.length,
          llmModel: "engine",
          generator: "engine",
        } as any,
        durationMs,
        completedAt: new Date(),
      },
    });

    if (!job.data.skipQueue) {
      await completeAgent(buildId, blueprintId, "content");
    }

    return { pagesGenerated: pages.length, durationMs, llmModel: "engine" };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLogId },
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
        failureReason: error instanceof Error
          ? error.message
          : "Engine content generation failed",
        failedAt: new Date(),
      },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createContentWorker(connection: { host: string; port: number }) {
  return new Worker<ContentJobData>("content", processContentJob, {
    connection,
    concurrency: 3,
  });
}
