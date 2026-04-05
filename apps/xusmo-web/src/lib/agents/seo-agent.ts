// =============================================================================
// SEO Specialist Agent — Keyword research, meta optimization, schema markup,
// Open Graph, content briefs, and SERP-aware optimization.
// Enhanced: keyword analysis, schema types, OG tags, content brief generation,
//           competitive positioning, industry-specific SEO rules
// =============================================================================

import { prisma } from "@/lib/db";
import { geminiFlash } from "@/lib/llm/gemini";
import type { AgentInput, AgentResult, AgentAction } from "./types";

// ---------------------------------------------------------------------------
// SEO knowledge base — industry-specific keyword patterns
// ---------------------------------------------------------------------------

const INDUSTRY_SEO_RULES: Record<string, { keywords: string[]; schemaType: string; localSEO: boolean }> = {
  restaurant: { keywords: ["menu", "reservations", "near me", "delivery"], schemaType: "Restaurant", localSEO: true },
  dental: { keywords: ["dentist near me", "emergency dental", "teeth whitening", "dental implants"], schemaType: "Dentist", localSEO: true },
  law: { keywords: ["attorney", "lawyer near me", "free consultation", "legal advice"], schemaType: "Attorney", localSEO: true },
  fitness: { keywords: ["gym near me", "personal trainer", "membership", "group classes"], schemaType: "HealthClub", localSEO: true },
  salon: { keywords: ["hair salon near me", "haircut", "color", "stylist"], schemaType: "HairSalon", localSEO: true },
  plumber: { keywords: ["plumber near me", "emergency plumbing", "drain cleaning"], schemaType: "Plumber", localSEO: true },
  hotel: { keywords: ["book room", "rates", "amenities", "reviews"], schemaType: "Hotel", localSEO: true },
  saas: { keywords: ["pricing", "features", "demo", "free trial", "vs", "alternative"], schemaType: "SoftwareApplication", localSEO: false },
  ecommerce: { keywords: ["buy", "shop", "free shipping", "sale", "reviews"], schemaType: "Store", localSEO: false },
  photography: { keywords: ["photographer near me", "portfolio", "booking", "packages"], schemaType: "Photographer", localSEO: true },
  education: { keywords: ["classes", "enrollment", "curriculum", "tutor"], schemaType: "EducationalOrganization", localSEO: true },
  realestate: { keywords: ["homes for sale", "realtor", "listings", "open house"], schemaType: "RealEstateAgent", localSEO: true },
  auto: { keywords: ["auto repair near me", "mechanic", "oil change", "brake service"], schemaType: "AutoRepair", localSEO: true },
  default: { keywords: ["services", "about", "contact", "reviews"], schemaType: "LocalBusiness", localSEO: true },
};

function getIndustryRules(industry: string) {
  const lower = (industry || "").toLowerCase();
  for (const [key, rules] of Object.entries(INDUSTRY_SEO_RULES)) {
    if (lower.includes(key)) return rules;
  }
  return INDUSTRY_SEO_RULES.default;
}

// ---------------------------------------------------------------------------
// Enhanced system prompt with keyword strategy
// ---------------------------------------------------------------------------

const SEO_SYSTEM_PROMPT = `You are a senior SEO strategist with 10+ years of experience. Given a business, its pages, and industry context, create a comprehensive SEO optimization plan.

Return JSON:
{
  "pages": [
    {
      "slug": "home",
      "metaTitle": "Business Name — Primary Keyword | Location",
      "metaDesc": "Compelling 150-160 char description with primary keyword, value proposition, and CTA",
      "primaryKeyword": "main keyword this page targets",
      "secondaryKeywords": ["keyword2", "keyword3"],
      "ogTitle": "Social-optimized title (may differ from meta title)",
      "ogDescription": "Social-optimized description (more casual, shareable)"
    }
  ],
  "siteKeywords": ["top 5 site-wide keywords"],
  "contentGaps": ["topics the site should cover but doesn't"],
  "schemaRecommendations": ["schema types to implement"]
}

## Meta Writing Rules
- **Titles**: 50-60 chars. Format: "Primary Keyword | Brand Name" or "Brand — Benefit Phrase"
- **Descriptions**: 150-160 chars. Include: keyword + benefit + CTA. Use power words (free, proven, trusted, expert)
- **OG titles**: More engaging, can be longer. Use questions or bold claims.
- **OG descriptions**: Casual, shareable tone. What would make someone click on social media?

## Keyword Strategy Rules
- Home page: brand + primary service + location
- Service pages: specific service + "near me" (if local)
- About page: trust signals (years in business, certified, award-winning)
- Contact page: action keywords (book, schedule, free consultation)
- Blog/FAQ: long-tail question keywords

## Content Gap Analysis
- Identify topics the business should rank for but has no page for
- Suggest FAQ topics that match "People Also Ask" patterns
- Recommend blog topics for long-tail traffic

Return ONLY JSON. No markdown.`;

// ---------------------------------------------------------------------------
// Main SEO Agent
// ---------------------------------------------------------------------------

export async function runSEOAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const actions: AgentAction[] = [];
  const startTime = Date.now();

  try {
    const pages = await prisma.page.findMany({
      where: { siteId },
      select: { slug: true, title: true, heroHeadline: true, metaTitle: true, metaDesc: true },
      orderBy: { sortOrder: "asc" },
    });

    if (pages.length === 0) {
      return { agent: "seo", status: "completed", reply: "No pages found. Generate a site first.", actions: [] };
    }

    const industryRules = getIndustryRules(context.industry);

    const isFullAudit = prompt.toLowerCase().includes("all") ||
      prompt.toLowerCase().includes("optimize") ||
      prompt.toLowerCase().includes("audit") ||
      prompt.toLowerCase().includes("generate seo");

    const pageContext = pages
      .map((p) => `- ${p.slug}: "${p.title}" | headline: "${p.heroHeadline || "none"}" | meta: "${p.metaTitle || "MISSING"}" / "${p.metaDesc || "MISSING"}"`)
      .join("\n");

    const llmResult = await geminiFlash(
      `Business: ${context.businessName} (${context.industry})
Industry keywords to consider: ${industryRules.keywords.join(", ")}
Schema type: ${industryRules.schemaType}
Local SEO needed: ${industryRules.localSEO}
Pages:
${pageContext}

${isFullAudit ? "Generate comprehensive SEO for ALL pages including keywords, OG tags, and content gap analysis." : `User request: ${prompt}`}`,
      SEO_SYSTEM_PROMPT
    );

    if (!llmResult?.text) throw new Error("Empty LLM response");

    let cleaned = llmResult.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    // Salvage truncated JSON
    let jsonStr = cleaned.replace(/,\s*([}\]])/g, "$1");
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

    // Apply SEO updates to DB
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
          label: `${slug}: ${metaTitle ? "title" : ""}${metaTitle && metaDesc ? " + " : ""}${metaDesc ? "desc" : ""} optimized`,
        });
      }
    }

    // Store OG and keyword data in designDocument
    if (parsed.siteKeywords || parsed.contentGaps || parsed.schemaRecommendations) {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        doc._seo = {
          siteKeywords: parsed.siteKeywords || [],
          contentGaps: parsed.contentGaps || [],
          schemaType: industryRules.schemaType,
          schemaRecommendations: parsed.schemaRecommendations || [],
          lastAudit: new Date().toISOString(),
          pageKeywords: seoPages.reduce((acc: Record<string, unknown>, p: Record<string, unknown>) => {
            if (p.slug) acc[p.slug as string] = { primary: p.primaryKeyword, secondary: p.secondaryKeywords, ogTitle: p.ogTitle, ogDesc: p.ogDescription };
            return acc;
          }, {}),
        };
        await prisma.site.update({ where: { id: siteId }, data: { designDocument: doc } });
        actions.push({ type: "SEO_AUDIT", success: true, label: `Stored keyword strategy + content gap analysis` });
      } catch { /* non-critical */ }
    }

    // Build reply
    const parts = [`SEO optimized for ${actions.length - (parsed.siteKeywords ? 1 : 0)} page(s).`];
    if (parsed.siteKeywords?.length) parts.push(`Target keywords: ${parsed.siteKeywords.slice(0, 3).join(", ")}.`);
    if (parsed.contentGaps?.length) parts.push(`Content gaps found: ${parsed.contentGaps.slice(0, 2).join(", ")}.`);

    return {
      agent: "seo",
      status: "completed",
      reply: parts.join(" "),
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
