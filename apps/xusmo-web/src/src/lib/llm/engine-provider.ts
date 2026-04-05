// =============================================================================
// Engine LLM Provider — Multi-key, multi-model resilient routing
// Wraps @xusmo/engine's callLLMRaw (Gemini keys + OpenRouter free models)
// to return the LLMResponse format expected by xusmo-web's router.
// =============================================================================

import { callLLMRaw } from "@xusmo/engine";
import type { LLMResponse } from "./types";

export async function engineRoute(
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse | null> {
  try {
    const result = await callLLMRaw(
      systemPrompt || "",
      prompt,
      { temperature: 0.7 }
    );

    return {
      text: result.text,
      tokensUsed: 0, // engine router doesn't track token counts
      model: result.provider || "engine-router",
      cost: 0, // uses free models by default
    };
  } catch (err) {
    console.warn(
      "[engine-provider] All engine LLM routes failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
