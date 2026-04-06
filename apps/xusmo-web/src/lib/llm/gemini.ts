// =============================================================================
// Gemini Client (Google AI) — Enhanced with prompt caching + cost tracking
//   - geminiFlash: Gemini 2.5 Flash — fast, cheap (classification, short tasks)
//   - geminiPro: Gemini 2.5 Pro — quality (content generation)
//   - Both now check prompt cache before calling API
// Usage: import { geminiFlash, geminiPro } from "@/lib/llm/gemini";
// =============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMResponse } from "./types";
import {
  getCachedLLMResponse,
  setCachedLLMResponse,
  trackLLMCost,
} from "@/lib/agents/agent-memory";

// ---------------------------------------------------------------------------
// Cost constants (USD per 1M tokens)
// ---------------------------------------------------------------------------

const FLASH_INPUT_COST = 0.01 / 1_000_000;
const FLASH_OUTPUT_COST = 0.04 / 1_000_000;
const PRO_INPUT_COST = 0.07 / 1_000_000;
const PRO_OUTPUT_COST = 0.28 / 1_000_000;

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

// ---------------------------------------------------------------------------
// Retry with exponential backoff
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `[gemini] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        err instanceof Error ? err.message : err
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

// ---------------------------------------------------------------------------
// Gemini Flash — fast, cheap (with caching)
// ---------------------------------------------------------------------------

export async function geminiFlash(
  prompt: string,
  systemPrompt?: string,
  options?: { skipCache?: boolean; agentName?: string }
): Promise<LLMResponse | null> {
  // Check cache first (unless explicitly skipped)
  if (!options?.skipCache) {
    try {
      const cached = await getCachedLLMResponse(systemPrompt || "", prompt);
      if (cached) {
        return { text: cached, tokensUsed: 0, model: "gemini-2.5-flash (cached)", cost: 0 };
      }
    } catch { /* cache miss, proceed to API */ }
  }

  const client = getClient();
  if (!client) return null;

  try {
    return await withRetry(async () => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      const inputTokens = usage?.promptTokenCount ?? 0;
      const outputTokens = usage?.candidatesTokenCount ?? 0;
      const tokensUsed = inputTokens + outputTokens;
      const cost =
        inputTokens * FLASH_INPUT_COST + outputTokens * FLASH_OUTPUT_COST;

      // Cache the response
      try {
        await setCachedLLMResponse(systemPrompt || "", prompt, text, tokensUsed);
      } catch { /* non-critical */ }

      // Track cost
      trackLLMCost(options?.agentName || "flash", tokensUsed, cost);

      return { text, tokensUsed, model: "gemini-2.5-flash", cost };
    });
  } catch (err) {
    console.error("[gemini-flash] Failed after retries:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gemini Pro — quality content generation (with caching)
// ---------------------------------------------------------------------------

export async function geminiPro(
  prompt: string,
  systemPrompt?: string,
  options?: { skipCache?: boolean; agentName?: string }
): Promise<LLMResponse | null> {
  // Check cache first — Pro calls are expensive, caching saves $$$
  if (!options?.skipCache) {
    try {
      const cached = await getCachedLLMResponse(systemPrompt || "", prompt);
      if (cached) {
        return { text: cached, tokensUsed: 0, model: "gemini-2.5-pro (cached)", cost: 0 };
      }
    } catch { /* cache miss, proceed to API */ }
  }

  const client = getClient();
  if (!client) return null;

  try {
    return await withRetry(async () => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      const inputTokens = usage?.promptTokenCount ?? 0;
      const outputTokens = usage?.candidatesTokenCount ?? 0;
      const tokensUsed = inputTokens + outputTokens;
      const cost =
        inputTokens * PRO_INPUT_COST + outputTokens * PRO_OUTPUT_COST;

      // Cache the response
      try {
        await setCachedLLMResponse(systemPrompt || "", prompt, text, tokensUsed);
      } catch { /* non-critical */ }

      // Track cost
      trackLLMCost(options?.agentName || "pro", tokensUsed, cost);

      return { text, tokensUsed, model: "gemini-2.5-pro", cost };
    });
  } catch (err) {
    console.error("[gemini-pro] Failed after retries:", err);
    return null;
  }
}
