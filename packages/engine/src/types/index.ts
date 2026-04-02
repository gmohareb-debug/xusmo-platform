// ── Canonical Schema ───────────────────────────────────────────
// This is the single source of truth for site data across the entire platform.
// Everything else (Gutenberg blocks, static HTML, WP pages) is derived from this.

export interface SiteDocument {
  schemaVersion: "1.0.0";
  site: SiteMeta;
  pages: PageDef[];
  theme: ThemeDef;
  assets: AssetDef[];
}

export interface SiteMeta {
  id: string;
  title: string;
  slug: string;
  archetype: Archetype;
  personality: Personality;
  businessProfile?: BusinessProfile;
  createdAt: string;
  updatedAt: string;
}

export interface PageDef {
  slug: string;
  title: string;
  sections: SectionDef[];
  meta?: PageMeta;
}

export interface SectionDef {
  id: string;
  component: string;
  props: Record<string, unknown>;
  layout: SectionLayout;
  style?: Record<string, string>;
}

export interface SectionLayout {
  background: "none" | "surface" | "muted" | "gradient" | "accent" | "dark";
  padding: "none" | "sm" | "md" | "lg" | "xl";
  width: "contained" | "full";
  align?: "left" | "center" | "right";
}

export interface ThemeDef {
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: string;
  tokens?: Record<string, string>;
}

export interface ThemeColors {
  accent: string;
  accentLight: string;
  surface: string;
  background: string;
  text: string;
  border: string;
  muted: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  structuredData?: object;
}

export interface AssetDef {
  id: string;
  url: string;
  type: "image" | "logo" | "icon" | "video";
  keywords: string[];
  provider: "pexels" | "unsplash" | "flux" | "picsum" | "upload";
  width?: number;
  height?: number;
}

export interface BusinessProfile {
  businessName: string;
  industry: string;
  targetAudience: string;
  primaryPainPoint: string;
  valueProposition: string;
  tone: string;
  websiteGoal: string;
  uniqueSellingPoints: string[];
  keyServices: string[];
}

// ── Enums ──────────────────────────────────────────────────────

export type Archetype =
  | "SERVICE"
  | "VENUE"
  | "PORTFOLIO"
  | "COMMERCE"
  | "INFORMATIONAL";

export type Personality =
  | "minimal"
  | "bold"
  | "editorial"
  | "warm-organic"
  | "dark-luxury"
  | "geometric"
  | "playful"
  | "corporate";

// ── Component Types ────────────────────────────────────────────

export interface ComponentDef {
  name: string;
  description: string;
  category: ComponentCategory;
  props: Record<string, PropDef>;
  excludeFromGeneration?: boolean;
}

export interface PropDef {
  type: "string" | "number" | "boolean" | "array" | "object" | "url" | "color";
  description?: string;
  required?: boolean;
  default?: unknown;
}

export type ComponentCategory =
  | "navigation"
  | "hero"
  | "content"
  | "services"
  | "social-proof"
  | "forms"
  | "media"
  | "ecommerce"
  | "utility";

// ── Generation Types ───────────────────────────────────────────

export interface GenerationRequest {
  /** Raw text prompt (Word1 mode) */
  prompt?: string;
  /** Structured interview data (Xusmo mode) */
  blueprint?: Record<string, unknown>;
  /** Override archetype selection */
  archetype?: Archetype;
  /** Override personality selection */
  personality?: Personality;
  /** Specific pages to generate */
  pages?: string[];
  /** Regenerate theme only */
  mode?: "full" | "theme-only" | "layout-only";
  /** Existing theme to preserve (for layout-only mode) */
  currentTheme?: ThemeDef;
  /** Existing pages to preserve (for theme-only mode) */
  currentPages?: Record<string, PageDef>;
}

export interface GenerationResult {
  site: SiteDocument;
  plan: SitePlan;
  cost: CostBreakdown;
}

export interface SitePlan {
  archetype: Archetype;
  personality: Personality;
  businessProfile: BusinessProfile;
  selectedPages: string[];
  selectedComponents: string[];
  heroVariant: string;
  homeVariant: string;
}

export interface CostBreakdown {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  provider: string;
  model: string;
  durationMs: number;
}

// ── LLM Types ──────────────────────────────────────────────────

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export interface LLMProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  priority: number;
  maxRetries?: number;
}

// ── Editor Types ───────────────────────────────────────────────

export interface EditorConfig {
  features: {
    aiGeneration: boolean;
    dragDrop: boolean;
    propEditing: boolean;
    themeEditor: boolean;
    addSections: boolean;
    devicePreview: boolean;
    pageManagement: boolean;
    seoEditor: boolean;
  };
  callbacks: EditorCallbacks;
  constraints?: {
    maxPages?: number;
    maxSectionsPerPage?: number;
    allowedComponents?: string[];
    readOnly?: boolean;
  };
}

export interface EditorCallbacks {
  onSave: (site: SiteDocument) => Promise<void>;
  onLoad: () => Promise<SiteDocument | null>;
  onPublish?: (site: SiteDocument) => Promise<PublishResult>;
  onGenerate?: (request: GenerationRequest) => Promise<GenerationResult>;
}

// ── Publish Types ──────────────────────────────────────────────

export type PublishTarget = "lumin" | "wordpress" | "static" | "archive";

export interface PublishConfig {
  target: PublishTarget;
  /** Lumin API URL */
  luminUrl?: string;
  /** Lumin API key */
  luminApiKey?: string;
  /** WordPress site URL (for WP-CLI) */
  wpUrl?: string;
  /** WordPress site path on filesystem */
  wpPath?: string;
  /** Output directory for static/archive export */
  outputDir?: string;
}

export interface PublishResult {
  success: boolean;
  target: PublishTarget;
  url?: string;
  error?: string;
}
