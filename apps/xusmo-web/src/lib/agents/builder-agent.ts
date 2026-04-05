// =============================================================================
// Website Builder Agent — Full site generation from a natural-language prompt
// Takes user prompt + business context → generates complete site structure,
// theme, content, and images via @xusmo/engine pipeline.
// =============================================================================

import { prisma } from "@/lib/db";
import { generateFull } from "@xusmo/engine";
import type { AgentInput, AgentResult, AgentAction, SiteBlueprint } from "./types";

export async function runBuilderAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const startTime = Date.now();
  const actions: AgentAction[] = [];

  try {
    // 1. Build a rich prompt from context + user input
    const richPrompt = buildRichPrompt(prompt, context);

    actions.push({
      type: "PLAN",
      success: true,
      label: "Analyzing business and planning site structure",
    });

    // 2. Generate full site via @xusmo/engine (Step 0-4 pipeline)
    // This runs: Business Intel → Planner → Generator → Consistency → Image Resolution
    const siteDoc = await generateFull(richPrompt);

    if (!siteDoc?.pages || !siteDoc?.theme) {
      throw new Error("Engine returned incomplete site document");
    }

    const pageCount = Object.keys(siteDoc.pages).length;
    const sectionCount = Object.values(siteDoc.pages).reduce(
      (sum: number, p: unknown) => {
        const page = p as Record<string, unknown>;
        const sections = page?.sections;
        return sum + (Array.isArray(sections) ? sections.length : 0);
      },
      0
    );

    actions.push({
      type: "GENERATE",
      success: true,
      label: `Generated ${pageCount} pages with ${sectionCount} sections`,
    });

    // 3. Save designDocument to database
    await prisma.site.update({
      where: { id: siteId },
      data: {
        designDocument: siteDoc as Record<string, unknown>,
        businessName: context.businessName || (siteDoc as Record<string, unknown>)._plan
          ? ((siteDoc as Record<string, unknown>)._plan as Record<string, unknown>)?.businessProfile
            ? (((siteDoc as Record<string, unknown>)._plan as Record<string, unknown>).businessProfile as Record<string, unknown>).businessName as string
            : context.businessName
          : context.businessName,
      },
    });

    actions.push({
      type: "SAVE",
      success: true,
      label: "Site design saved",
    });

    // 4. Create/update Page records in DB for each generated page
    const pageEntries = Object.entries(siteDoc.pages as Record<string, unknown>);
    for (let i = 0; i < pageEntries.length; i++) {
      const [slug, pageData] = pageEntries[i];
      const page = pageData as Record<string, unknown>;
      const sections = (page?.sections || []) as Record<string, unknown>[];

      // Extract hero content from first hero section
      const heroSection = sections.find((s) =>
        String(s.component || "").includes("hero")
      );
      const heroProps = (heroSection?.props || {}) as Record<string, string>;

      await prisma.page.upsert({
        where: { siteId_slug: { siteId, slug } },
        create: {
          siteId,
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          heroHeadline: heroProps.title || heroProps.headline || null,
          heroSubheadline: heroProps.subtitle || heroProps.subheadline || null,
          ctaLabel: heroProps.cta || heroProps.ctaLabel || null,
          sortOrder: i,
        },
        update: {
          heroHeadline: heroProps.title || heroProps.headline || undefined,
          heroSubheadline: heroProps.subtitle || heroProps.subheadline || undefined,
          ctaLabel: heroProps.cta || heroProps.ctaLabel || undefined,
        },
      });
    }

    actions.push({
      type: "PAGES",
      success: true,
      label: `Created ${pageCount} page records`,
    });

    // 5. Extract theme info for the reply
    const theme = siteDoc.theme as Record<string, unknown>;
    const colors = theme?.colors as Record<string, string> || {};
    const fonts = theme?.fonts as Record<string, string> || {};
    const plan = (siteDoc as Record<string, unknown>)?._plan as Record<string, unknown> || {};

    const durationMs = Date.now() - startTime;
    const durationSec = Math.round(durationMs / 1000);

    return {
      agent: "builder",
      status: "completed",
      reply: `Website generated successfully in ${durationSec}s! Created ${pageCount} pages with ${sectionCount} sections. Theme: ${fonts.heading || "default"} + ${fonts.body || "default"}, accent color ${colors.accent || "#3b82f6"}. Personality: ${plan.personality || "modern"}. Preview is loading now.`,
      actions,
      blueprint: {
        businessName: context.businessName,
        industry: context.industry,
        archetype: context.archetype as SiteBlueprint["archetype"],
        personality: (plan.personality as string) || "",
        pages: Object.entries(siteDoc.pages as Record<string, unknown>).map(
          ([slug, p]) => {
            const page = p as Record<string, unknown>;
            return {
              slug,
              title: slug.charAt(0).toUpperCase() + slug.slice(1),
              goal: "",
              sections: [],
              seo: { metaTitle: "", metaDesc: "" },
            };
          }
        ),
      } as Partial<SiteBlueprint>,
      durationMs,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      agent: "builder",
      status: "failed",
      reply: `Site generation failed: ${msg}. Please try again with more details about your business.`,
      actions: [
        ...actions,
        { type: "ERROR", success: false, label: msg },
      ],
      durationMs: Date.now() - startTime,
    };
  }
}

// ---------------------------------------------------------------------------
// Build a rich prompt from user input + existing context
// ---------------------------------------------------------------------------

function buildRichPrompt(userPrompt: string, context: AgentContext): string {
  const parts = [userPrompt];

  if (context.businessName && !userPrompt.includes(context.businessName)) {
    parts.push(`\nBusiness Name: ${context.businessName}`);
  }
  if (context.industry) {
    parts.push(`Industry: ${context.industry}`);
  }
  if (context.archetype) {
    parts.push(`Archetype: ${context.archetype}`);
  }

  parts.push(
    `\nIMPORTANT: The navbar logo MUST say "${context.businessName}". All content must be about this specific business.`
  );

  // Inject global vibe preferences (learned from past user edits)
  if (context.globalPreferences && Object.keys(context.globalPreferences).length > 0) {
    parts.push(
      `\nCRITICAL USER PREFERENCES (MUST APPLY GLOBALLY):\n${JSON.stringify(context.globalPreferences, null, 2)}`
    );
  }

  return parts.join("\n");
}
