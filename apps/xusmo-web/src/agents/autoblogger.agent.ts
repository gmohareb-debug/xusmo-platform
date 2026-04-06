// =============================================================================
// Auto-Blogger Agent — Thin wrapper around @xusmo/gutenberg blog generator
// Injects Gemini LLM functions from xusmo-web's LLM layer.
// =============================================================================

import { geminiFlash, geminiPro } from "@/lib/llm/gemini";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import {
  generateBlogIdeas as _generateBlogIdeas,
  generateBlogPost as _generateBlogPost,
  isEligibleForAutoBlog,
  type BlogPostIdea,
  type GeneratedBlogPost,
  type SimpleLLMFunction,
} from "@xusmo/gutenberg";

// Re-export types and eligibility check
export { isEligibleForAutoBlog };
export type { BlogPostIdea, GeneratedBlogPost };

// ---------------------------------------------------------------------------
// LLM adapters — wrap xusmo-web's Gemini functions to match SimpleLLMFunction
// ---------------------------------------------------------------------------

const flashAdapter: SimpleLLMFunction = async (prompt, systemPrompt) => {
  return geminiFlash(prompt, systemPrompt);
};

const proAdapter: SimpleLLMFunction = async (prompt, systemPrompt) => {
  return geminiPro(prompt, systemPrompt);
};

// ---------------------------------------------------------------------------
// Wrapped generators — inject LLM functions
// ---------------------------------------------------------------------------

export async function generateBlogIdeas(
  industry: string,
  businessName: string,
  count: number = 4
): Promise<BlogPostIdea[]> {
  return _generateBlogIdeas(industry, businessName, flashAdapter, count);
}

export async function generateBlogPost(
  idea: BlogPostIdea,
  businessName: string,
  industry: string
): Promise<GeneratedBlogPost> {
  return _generateBlogPost(idea, businessName, industry, proAdapter);
}
