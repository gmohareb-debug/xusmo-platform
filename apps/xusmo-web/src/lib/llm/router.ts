// =============================================================================
// 4-Tier LLM Router
// Routes requests through the cost-optimized LLM strategy:
//   Tier 1: Cached keyword matching / enhanced templates ($0)
//   Tier 2: Gemini Flash (cheap) / Gemini Pro (quality)
//   Tier 2.5: @xusmo/engine multi-key router (Gemini keys + OpenRouter free models)
//   Tier 3: Claude Sonnet (premium fallback / regulated)
// Usage: import { routeLLM } from "@/lib/llm/router";
// =============================================================================

import { geminiFlash, geminiPro } from "./gemini";
import { claudeFallback } from "./claude";
import { engineRoute } from "./engine-provider";
import { prisma } from "@/lib/db";
import type { LLMResponse, LLMTask } from "./types";

export type { LLMResponse, LLMTask };

// ---------------------------------------------------------------------------
// Regulated industry codes that must use Claude
// ---------------------------------------------------------------------------

const REGULATED_INDUSTRIES = new Set([
  "law_firm",
  "dental",
  "accounting",
  "insurance",
  "real_estate",
]);

// ---------------------------------------------------------------------------
// Task → LLM mapping for Tier 2/3 industries
// ---------------------------------------------------------------------------

function getDefaultLLM(
  task: LLMTask,
  isRegulated: boolean
): (prompt: string, systemPrompt?: string) => Promise<LLMResponse | null> {
  if (isRegulated || task === "regulated_content") return claudeFallback;

  switch (task) {
    case "classify":
    case "generate_seo":
    case "generate_tagline":
    case "quality_check":
      return geminiFlash;
    case "generate_content":
    case "generate_pattern_content":
      return geminiPro;
    default:
      return geminiFlash;
  }
}

// ---------------------------------------------------------------------------
// Check if industry has Tier 1 data (cached, no LLM needed)
// ---------------------------------------------------------------------------

async function checkTier1(
  task: LLMTask,
  industryCode?: string
): Promise<boolean> {
  if (!industryCode) return false;
  if (task !== "classify" && task !== "generate_content") return false;

  const industry = await prisma.industryDefault.findUnique({
    where: { industryCode },
    select: { totalBuilds: true },
  });

  return (industry?.totalBuilds ?? 0) > 50;
}

// ---------------------------------------------------------------------------
// Log LLM call for cost tracking
// ---------------------------------------------------------------------------

async function logLLMCall(
  task: LLMTask,
  response: LLMResponse,
  industryCode?: string
) {
  try {
    console.log(
      `[llm-router] task=${task} model=${response.model} tokens=${response.tokensUsed} cost=$${response.cost.toFixed(6)} industry=${industryCode ?? "unknown"}`
    );
  } catch {
    // Non-critical, don't throw
  }
}

// ---------------------------------------------------------------------------
// Main router
// ---------------------------------------------------------------------------

export async function routeLLM(
  task: LLMTask,
  prompt: string,
  systemPrompt: string,
  industryCode?: string
): Promise<LLMResponse | null> {
  // Tier 1: Check if we can skip LLM entirely
  const isTier1 = await checkTier1(task, industryCode);
  if (isTier1) {
    console.log(
      `[llm-router] Tier 1 cache hit for ${task}/${industryCode} — caller should use templates`
    );
    return null;
  }

  // Determine if this is a regulated industry
  const isRegulated = industryCode
    ? REGULATED_INDUSTRIES.has(industryCode)
    : false;

  // Add compliance system prompt for regulated industries
  let finalSystemPrompt = systemPrompt;
  if (isRegulated) {
    finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: This is a regulated industry. Do not make claims that could be considered professional advice. Include appropriate disclaimers.`;
  }

  // Tier 2: Route to appropriate LLM (Gemini SDK or Claude)
  const primaryFn = getDefaultLLM(task, isRegulated);
  const response = await primaryFn(prompt, finalSystemPrompt);

  if (response) {
    await logLLMCall(task, response, industryCode);
    return response;
  }

  // Tier 2.5: Try engine's multi-provider router (multi-key Gemini + OpenRouter free models)
  // Skipped for regulated content — only Claude is appropriate
  if (!isRegulated) {
    console.warn(
      `[llm-router] Primary LLM failed for ${task}, trying engine router (multi-key + OpenRouter)...`
    );
    const engineResponse = await engineRoute(prompt, finalSystemPrompt);

    if (engineResponse) {
      await logLLMCall(task, engineResponse, industryCode);
      return engineResponse;
    }
  }

  // Tier 3: Claude fallback (premium, or Gemini Pro if primary was Claude)
  console.warn(
    `[llm-router] Engine router failed for ${task}, trying final fallback...`
  );
  const fallbackFn = isRegulated ? geminiPro : claudeFallback;
  const fallbackResponse = await fallbackFn(prompt, finalSystemPrompt);

  if (fallbackResponse) {
    await logLLMCall(task, fallbackResponse, industryCode);
    return fallbackResponse;
  }

  // All tiers failed — return null so caller uses template fallback
  console.error(
    `[llm-router] All LLMs failed for ${task}. Caller should use template fallback.`
  );
  return null;
}
