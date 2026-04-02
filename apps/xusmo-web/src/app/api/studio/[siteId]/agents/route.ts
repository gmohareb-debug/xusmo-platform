// =============================================================================
// POST /api/studio/[siteId]/agents — Multi-Agent Pipeline Endpoint
// Routes user prompts to the appropriate agent(s) and returns results
// with real-time progress via streaming or polling.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { runAgentPipeline } from "@/lib/agents/router";
import type { AgentInput, AgentContext } from "@/lib/agents/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // 1. Auth
    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Build agent context from database
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        businessName: true,
        archetype: true,
        status: true,
        wpUrl: true,
        activePreset: true,
        designDocument: true,
        pages: {
          select: {
            slug: true,
            title: true,
            heroHeadline: true,
            heroSubheadline: true,
            ctaLabel: true,
            metaTitle: true,
            metaDesc: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        build: {
          select: { id: true, generatorType: true },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Extract design document data
    const designDoc = site.designDocument as Record<string, unknown> | null;
    const theme = (designDoc?.theme as Record<string, unknown>) || null;
    const enginePages = (designDoc?.pages as Record<string, unknown>) || {};
    const plan = (designDoc?._plan as Record<string, unknown>) || {};
    const businessProfile = (plan?.businessProfile as Record<string, string>) || {};

    // Build section info per page
    const currentSections: Record<string, { component: string; propKeys: string[] }[]> = {};
    for (const [slug, pageData] of Object.entries(enginePages)) {
      if (typeof pageData !== "object" || !pageData) continue;
      const page = pageData as Record<string, unknown>;
      const sections = page.sections;
      if (!Array.isArray(sections)) continue;

      currentSections[slug] = sections.map((s: unknown) => {
        const sec = s as Record<string, unknown>;
        const props = (sec.props as Record<string, unknown>) || {};
        return {
          component: (sec.component as string) || "unknown",
          propKeys: Object.keys(props),
        };
      });
    }

    // Page info with section counts
    const pageInfos = site.pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      sectionCount: currentSections[p.slug]?.length || 0,
    }));

    const context: AgentContext = {
      businessName: site.businessName,
      archetype: site.archetype,
      industry: businessProfile.industry || site.archetype,
      existingSite: !!designDoc || !!site.wpUrl,
      hasDesignDocument: !!designDoc,
      hasWordPress: !!site.wpUrl,
      wpUrl: site.wpUrl,
      currentPages: pageInfos,
      currentTheme: theme
        ? {
            colors: (theme.colors as Record<string, string>) || {},
            fonts: (theme.fonts as Record<string, string>) || {},
            radius: (theme.radius as string) || "8px",
          }
        : null,
      currentSections,
    };

    const agentInput: AgentInput = {
      siteId,
      prompt: message.trim(),
      context,
      history: Array.isArray(history)
        ? history
            .filter(
              (m: { role: string; text: string }) =>
                m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant")
            )
            .slice(-10)
        : [],
    };

    // 4. Run agent pipeline
    const result = await runAgentPipeline(agentInput);

    // 5. Return result
    return NextResponse.json({
      agent: result.agent,
      reply: result.reply,
      actions: result.actions,
      status: result.status,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("[studio/agents POST]", error);
    return NextResponse.json(
      { error: "Agent pipeline failed" },
      { status: 500 }
    );
  }
}
