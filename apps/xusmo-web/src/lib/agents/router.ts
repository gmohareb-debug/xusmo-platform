// =============================================================================
// Agent Router — Intent detection + agent dispatch
// Enhanced: confidence gating, route caching, richer classification,
//           personality-aware dispatch, cost-aware routing
// =============================================================================

import { geminiFlash } from "@/lib/llm/gemini";
import type {
  AgentName,
  AgentInput,
  AgentContext,
  AgentResult,
  AgentAction,
  AgentProgress,
  RouterDecision,
} from "./types";
import { runBuilderAgent } from "./builder-agent";
import { runEditorAgent } from "./editor-agent";
import { runEcommerceAgent } from "./ecommerce-agent";
import { runImageAgent } from "./image-agent";
import {
  buildPersonalityPrompt,
  addToConversation,
  getConversationHistory,
  logAgentFeedback,
} from "./agent-memory";
import { runSEOAgent } from "./seo-agent";

// ---------------------------------------------------------------------------
// Route memory — cache recent classifications to avoid redundant LLM calls
// ---------------------------------------------------------------------------

const routeCache = new Map<string, { decision: RouterDecision; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 200;

function getCacheKey(prompt: string, ctx: AgentContext): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, " ").slice(0, 120);
  return `${normalized}|${ctx.existingSite}|${ctx.hasDesignDocument}|${ctx.archetype}`;
}

function getCachedRoute(key: string): RouterDecision | null {
  const entry = routeCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    routeCache.delete(key);
    return null;
  }
  return entry.decision;
}

function setCachedRoute(key: string, decision: RouterDecision) {
  if (routeCache.size > MAX_CACHE_SIZE) {
    const oldest = routeCache.keys().next().value;
    if (oldest) routeCache.delete(oldest);
  }
  routeCache.set(key, { decision, ts: Date.now() });
}

// ---------------------------------------------------------------------------
// Route stats — track what gets routed where (learning signal)
// ---------------------------------------------------------------------------

const routeStats = {
  total: 0,
  byAgent: {} as Record<string, number>,
  llmCalls: 0,
  cacheHits: 0,
  fallbacks: 0,
  avgConfidence: 0,
  lowConfidenceRoutes: 0,
};

export function getRouteStats() {
  return { ...routeStats };
}

// ---------------------------------------------------------------------------
// Intent Classification via LLM
// ---------------------------------------------------------------------------

const ROUTER_SYSTEM_PROMPT = `You are an expert AI router for Xusmo, a professional website builder platform. You have deep understanding of web design, e-commerce, SEO, and content strategy.

Given a user message and site context, determine which specialist agent(s) should handle the request.

## Your Personality
You are decisive, fast, and accurate. You understand nuance — "make it pop" means editor (visual), "add testimonials" means editor (content), "rank higher on Google" means seo.

## Agents Available
1. "builder" — Creates a NEW website from scratch (full site generation with pages, sections, theme, content). ONLY for sites that don't exist yet.
2. "editor" — Modifies an EXISTING website. This is the most versatile agent — handles text, colors, fonts, layout, sections, theme, adding/removing components, page creation.
3. "ecommerce" — Adds/manages e-commerce features (products, WooCommerce, checkout, cart, inventory, shipping).
4. "image" — Handles image-specific changes (hero images, product photos, gallery, backgrounds, team photos). Best when user specifically mentions images.
5. "seo" — SEO optimization (meta titles, descriptions, schema markup, Open Graph, keywords). Best when user mentions search rankings, Google, meta.

## Decision Rules (in priority order)
1. If site doesn't exist AND user wants to create one → "builder"
2. If user mentions products/shop/cart/checkout/inventory → "ecommerce"
3. If user ONLY talks about images/photos → "image"
4. If user ONLY talks about SEO/Google/meta/rankings → "seo"
5. Everything else on existing sites → "editor" (it handles text, design, layout, pages, sections)
6. When in doubt → "editor" for existing sites, "builder" for new sites

## Secondary Agent Rules
- After "builder" → always add "image" and "seo" as secondary
- After "editor" with visual changes → add "image" if photos mentioned
- After "ecommerce" → add "seo" (product SEO is important)

Return JSON:
{
  "primaryAgent": "builder|editor|ecommerce|image|seo",
  "secondaryAgents": [],
  "intent": "one-line description of what user wants",
  "confidence": 0.0-1.0,
  "complexity": "simple|moderate|complex",
  "estimatedActions": 1-10,
  "isNewSite": true/false,
  "isEdit": true/false,
  "isEcommerce": true/false,
  "needsImages": true/false,
  "needsSEO": true/false
}

Return ONLY JSON. No markdown, no explanation.`;

const CONFIDENCE_THRESHOLD = 0.65;

export async function classifyIntent(
  prompt: string,
  context: AgentContext
): Promise<RouterDecision> {
  // Check cache first
  const cacheKey = getCacheKey(prompt, context);
  const cached = getCachedRoute(cacheKey);
  if (cached) {
    routeStats.cacheHits++;
    routeStats.total++;
    console.log(`[Router] Cache hit → ${cached.primaryAgent} (saved LLM call)`);
    return cached;
  }

  const contextStr = `Site context:
- Business: ${context.businessName} (${context.industry}, ${context.archetype})
- Existing site: ${context.existingSite}
- Has design document: ${context.hasDesignDocument}
- Has WordPress: ${context.hasWordPress}
- Pages: ${context.currentPages.map((p) => `${p.slug}(${p.sectionCount}s)`).join(", ")}
- Theme: ${context.currentTheme ? `accent:${context.currentTheme.colors?.accent}, personality:${context.currentTheme.name}` : "none"}`;

  try {
    const result = await geminiFlash(
      `${contextStr}\n\nUser message: ${prompt}`,
      ROUTER_SYSTEM_PROMPT
    );
    routeStats.llmCalls++;

    if (!result?.text) throw new Error("Empty LLM response");

    let cleaned = result.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);
    const confidence = parsed.confidence || 0.5;

    // Confidence gating — if too low, fall back to keyword classification
    if (confidence < CONFIDENCE_THRESHOLD) {
      routeStats.lowConfidenceRoutes++;
      console.log(`[Router] Low confidence (${confidence}) — using keyword fallback`);
      const fallback = keywordClassify(prompt, context);
      setCachedRoute(cacheKey, fallback);
      return fallback;
    }

    const decision: RouterDecision = {
      primaryAgent: parsed.primaryAgent || "editor",
      secondaryAgents: parsed.secondaryAgents || [],
      intent: parsed.intent || prompt,
      confidence,
      isNewSite: !!parsed.isNewSite,
      isEdit: !!parsed.isEdit,
      isEcommerce: !!parsed.isEcommerce,
      needsImages: !!parsed.needsImages,
      needsSEO: !!parsed.needsSEO,
    };

    // Track stats
    routeStats.total++;
    routeStats.byAgent[decision.primaryAgent] = (routeStats.byAgent[decision.primaryAgent] || 0) + 1;
    routeStats.avgConfidence = (routeStats.avgConfidence * (routeStats.total - 1) + confidence) / routeStats.total;

    setCachedRoute(cacheKey, decision);
    return decision;
  } catch {
    routeStats.fallbacks++;
    routeStats.total++;
    const fallback = keywordClassify(prompt, context);
    setCachedRoute(cacheKey, fallback);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Keyword-based fallback classification (no LLM cost)
// ---------------------------------------------------------------------------

function keywordClassify(prompt: string, context: AgentContext): RouterDecision {
  const lower = prompt.toLowerCase();

  // Pattern matching with priority
  const patterns: { test: (s: string) => boolean; agent: AgentName; confidence: number }[] = [
    { test: s => /\b(build|create|generate|make)\b.*\b(website|site|page)\b/.test(s), agent: "builder", confidence: 0.8 },
    { test: s => /\b(product|shop|store|ecommerce|woocommerce|cart|checkout|inventory|shipping)\b/.test(s), agent: "ecommerce", confidence: 0.75 },
    { test: s => /\b(seo|meta|keyword|google|ranking|search engine|schema|sitemap)\b/.test(s), agent: "seo", confidence: 0.8 },
    { test: s => /\b(image|photo|picture|hero image|background|gallery|avatar)\b/.test(s) && !/\b(change|update|edit|modify)\b.*\b(text|title|heading|content)\b/.test(s), agent: "image", confidence: 0.7 },
  ];

  for (const p of patterns) {
    if (p.test(lower)) {
      // Builder only for new sites
      if (p.agent === "builder" && context.existingSite) continue;

      const secondary: AgentName[] = [];
      if (p.agent === "builder") { secondary.push("image", "seo"); }

      return {
        primaryAgent: p.agent,
        secondaryAgents: secondary,
        intent: prompt.slice(0, 100),
        confidence: p.confidence,
        isNewSite: p.agent === "builder",
        isEdit: p.agent !== "builder",
        isEcommerce: p.agent === "ecommerce",
        needsImages: p.agent === "image" || p.agent === "builder",
        needsSEO: p.agent === "seo",
      };
    }
  }

  // Default: editor for existing sites, builder for new
  const primary: AgentName = context.existingSite ? "editor" : "builder";
  return {
    primaryAgent: primary,
    secondaryAgents: primary === "builder" ? ["image", "seo"] : [],
    intent: prompt.slice(0, 100),
    confidence: 0.6,
    isNewSite: !context.existingSite,
    isEdit: context.existingSite,
    isEcommerce: false,
    needsImages: !context.existingSite,
    needsSEO: false,
  };
}

// ---------------------------------------------------------------------------
// Agent Dispatcher
// ---------------------------------------------------------------------------

const AGENT_MAP: Record<
  AgentName,
  (input: AgentInput) => Promise<AgentResult>
> = {
  router: async () => ({
    agent: "router",
    status: "completed",
    reply: "Routed.",
    actions: [],
  }),
  builder: runBuilderAgent,
  editor: runEditorAgent,
  ecommerce: runEcommerceAgent,
  image: runImageAgent,
  seo: runSEOAgent,
  vibe: async () => ({
    agent: "vibe",
    status: "completed",
    reply: "Vibe coding is coming soon.",
    actions: [],
  }),
};

// ---------------------------------------------------------------------------
// Orchestrator — Runs agents in sequence with progress tracking
// ---------------------------------------------------------------------------

export type ProgressCallback = (progress: AgentProgress) => void;

export async function runAgentPipeline(
  input: AgentInput,
  onProgress?: ProgressCallback
): Promise<AgentResult> {
  const startTime = Date.now();

  // Store user message in conversation memory
  addToConversation(input.siteId, "user", input.prompt);

  // Inject conversation history if not already provided
  if (!input.history || input.history.length === 0) {
    input.history = getConversationHistory(input.siteId, 8);
  }

  // 1. Classify intent
  onProgress?.({
    agent: "router",
    status: "thinking",
    message: "Analyzing your request...",
    progress: 5,
    actions: [],
  });

  const decision = await classifyIntent(input.prompt, input.context);

  onProgress?.({
    agent: "router",
    status: "completed",
    message: `Routing to ${decision.primaryAgent} agent: ${decision.intent}`,
    progress: 10,
    actions: [
      {
        type: "ROUTE",
        success: true,
        label: `${decision.primaryAgent} agent (${Math.round(decision.confidence * 100)}% confidence)`,
      },
    ],
  });

  // 2. Run primary agent
  const primaryFn = AGENT_MAP[decision.primaryAgent];
  if (!primaryFn) {
    return {
      agent: decision.primaryAgent,
      status: "failed",
      reply: `Unknown agent: ${decision.primaryAgent}`,
      actions: [],
    };
  }

  onProgress?.({
    agent: decision.primaryAgent,
    status: "generating",
    message: `${agentLabel(decision.primaryAgent)} is working...`,
    progress: 20,
    actions: [],
  });

  let primaryResult: AgentResult;
  try {
    primaryResult = await primaryFn(input);
  } catch (err) {
    return {
      agent: decision.primaryAgent,
      status: "failed",
      reply: `Agent failed: ${err instanceof Error ? err.message : "Unknown error"}. Try a simpler request.`,
      actions: [],
      durationMs: Date.now() - startTime,
    };
  }

  const allActions: AgentAction[] = [...primaryResult.actions];

  onProgress?.({
    agent: decision.primaryAgent,
    status: "completed",
    message: primaryResult.reply,
    progress: 60,
    actions: allActions,
  });

  // 3. Run secondary agents (non-blocking — failures don't kill pipeline)
  let progress = 60;
  const step = decision.secondaryAgents.length > 0
    ? 30 / decision.secondaryAgents.length
    : 0;

  for (const secondary of decision.secondaryAgents) {
    const fn = AGENT_MAP[secondary];
    if (!fn) continue;

    onProgress?.({
      agent: secondary,
      status: "generating",
      message: `${agentLabel(secondary)} is enhancing...`,
      progress: Math.round(progress),
      actions: allActions,
    });

    try {
      const result = await fn(input);
      allActions.push(...result.actions);
      progress += step;

      onProgress?.({
        agent: secondary,
        status: "completed",
        message: result.reply,
        progress: Math.round(progress),
        actions: allActions,
      });
    } catch (err) {
      allActions.push({
        type: "AGENT_ERROR",
        success: false,
        label: `${secondary} agent failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
      progress += step;
    }
  }

  // 4. Final result
  const durationMs = Date.now() - startTime;

  // Store assistant reply in conversation memory
  addToConversation(input.siteId, "assistant", primaryResult.reply);

  // Log feedback for learning
  const successCount = allActions.filter(a => a.success).length;
  const failCount = allActions.filter(a => !a.success).length;
  logAgentFeedback(
    input.siteId,
    decision.primaryAgent,
    decision.intent,
    primaryResult.status === "completed" && failCount === 0,
    failCount > 0 ? `${failCount} action(s) failed` : undefined
  );

  onProgress?.({
    agent: decision.primaryAgent,
    status: "completed",
    message: "All agents finished.",
    progress: 100,
    actions: allActions,
  });

  return {
    agent: decision.primaryAgent,
    status: primaryResult.status,
    reply: primaryResult.reply,
    actions: allActions,
    blueprint: primaryResult.blueprint,
    durationMs,
  };
}

function agentLabel(name: AgentName): string {
  const labels: Record<AgentName, string> = {
    router: "Router",
    builder: "Website Builder",
    editor: "Design Editor",
    ecommerce: "E-commerce",
    image: "Image Specialist",
    seo: "SEO Optimizer",
    vibe: "Vibe Coder",
  };
  return labels[name] || name;
}
