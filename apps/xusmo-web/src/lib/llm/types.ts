// =============================================================================
// LLM Shared Types
// =============================================================================

export type LLMResponse = {
  text: string;
  tokensUsed: number;
  model: string;
  cost: number; // estimated USD
};

export type LLMTask =
  | "classify"
  | "generate_content"
  | "generate_pattern_content"
  | "generate_seo"
  | "generate_tagline"
  | "quality_check"
  | "regulated_content";
