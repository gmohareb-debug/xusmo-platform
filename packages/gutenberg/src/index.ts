// =============================================================================
// @xusmo/gutenberg — Gutenberg pattern-based site content generator
// Loosely coupled, independently integratable content generation package.
// =============================================================================

// --- Types ---
export type { Archetype, LLMFunction, SimpleLLMFunction } from "./types";

// --- Pattern Registry ---
export {
  getPageLayout,
  getPageLayoutWithDesignPackage,
  getAllPatternsForSite,
  classifyDesignStyle,
  getDesignStyleLayout,
  PAGE_LAYOUTS,
  DESIGN_STYLE_HOME_LAYOUTS,
} from "./registry";
export type {
  PatternSlug,
  DesignPackage,
  DesignStyle,
} from "./registry";

// --- Pattern Hydration ---
export {
  loadPattern,
  hydratePattern,
  hydratePatternContent,
} from "./hydrator";
export type { PatternSlots } from "./hydrator";

// --- Theme Presets ---
export {
  getThemePreset,
  mergeUserColors,
} from "./presets";
export type { ThemePreset } from "./presets";

// --- Theme JSON ---
export {
  buildThemeJson,
  buildWpGlobalStyles,
  getFontPairForIndustry,
} from "./theme-json";

// --- Content Generation ---
export {
  generatePageContent,
  generatePatternSlots,
  buildFallbackSlots,
  buildSlotPrompt,
  buildSystemPrompt,
} from "./content-generator";
export type {
  GeneratePageContentOptions,
  BlueprintBusinessInfo,
  BlueprintService,
  BlueprintPage,
  BlueprintStory,
  BlueprintTeamMember,
  BlueprintTestimonial,
  BlueprintFaq,
  BlueprintPortfolioItem,
  ContactPrefs,
} from "./content-generator";

// --- Image Planning ---
export {
  generateImagePlan,
} from "./image-planner";
export type {
  ImagePlan,
  SiteImage,
  BusinessContext,
} from "./image-planner";

// --- Logo Generation ---
export {
  generateLogo,
  getIndustryIcon,
} from "./logo-generator";
export type {
  LogoResult,
  LogoContext,
} from "./logo-generator";

// --- Blog Generation ---
export {
  generateBlogIdeas,
  generateBlogPost,
  isEligibleForAutoBlog,
} from "./blog-generator";
export type {
  BlogPostIdea,
  GeneratedBlogPost,
} from "./blog-generator";
