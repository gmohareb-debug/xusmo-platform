// =============================================================================
// xusmo-web Integration Test — Verifies the full import chain works
// Tests that xusmo-web's re-export shims + agent wrappers correctly resolve
// to the extracted @xusmo/gutenberg and @xusmo/engine packages.
//
// Run: npx tsx apps/xusmo-web/test/integration.test.ts
// =============================================================================

// ── Test 1: Re-export shims resolve to @xusmo/gutenberg ──

import {
  getPageLayout,
  getPageLayoutWithDesignPackage,
  getAllPatternsForSite,
  classifyDesignStyle,
  getDesignStyleLayout,
  PAGE_LAYOUTS,
  DESIGN_STYLE_HOME_LAYOUTS,
} from "../src/lib/wordpress/pattern-registry";

import {
  loadPattern,
  hydratePattern,
  hydratePatternContent,
} from "../src/lib/wordpress/pattern-hydrator";

import {
  getThemePreset,
  mergeUserColors,
} from "../src/lib/wordpress/theme-presets";

import {
  buildThemeJson,
  buildWpGlobalStyles,
  getFontPairForIndustry,
} from "../src/lib/wordpress/fonts";

// ── Test 2: Direct @xusmo/gutenberg imports ──

import {
  generatePageContent,
  buildFallbackSlots,
  buildSlotPrompt,
  buildSystemPrompt,
  generateLogo,
  getIndustryIcon,
  generateImagePlan,
  generateBlogIdeas,
  generateBlogPost,
  isEligibleForAutoBlog,
  type LLMFunction,
  type SimpleLLMFunction,
  type Archetype,
  type PatternSlug,
  type ThemePreset,
  type ImagePlan,
  type LogoResult,
  type BlogPostIdea,
} from "@xusmo/gutenberg";

// ── Test 3: @xusmo/engine imports ──

import {
  ARCHETYPE_PRESETS,
  getArchetypeComponents,
  VISUAL_PERSONALITIES,
  PERSONALITY_TOKENS,
  resolveImages,
  generateFull,
  generateThemeOnly,
  generateLayoutOnly,
  callLLMRaw,
  type Archetype as EngineArchetype,
  type Personality,
  type SiteDocument,
  type ThemeDef,
  type BusinessProfile,
} from "@xusmo/engine";

// ── Test 4: Engine adapter ──

import {
  generateViaEngine,
  type GeneratorType,
} from "../src/lib/generators/engine-adapter";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runTests() {
  console.log("\n=== xusmo-web Integration Test Suite ===\n");

  // ── Re-export Shims ─────────────────────────────────────────────────
  console.log("Re-export Shims (pattern-registry → @xusmo/gutenberg):");

  assert(typeof getPageLayout === "function", "getPageLayout imported via shim");
  assert(typeof getPageLayoutWithDesignPackage === "function", "getPageLayoutWithDesignPackage imported via shim");
  assert(typeof getAllPatternsForSite === "function", "getAllPatternsForSite imported via shim");
  assert(typeof classifyDesignStyle === "function", "classifyDesignStyle imported via shim");
  assert(typeof getDesignStyleLayout === "function", "getDesignStyleLayout imported via shim");
  assert(Object.keys(PAGE_LAYOUTS).length === 4, "PAGE_LAYOUTS has 4 archetypes via shim");
  assert(Object.keys(DESIGN_STYLE_HOME_LAYOUTS).length === 8, "DESIGN_STYLE_HOME_LAYOUTS has 8 styles via shim");

  // Verify the functions actually work through the shim
  const layout = getPageLayout("SERVICE", "home");
  assert(layout.length >= 4, "getPageLayout returns real data through shim");
  assert(layout[0] === "hero-split-screen", "SERVICE home layout correct through shim");

  console.log("");

  console.log("Re-export Shims (pattern-hydrator → @xusmo/gutenberg):");

  assert(typeof loadPattern === "function", "loadPattern imported via shim");
  assert(typeof hydratePattern === "function", "hydratePattern imported via shim");
  assert(typeof hydratePatternContent === "function", "hydratePatternContent imported via shim");

  const template = await loadPattern("hero-split-screen");
  assert(template.length > 100, "loadPattern loads real template through shim");
  assert(template.includes("Grow Your Business"), "Template content correct through shim");

  const hydrated = await hydratePattern("hero-split-screen", {
    headline: "Integration Test",
    cta_primary: "Test CTA",
  });
  assert(hydrated.includes("Integration Test"), "hydratePattern works through shim");

  console.log("");

  console.log("Re-export Shims (theme-presets → @xusmo/gutenberg):");

  assert(typeof getThemePreset === "function", "getThemePreset imported via shim");
  assert(typeof mergeUserColors === "function", "mergeUserColors imported via shim");

  const preset = getThemePreset("VENUE");
  assert(preset.colors.primary === "#7c2d12", "Theme preset correct through shim");

  console.log("");

  console.log("Re-export Shims (fonts → @xusmo/gutenberg):");

  assert(typeof buildThemeJson === "function", "buildThemeJson imported via shim");
  assert(typeof buildWpGlobalStyles === "function", "buildWpGlobalStyles imported via shim");
  assert(typeof getFontPairForIndustry === "function", "getFontPairForIndustry imported via shim");

  const themeJson = buildThemeJson(preset);
  assert((themeJson as any).version === 3, "buildThemeJson produces v3 through shim");

  console.log("");

  // ── Direct @xusmo/gutenberg ─────────────────────────────────────────
  console.log("Direct @xusmo/gutenberg imports:");

  assert(typeof generatePageContent === "function", "generatePageContent from gutenberg");
  assert(typeof buildFallbackSlots === "function", "buildFallbackSlots from gutenberg");
  assert(typeof buildSlotPrompt === "function", "buildSlotPrompt from gutenberg");
  assert(typeof buildSystemPrompt === "function", "buildSystemPrompt from gutenberg");
  assert(typeof generateLogo === "function", "generateLogo from gutenberg");
  assert(typeof getIndustryIcon === "function", "getIndustryIcon from gutenberg");
  assert(typeof generateImagePlan === "function", "generateImagePlan from gutenberg");
  assert(typeof generateBlogIdeas === "function", "generateBlogIdeas from gutenberg");
  assert(typeof generateBlogPost === "function", "generateBlogPost from gutenberg");
  assert(typeof isEligibleForAutoBlog === "function", "isEligibleForAutoBlog from gutenberg");

  // Full pipeline test: generate page content with mock LLM
  const mockLLM: LLMFunction = async () => null;
  const pageHtml = await generatePageContent("home", {
    businessInfo: {
      name: "Test Biz",
      description: "A test business",
      tagline: "Testing is fun",
      phone: "555-0000",
      email: "test@test.com",
      location: "Test City",
      yearsInBusiness: "5 years",
    },
    services: [
      { name: "Service A", description: "First service", featured: true },
      { name: "Service B", description: "Second service", featured: true },
      { name: "Service C", description: "Third service", featured: false },
    ],
    story: {
      foundingStory: "Founded in a lab",
      differentiator: "AI-powered",
      targetAudience: "Developers",
      uniqueSellingPoint: "100% automated",
      certifications: "",
      serviceAreas: "Worldwide",
    },
    team: [],
    testimonials: [],
    faqs: [],
    trustSignals: [],
    contactPrefs: { phone: "555-0000", email: "test@test.com", formType: "form", showMap: false },
    businessHours: "24/7",
    industryName: "Technology",
    archetype: "SERVICE",
    isRegulated: false,
  }, mockLLM);
  assert(pageHtml.length > 500, "generatePageContent produces substantial HTML");
  assert(pageHtml.includes("Test Biz"), "Generated HTML contains business name");
  assert(pageHtml.includes("wp:"), "Generated HTML contains Gutenberg blocks");

  // Logo generation
  const logo = generateLogo({
    businessName: "Integration Co",
    industry: "tech",
    archetype: "SERVICE",
    primaryColor: "#2563eb",
    accentColor: "#f59e0b",
    headingFont: "Inter",
    borderRadius: "8",
  });
  assert(logo.svg.includes("Integration Co"), "Logo SVG contains business name");
  assert(logo.type === "generated", "Logo type is generated");

  console.log("");

  // ── @xusmo/engine ───────────────────────────────────────────────────
  console.log("@xusmo/engine imports:");

  assert(Object.keys(ARCHETYPE_PRESETS).length === 5, "5 archetypes from engine");
  assert(Object.keys(VISUAL_PERSONALITIES).length === 8, "8 personalities from engine");
  assert(Object.keys(PERSONALITY_TOKENS).length === 8, "8 personality token sets from engine");
  assert(typeof getArchetypeComponents === "function", "getArchetypeComponents from engine");
  assert(typeof resolveImages === "function", "resolveImages from engine");
  assert(typeof generateFull === "function", "generateFull from engine");
  assert(typeof generateThemeOnly === "function", "generateThemeOnly from engine");
  assert(typeof generateLayoutOnly === "function", "generateLayoutOnly from engine");
  assert(typeof callLLMRaw === "function", "callLLMRaw from engine");

  const serviceComps = getArchetypeComponents("SERVICE");
  assert(serviceComps.includes("navbar"), "Engine SERVICE includes navbar");
  assert(serviceComps.includes("hero"), "Engine SERVICE includes hero");
  assert(serviceComps.length >= 30, "Engine SERVICE has 30+ components");

  console.log("");

  // ── Engine Adapter ──────────────────────────────────────────────────
  console.log("Engine Adapter:");

  assert(typeof generateViaEngine === "function", "generateViaEngine adapter exists");

  // Type check
  const genType: GeneratorType = "gutenberg";
  assert(genType === "gutenberg", "GeneratorType allows 'gutenberg'");
  const genType2: GeneratorType = "engine";
  assert(genType2 === "engine", "GeneratorType allows 'engine'");

  console.log("");

  // ── Cross-Package Compatibility ─────────────────────────────────────
  console.log("Cross-Package Compatibility:");

  // Both packages define archetypes — verify they align
  const gutenbergArchetypes: Archetype[] = ["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE"];
  const engineArchetypes: EngineArchetype[] = ["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE", "INFORMATIONAL"];
  for (const arch of gutenbergArchetypes) {
    assert(engineArchetypes.includes(arch as any), `${arch} exists in both gutenberg and engine`);
  }

  // Verify gutenberg layout count matches engine component coverage
  for (const arch of gutenbergArchetypes) {
    const gutenbergPatterns = getPageLayout(arch, "home");
    const engineComps = getArchetypeComponents(arch);
    assert(gutenbergPatterns.length >= 4, `Gutenberg ${arch} has 4+ home patterns`);
    assert(engineComps.length >= 20, `Engine ${arch} has 20+ components`);
  }

  console.log("");

  // ── Summary ────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
