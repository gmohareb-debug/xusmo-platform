// @xusmo/engine — shared AI website generation engine
//
// This is the core brain used by both Xusmo (SaaS) and Word1 (engine product).
// It provides: AI generation pipeline, 95-component system, LLM routing,
// theme personalities, and image resolution.

// Canonical types
export * from './types/index'

// Re-export submodules (consumers can also import directly via @xusmo/engine/ai etc.)
export { generateFull, generateThemeOnly, generateLayoutOnly, callLLMRaw } from './ai/generate'
export { resolveImages } from './ai/image-resolver'
export {
  ARCHETYPE_PRESETS,
  getArchetypeComponents,
  VISUAL_PERSONALITIES,
  PERSONALITY_TOKENS,
} from './ai/component-groups'
