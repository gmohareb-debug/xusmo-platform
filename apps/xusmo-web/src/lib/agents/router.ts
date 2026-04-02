// =============================================================================
// Agent Router — Intent detection + agent dispatch
// Parses the user's prompt, determines which agent(s) to invoke,
// and orchestrates the multi-agent pipeline.
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
import { runSEOAgent } from "./seo-agent";

// ---------------------------------------------------------------------------
// Intent Classification via LLM
// ---------------------------------------------------------------------------

const ROUTER_SYSTEM_PROMPT = `You are an AI router for a website builder platform. Given a user message and site context, determine which agent(s) should handle the request.

Agents available:
1. "builder" — Creates a NEW website from scratch (full site generation with pages, sections, theme, content)
2. "editor" — Modifies an EXISTING website (change text, colors, fonts, layout, sections, theme)
3. "ecommerce" — Adds/manages e-commerce features (products, WooCommerce, checkout, cart, pricing)
4. "image" — Handles image changes (hero images, product photos, gallery, backgrounds)
5. "seo" — SEO optimization (meta titles, descriptions, schema, keywords, alt texts)

Return JSON:
{
  "primaryAgent": "builder|editor|ecommerce|image|seo",
  "secondaryAgents": [],
  "intent": "one-line description of what user wants",
  "confidence": 0.0-1.0,
  "isNewSite": true/false,
  "isEdit": true/false,
  "isEcommerce": true/false,
  "needsImages": true/false,
  "needsSEO": true/false
}

Rules:
- If user says "build me a website" or "create a site for..." → builder
- If user says "change the hero" or "make it more..." or "update..." → editor
- If user mentions products, shop, cart, checkout, pricing, WooCommerce → ecommerce
- If user mentions images, photos, hero image, background → image
- If user mentions SEO, meta, keywords, Google ranking → seo
- If the site already exists (existingSite=true) and user wants broad changes → editor
- If unclear, default to editor for existing sites, builder for new sites
- secondaryAgents: agents that should run AFTER the primary (e.g., image after builder)

Return ONLY JSON.`;

export async function classifyIntent(
  prompt: string,
  context: AgentContext
): Promise<RouterDecision> {
  const contextStr = `Site context:
- Business: ${context.businessName} (${context.industry}, ${context.archetype})
- Existing site: ${context.existingSite}
- Has design document: ${context.hasDesignDocument}
- Has WordPress: ${context.hasWordPress}
- Pages: ${context.currentPages.map((p) => p.slug).join(", ")}`;

  try {
    const result = await geminiFlash(
      `${contextStr}\n\nUser message: ${prompt}`,
      ROUTER_SYSTEM_PROMPT
    );

    if (!result?.text) throw new Error("Empty LLM response");

    let cleaned = result.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);
    return {
      primaryAgent: parsed.primaryAgent || "editor",
      secondaryAgents: parsed.secondaryAgents || [],
      intent: parsed.intent || prompt,
      confidence: parsed.confidence || 0.5,
      isNewSite: !!parsed.isNewSite,
      isEdit: !!parsed.isEdit,
      isEcommerce: !!parsed.isEcommerce,
      needsImages: !!parsed.needsImages,
      needsSEO: !!parsed.needsSEO,
    };
  } catch {
    // Fallback: keyword-based classification
    const lower = prompt.toLowerCase();
    const isNew =
      lower.includes("build") ||
      lower.includes("create") ||
      lower.includes("generate") ||
      lower.includes("make me a website");
    const isEcom =
      lower.includes("product") ||
      lower.includes("shop") ||
      lower.includes("store") ||
      lower.includes("ecommerce") ||
      lower.includes("woocommerce") ||
      lower.includes("cart") ||
      lower.includes("checkout");
    const isImage =
      lower.includes("image") ||
      lower.includes("photo") ||
      lower.includes("picture") ||
      lower.includes("hero image") ||
      lower.includes("background");
    const isSeo =
      lower.includes("seo") ||
      lower.includes("meta") ||
      lower.includes("keyword") ||
      lower.includes("google");

    let primary: AgentName = "editor";
    if (isNew && !context.existingSite) primary = "builder";
    else if (isEcom) primary = "ecommerce";
    else if (isImage) primary = "image";
    else if (isSeo) primary = "seo";

    const secondary: AgentName[] = [];
    if (primary === "builder") {
      secondary.push("image");
      if (isEcom) secondary.push("ecommerce");
    }

    return {
      primaryAgent: primary,
      secondaryAgents: secondary,
      intent: prompt,
      confidence: 0.6,
      isNewSite: isNew,
      isEdit: !isNew,
      isEcommerce: isEcom,
      needsImages: isImage || isNew,
      needsSEO: isSeo,
    };
  }
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

  const primaryResult = await primaryFn(input);

  const allActions: AgentAction[] = [...primaryResult.actions];

  onProgress?.({
    agent: decision.primaryAgent,
    status: "completed",
    message: primaryResult.reply,
    progress: 60,
    actions: allActions,
  });

  // 3. Run secondary agents
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
    }
  }

  // 4. Final result
  const durationMs = Date.now() - startTime;

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
    editor: "Editor",
    ecommerce: "E-commerce",
    image: "Image",
    seo: "SEO",
    vibe: "Vibe Coder",
  };
  return labels[name] || name;
}
