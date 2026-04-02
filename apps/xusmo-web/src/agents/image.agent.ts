// =============================================================================
// Image Agent — Thin Prisma wrapper around @xusmo/gutenberg image planner
// Loads blueprint from DB, delegates to generateImagePlan(), returns results.
// =============================================================================

import { prisma } from "@/lib/db";
import {
  generateImagePlan,
  type ImagePlan,
  type BusinessContext,
} from "@xusmo/gutenberg";

// Re-export types for consumers
export type { SiteImage, ImagePlan } from "@xusmo/gutenberg";

// ---------------------------------------------------------------------------
// Pipeline integration — called from queue.ts during build
// ---------------------------------------------------------------------------

export async function processImageJob(
  buildId: string,
  blueprintId: string
): Promise<ImagePlan | null> {
  try {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: blueprintId },
      include: {
        lead: {
          select: {
            businessName: true,
            industryName: true,
            archetype: true,
          },
        },
      },
    });
    if (!blueprint) {
      console.warn("[image-agent] Blueprint not found:", blueprintId);
      return null;
    }

    const businessInfo = blueprint.businessInfo as Record<string, unknown> | undefined;
    const designPrefs = blueprint.designPrefs as Record<string, unknown> | undefined;
    const services = (blueprint.services as Array<Record<string, unknown>>) || [];
    const testimonials = (blueprint.testimonials as Array<Record<string, unknown>>) || [];
    const team = (blueprint.team as Array<Record<string, unknown>>) || [];

    const ctx: BusinessContext = {
      name: (businessInfo?.name as string) || blueprint.lead?.businessName || "Business",
      industry: blueprint.lead?.industryName || "business",
      archetype: blueprint.lead?.archetype || "SERVICE",
      description: (businessInfo?.description as string) || undefined,
      tagline: (businessInfo?.tagline as string) || undefined,
      imageryThemes: (designPrefs?.imageryThemes as string[]) || undefined,
      serviceNames: services.map((s) => (s.name as string) || "").filter(Boolean),
      teamCount: team.length,
      testimonialCount: testimonials.length,
    };

    const plan = await generateImagePlan(ctx);
    console.log("[image-agent] Image plan generated for build", buildId);
    return plan;
  } catch (err) {
    console.error("[image-agent] Failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
