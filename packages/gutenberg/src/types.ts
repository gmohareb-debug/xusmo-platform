// =============================================================================
// Shared types for @xusmo/gutenberg
// =============================================================================

/** Business archetype — determines page layouts, theme presets, and content tone. */
export type Archetype = "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";

/** LLM function interface — injected by the host application. */
export interface LLMFunction {
  (
    task: string,
    prompt: string,
    systemPrompt: string,
    industryCode?: string
  ): Promise<{ text: string } | null>;
}

/** LLM function for simple prompt→text (blog generator style). */
export interface SimpleLLMFunction {
  (prompt: string, systemPrompt: string): Promise<{
    text: string;
    model: string;
    cost: number;
  } | null>;
}
