// =============================================================================
// Claude Fallback Client (Anthropic)
// Used for regulated industries and as a fallback when Gemini fails.
// Usage: import { claudeFallback } from "@/lib/llm/claude";
// =============================================================================

import Anthropic from "@anthropic-ai/sdk";
import type { LLMResponse } from "./types";

// ---------------------------------------------------------------------------
// Cost constants (USD per 1M tokens) — Claude Sonnet 4
// ---------------------------------------------------------------------------

const INPUT_COST = 3.0 / 1_000_000;
const OUTPUT_COST = 15.0 / 1_000_000;

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

function getClient(): Anthropic | null {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
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
        `[claude] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        err instanceof Error ? err.message : err
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

// ---------------------------------------------------------------------------
// Claude Fallback
// ---------------------------------------------------------------------------

export async function claudeFallback(
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse | null> {
  const client = getClient();
  if (!client) return null;

  try {
    return await withRetry(async () => {
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        temperature: 0.5,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      const inputTokens = message.usage.input_tokens;
      const outputTokens = message.usage.output_tokens;
      const tokensUsed = inputTokens + outputTokens;
      const cost = inputTokens * INPUT_COST + outputTokens * OUTPUT_COST;

      return {
        text,
        tokensUsed,
        model: "claude-sonnet-4-20250514",
        cost,
      };
    });
  } catch (err) {
    console.error("[claude] Failed after retries:", err);
    return null;
  }
}
