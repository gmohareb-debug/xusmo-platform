// =============================================================================
// Logo Agent — Thin Prisma wrapper around @xusmo/gutenberg logo generator
// Loads theme/blueprint from DB, delegates to generateLogo(), saves to DB.
// =============================================================================

import { prisma } from "@/lib/db";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import {
  generateLogo,
  type LogoResult,
  type LogoContext,
} from "@xusmo/gutenberg";

// Re-export types for consumers
export type { LogoResult } from "@xusmo/gutenberg";

// ---------------------------------------------------------------------------
// Pipeline integration — called from queue.ts during build
// ---------------------------------------------------------------------------

export async function processLogoJob(
  siteId: string,
  blueprintId: string
): Promise<LogoResult | null> {
  try {
    // Check if site already has a logo
    const existingLogo = await prisma.siteLogo.findUnique({
      where: { siteId },
    });
    if (existingLogo) {
      console.log("[logo-agent] Site already has a logo — skipping generation.");
      return null;
    }

    // Load blueprint for business context
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
      console.warn("[logo-agent] Blueprint not found:", blueprintId);
      return null;
    }

    // Load site theme for colors/fonts
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { themePoolEntryId: true },
    });

    let primaryColor = "#1e40af";
    let accentColor = "#6366f1";
    let headingFont = "Inter";
    let borderRadius = "8";

    if (site?.themePoolEntryId) {
      const theme = await prisma.themePoolEntry.findUnique({
        where: { id: site.themePoolEntryId },
        select: { colors: true, fonts: true, borderRadius: true },
      });
      if (theme) {
        const colors = theme.colors as Record<string, string>;
        const fonts = theme.fonts as Record<string, string>;
        const radii = theme.borderRadius as Record<string, string>;
        primaryColor = colors?.primary || primaryColor;
        accentColor = colors?.accent || accentColor;
        headingFont = fonts?.heading || headingFont;
        borderRadius = radii?.medium || borderRadius;
      }
    }

    const businessInfo = blueprint.businessInfo as Record<string, unknown> | undefined;

    const ctx: LogoContext = {
      businessName: (businessInfo?.name as string) || blueprint.lead?.businessName || "Business",
      industry: blueprint.lead?.industryName || "business",
      archetype: blueprint.lead?.archetype || "SERVICE",
      primaryColor,
      accentColor,
      headingFont,
      borderRadius,
    };

    console.log(`[logo-agent] Generating logo for "${ctx.businessName}" (${ctx.industry})`);
    const result = generateLogo(ctx);

    // Save to SiteLogo table
    await prisma.siteLogo.create({
      data: {
        siteId,
        type: "generated",
        text: result.svg,
        dominantColors: result.dominantColors,
      },
    });

    console.log("[logo-agent] Logo generated and saved.");
    return result;
  } catch (err) {
    console.error("[logo-agent] Failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
