// =============================================================================
// Xusmo Multi-Agent Engine — Core Types
// =============================================================================

// ---------------------------------------------------------------------------
// Agent Identity
// ---------------------------------------------------------------------------

export type AgentName =
  | "router"
  | "builder"
  | "editor"
  | "ecommerce"
  | "seo"
  | "image"
  | "vibe";

export type AgentStatus =
  | "idle"
  | "thinking"
  | "generating"
  | "executing"
  | "completed"
  | "failed";

// ---------------------------------------------------------------------------
// Blueprint — The structured plan agents work from
// ---------------------------------------------------------------------------

export interface SiteBlueprint {
  businessName: string;
  industry: string;
  archetype: "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";
  personality: string;
  description: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  differentiator: string;
  targetAudience: string;
  tone: string;
  colors: string[];
  services: { name: string; description: string; featured: boolean }[];
  pages: PageBlueprint[];
  plugins: string[];
  isEcommerce: boolean;
  products?: ProductBlueprint[];
}

export interface PageBlueprint {
  slug: string;
  title: string;
  goal: string;
  sections: SectionBlueprint[];
  seo: { metaTitle: string; metaDesc: string };
}

export interface SectionBlueprint {
  component: string;
  props: Record<string, unknown>;
  layout: {
    background: string;
    padding: string;
    width: string;
    align: string;
  };
  style: Record<string, string>;
}

export interface ProductBlueprint {
  name: string;
  price: string;
  description: string;
  category: string;
  image?: string;
  sku?: string;
}

// ---------------------------------------------------------------------------
// Agent Input/Output
// ---------------------------------------------------------------------------

export interface AgentInput {
  siteId: string;
  prompt: string;
  context: AgentContext;
  history?: { role: "user" | "assistant"; text: string }[];
}

export interface AgentContext {
  businessName: string;
  archetype: string;
  industry: string;
  existingSite: boolean;
  hasDesignDocument: boolean;
  hasWordPress: boolean;
  wpUrl: string | null;
  currentPages: { slug: string; title: string; sectionCount: number }[];
  currentTheme: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    radius: string;
  } | null;
  currentSections: Record<string, { component: string; propKeys: string[] }[]>;
}

export interface AgentResult {
  agent: AgentName;
  status: "completed" | "failed";
  reply: string;
  actions: AgentAction[];
  nextAgent?: AgentName;
  blueprint?: Partial<SiteBlueprint>;
  progress?: number;
  durationMs?: number;
}

export interface AgentAction {
  type: string;
  success: boolean;
  label: string;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Agent Progress (for real-time UI updates)
// ---------------------------------------------------------------------------

export interface AgentProgress {
  agent: AgentName;
  status: AgentStatus;
  message: string;
  progress: number; // 0-100
  actions: AgentAction[];
}

// ---------------------------------------------------------------------------
// Router Decision
// ---------------------------------------------------------------------------

export interface RouterDecision {
  primaryAgent: AgentName;
  secondaryAgents: AgentName[];
  intent: string;
  confidence: number;
  isNewSite: boolean;
  isEdit: boolean;
  isEcommerce: boolean;
  needsImages: boolean;
  needsSEO: boolean;
}

// ---------------------------------------------------------------------------
// WordPress Output
// ---------------------------------------------------------------------------

export interface WordPressOutput {
  theme: {
    name: string;
    themeJson: Record<string, unknown>;
    customCss: string;
    templateFiles: Record<string, string>;
  };
  pages: {
    slug: string;
    title: string;
    content: string; // Gutenberg block HTML
    template?: string;
    metaTitle: string;
    metaDesc: string;
  }[];
  plugins: string[];
  menus: {
    name: string;
    items: { title: string; url: string; order: number }[];
  }[];
  options: Record<string, string>;
  media: { filename: string; url: string; alt: string }[];
}
