// =============================================================================
// SEO Agent — Auto-generates meta titles, descriptions, schema markup
// Works on both Engine (React) and WordPress (Gutenberg) sites.
// =============================================================================

import { prisma } from "@/lib/db";
import { geminiFlash } from "@/lib/llm/gemini";
import type { AgentInput, AgentResult, AgentAction } from "./types";

const SEO_SYSTEM_PROMPT = `You are an SEO specialist. Given a business and its pages, generate optimized SEO metadata.

Return JSON:
{
  "pages": [
    {
      "slug": "home",
      "metaTitle": "Business Name — Primary Keyword | Location",
      "metaDesc": "Compelling 150-160 char description with primary keyword, value proposition, and CTA"
    }
  ]
}

Rules:
- Meta titles: 50-60 chars, include business name and primary keyword
- Meta descriptions: 150-160 chars, include CTA, benefit, and keyword
- Use natural language, not keyword stuffing
- Each page should target different keywords
- Home page: brand + primary service
- About page: trust + story keywords
- Services page: specific service keywords
- Contact page: location + action keywords`;

export async function runSEOAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const actions: AgentAction[] = [];
  const startTime = Date.now();

  try {
    // Fetch pages
    const pages = await prisma.page.findMany({
      where: { siteId },
      select: { slug: true, title: true, heroHeadline: true, metaTitle: true, metaDesc: true },
      orderBy: { sortOrder: "asc" },
    });

    if (pages.length === 0) {
      return {
        agent: "seo",
        status: "completed",
        reply: "No pages found. Generate a site first.",
        actions: [],
      };
    }

    // Check if this is a specific SEO request or a full audit
    const isFullAudit = prompt.toLowerCase().includes("all") ||
      prompt.toLowerCase().includes("optimize") ||
      prompt.toLowerCase().includes("audit") ||
      prompt.toLowerCase().includes("generate seo");

    const pageContext = pages
      .map((p) => `- ${p.slug}: "${p.title}" | headline: "${p.heroHeadline || "none"}" | meta: "${p.metaTitle || "MISSING"}" / "${p.metaDesc || "MISSING"}"`)
      .join("\n");

    const llmResult = await geminiFlash(
      `Business: ${context.businessName} (${context.industry})
Location: ${context.archetype}
Pages:
${pageContext}

${isFullAudit ? "Generate SEO metadata for ALL pages." : `User request: ${prompt}`}`,
      SEO_SYSTEM_PROMPT
    );

    if (!llmResult?.text) throw new Error("Empty LLM response");

    let cleaned = llmResult.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    // Fix truncated JSON
    let jsonStr = cleaned;
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
    // Count open braces/brackets and close them
    let opens = 0;
    let inStr = false;
    let esc = false;
    const closers: string[] = [];
    for (const ch of jsonStr) {
      if (esc) { esc = false; continue; }
      if (ch === "\\" && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{") closers.push("}");
      else if (ch === "[") closers.push("]");
      else if (ch === "}" || ch === "]") closers.pop();
    }
    if (inStr) jsonStr += '"';
    jsonStr += closers.reverse().join("");
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

    const parsed = JSON.parse(jsonStr);
    const seoPages = parsed.pages || [];

    // Apply SEO updates
    for (const seoPage of seoPages) {
      const { slug, metaTitle, metaDesc } = seoPage;
      const existing = pages.find((p) => p.slug === slug);
      if (!existing) continue;

      const data: Record<string, string> = {};
      if (metaTitle) data.metaTitle = metaTitle;
      if (metaDesc) data.metaDesc = metaDesc;

      if (Object.keys(data).length > 0) {
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug } },
          data,
        });

        actions.push({
          type: "UPDATE_SEO",
          success: true,
          label: `${slug}: ${metaTitle ? "title" : ""}${metaTitle && metaDesc ? " + " : ""}${metaDesc ? "desc" : ""} updated`,
        });
      }
    }

    return {
      agent: "seo",
      status: "completed",
      reply: `SEO optimized for ${actions.length} page(s). Each page now has targeted meta titles and descriptions.`,
      actions,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      agent: "seo",
      status: "failed",
      reply: `SEO optimization failed: ${err instanceof Error ? err.message : "Unknown"}`,
      actions,
      durationMs: Date.now() - startTime,
    };
  }
}
