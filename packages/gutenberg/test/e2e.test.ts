// =============================================================================
// @xusmo/gutenberg — End-to-End Test Suite
// Validates all extracted functionality works independently.
// Run: npx tsx packages/gutenberg/test/e2e.test.ts
// =============================================================================

import {
  // Registry
  getPageLayout,
  getPageLayoutWithDesignPackage,
  getAllPatternsForSite,
  classifyDesignStyle,
  getDesignStyleLayout,
  PAGE_LAYOUTS,
  DESIGN_STYLE_HOME_LAYOUTS,
  // Hydrator
  loadPattern,
  hydratePattern,
  hydratePatternContent,
  // Presets
  getThemePreset,
  mergeUserColors,
  // Theme JSON
  buildThemeJson,
  buildWpGlobalStyles,
  getFontPairForIndustry,
  // Content Generator
  generatePageContent,
  buildFallbackSlots,
  buildSlotPrompt,
  buildSystemPrompt,
  // Image Planner
  generateImagePlan,
  // Logo Generator
  generateLogo,
  getIndustryIcon,
  // Blog Generator
  generateBlogIdeas,
  generateBlogPost,
  isEligibleForAutoBlog,
  // Types
  type Archetype,
  type PatternSlug,
  type ThemePreset,
  type LLMFunction,
  type SimpleLLMFunction,
  type GeneratePageContentOptions,
  type ImagePlan,
  type LogoResult,
  type BlogPostIdea,
} from "../src/index";

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
  console.log("\n=== @xusmo/gutenberg E2E Test Suite ===\n");

  // ── Registry Tests ─────────────────────────────────────────────────────
  console.log("Registry:");

  assert(Object.keys(PAGE_LAYOUTS).length === 4, "PAGE_LAYOUTS has 4 archetypes");
  assert(PAGE_LAYOUTS.SERVICE.home.length >= 4, "SERVICE home has 4+ patterns");
  assert(PAGE_LAYOUTS.VENUE.home.length >= 4, "VENUE home has 4+ patterns");
  assert(PAGE_LAYOUTS.PORTFOLIO.home.length >= 4, "PORTFOLIO home has 4+ patterns");
  assert(PAGE_LAYOUTS.COMMERCE.home.length >= 4, "COMMERCE home has 4+ patterns");

  const serviceHome = getPageLayout("SERVICE", "home");
  assert(serviceHome[0] === "hero-split-screen", "SERVICE home starts with hero-split-screen");
  assert(serviceHome.includes("cta-banner"), "SERVICE home includes cta-banner");

  const fallback = getPageLayout("SERVICE", "nonexistent");
  assert(fallback[0] === "hero-image-bg", "Unknown page falls back to hero-image-bg");

  // Design package override
  const customLayout = getPageLayoutWithDesignPackage("SERVICE", "home", {
    homeLayout: ["hero-cinematic", "services-overlay-cards"],
  });
  assert(customLayout[0] === "hero-cinematic", "Design package overrides home layout");

  // getAllPatternsForSite
  const allPatterns = getAllPatternsForSite("SERVICE", ["home", "about", "contact"]);
  assert(allPatterns.size >= 8, "getAllPatternsForSite returns 8+ unique patterns");

  // Design styles
  assert(Object.keys(DESIGN_STYLE_HOME_LAYOUTS).length === 8, "8 design styles defined");
  const darkLuxury = getDesignStyleLayout("dark-luxury");
  assert(darkLuxury[0] === "hero-cinematic", "dark-luxury starts with hero-cinematic");

  // classifyDesignStyle
  const corporate = classifyDesignStyle({
    colors: { background: "#ffffff" },
    fonts: { heading: "Inter" },
    borderRadius: { medium: "6" },
  });
  assert(corporate === "clean-corporate", "Light bg + sans = clean-corporate");

  console.log("");

  // ── Hydrator Tests ─────────────────────────────────────────────────────
  console.log("Hydrator:");

  const heroTemplate = await loadPattern("hero-split-screen");
  assert(heroTemplate.length > 100, "hero-split-screen template loaded (>100 chars)");
  assert(!heroTemplate.includes("<?php"), "PHP header stripped");
  assert(heroTemplate.includes("Grow Your Business"), "Template contains placeholder text");

  const hydrated = await hydratePattern("hero-split-screen", {
    headline: "Test Headline Here",
    description: "Custom description text.",
    cta_primary: "Call Now",
    cta_secondary: "Learn More",
  });
  assert(hydrated.includes("Test Headline Here"), "Hydration replaced headline");
  assert(!hydrated.includes("Grow Your Business"), "Original placeholder removed");
  assert(hydrated.includes("Call Now"), "CTA primary replaced");

  // Test pattern caching
  const heroTemplate2 = await loadPattern("hero-split-screen");
  assert(heroTemplate2 === heroTemplate, "Pattern cache works (same reference)");

  console.log("");

  // ── Presets Tests ──────────────────────────────────────────────────────
  console.log("Presets:");

  const servicePreset = getThemePreset("SERVICE");
  assert(servicePreset.colors.primary === "#1e40af", "SERVICE preset primary is #1e40af");
  assert(servicePreset.fonts.heading === "Inter", "SERVICE preset heading font is Inter");

  const venuePreset = getThemePreset("VENUE");
  assert(venuePreset.colors.primary === "#7c2d12", "VENUE preset primary is #7c2d12");
  assert(venuePreset.fonts.heading === "Cormorant Garamond", "VENUE heading is serif");

  const merged = mergeUserColors(servicePreset, ["#ff0000", "#00ff00"]);
  assert(merged.colors.primary === "#ff0000", "mergeUserColors overrides primary");
  assert(merged.colors.secondary === "#00ff00", "mergeUserColors overrides secondary");
  assert(merged.fonts.heading === "Inter", "mergeUserColors preserves fonts");

  // Fallback to SERVICE for unknown archetype
  const unknownPreset = getThemePreset("UNKNOWN" as Archetype);
  assert(unknownPreset.colors.primary === "#1e40af", "Unknown archetype falls back to SERVICE");

  console.log("");

  // ── Theme JSON Tests ───────────────────────────────────────────────────
  console.log("Theme JSON:");

  const themeJson = buildThemeJson(servicePreset);
  assert((themeJson as any).version === 3, "theme.json version is 3");
  assert((themeJson as any).settings?.color?.palette?.length === 9, "9 color palette entries");
  assert((themeJson as any).settings?.typography?.fontFamilies?.length === 2, "2 font families");
  assert((themeJson as any).styles?.elements?.button !== undefined, "Button styles defined");

  const fontPair = getFontPairForIndustry("clean sans-serif");
  assert(fontPair.heading === "DM Sans", "clean sans-serif heading is DM Sans");

  const legacy = buildWpGlobalStyles(["#ff0000"], "clean sans-serif");
  assert((legacy as any).settings?.color?.palette?.[0]?.color === "#ff0000", "Legacy global styles work");

  console.log("");

  // ── Content Generator Tests ────────────────────────────────────────────
  console.log("Content Generator:");

  const bizInfo = {
    name: "AceMech HVAC",
    description: "Leading HVAC contractor in Austin TX",
    tagline: "Keeping Austin Cool Since 2005",
    phone: "(512) 555-0123",
    email: "info@acemech.com",
    location: "Austin, TX",
    yearsInBusiness: "18 years",
  };
  const services = [
    { name: "AC Repair", description: "Fast, reliable AC repair for homes and businesses", featured: true },
    { name: "Heating Installation", description: "Energy-efficient heating system installation", featured: true },
    { name: "Duct Cleaning", description: "Professional duct cleaning and sanitization", featured: true },
  ];
  const story = {
    foundingStory: "Started in a garage",
    differentiator: "24/7 emergency service",
    targetAudience: "Austin homeowners",
    uniqueSellingPoint: "Same-day service guarantee",
    certifications: "EPA certified, NATE certified",
    serviceAreas: "Austin, Round Rock, Cedar Park",
  };

  // buildSlotPrompt
  const heroPrompt = buildSlotPrompt("hero-split-screen", bizInfo, services, story, "HVAC", "SERVICE", []);
  assert(heroPrompt.prompt.includes("AceMech HVAC"), "Slot prompt includes business name");
  assert(heroPrompt.expectedSlots.includes("headline"), "Expected slots include headline");
  assert(heroPrompt.expectedSlots.includes("cta_primary"), "Expected slots include cta_primary");

  // buildSystemPrompt
  const sysPrompt = buildSystemPrompt("friendly", "homeowners", "phone_calls");
  assert(sysPrompt.includes("friendly"), "System prompt includes tone");
  assert(sysPrompt.includes("homeowners"), "System prompt includes audience");
  assert(sysPrompt.includes("Call Now"), "System prompt includes phone CTA guidance");

  // buildFallbackSlots
  const fallbackSlots = buildFallbackSlots(
    "hero-split-screen",
    bizInfo,
    services,
    story,
    [],
    [],
    [],
    [{ type: "rating", value: "4.9/5 rating" }],
    "Mon-Fri 8AM-6PM",
    { phone: "(512) 555-0123", email: "info@acemech.com", formType: "form", showMap: true },
    "SERVICE",
    "phone_calls"
  );
  assert(fallbackSlots.headline.includes("AceMech") || fallbackSlots.headline.includes("Keeping Austin"), "Fallback uses tagline or business name");
  assert(fallbackSlots.cta_primary === "Call Us Today", "Fallback CTA matches phone_calls goal");
  assert(fallbackSlots.stat_2_number === "18+", "Fallback stats use years in business");

  // buildFallbackSlots for commerce
  const commerceSlots = buildFallbackSlots(
    "cta-banner",
    bizInfo,
    services,
    story,
    [],
    [],
    [],
    [],
    "",
    { phone: "", email: "", formType: "form", showMap: false },
    "COMMERCE",
    "sell_products"
  );
  assert(commerceSlots.cta_text === "Shop Now", "Commerce CTA defaults to Shop Now");

  // generatePageContent with mock LLM
  const mockLLM: LLMFunction = async () => null; // LLM unavailable — forces fallback
  const pageContent = await generatePageContent("home", {
    businessInfo: bizInfo,
    services,
    story,
    team: [],
    testimonials: [],
    faqs: [],
    trustSignals: [],
    contactPrefs: { phone: "(512) 555-0123", email: "info@acemech.com", formType: "form", showMap: true },
    businessHours: "Mon-Fri 8AM-6PM",
    industryName: "HVAC",
    archetype: "SERVICE",
    isRegulated: false,
  }, mockLLM);
  assert(pageContent.length > 500, "Generated page content is substantial (>500 chars)");
  assert(pageContent.includes("AceMech"), "Generated content contains business name");
  assert(pageContent.includes("wp:"), "Generated content contains Gutenberg blocks");

  console.log("");

  // ── Logo Generator Tests ───────────────────────────────────────────────
  console.log("Logo Generator:");

  const logo = generateLogo({
    businessName: "AceMech HVAC",
    industry: "hvac",
    archetype: "SERVICE",
    primaryColor: "#1e40af",
    accentColor: "#dc2626",
    headingFont: "Inter",
    borderRadius: "8",
  });
  assert(logo.type === "generated", "Logo type is generated");
  assert(logo.svg.includes("<svg"), "Full SVG contains <svg tag");
  assert(logo.svg.includes("AceMech HVAC"), "Full SVG contains business name");
  assert(logo.svgCompact.includes("<svg"), "Compact SVG contains <svg tag");
  assert(logo.dominantColors.length === 3, "3 dominant colors");
  assert(logo.dominantColors[0].hex === "#1e40af", "Primary color is first");

  // Industry icon lookup
  const hvacIcon = getIndustryIcon("hvac");
  assert(hvacIcon.length > 10, "HVAC icon path found");
  const unknownIcon = getIndustryIcon("nonexistent-industry-xyz");
  assert(unknownIcon.includes("M8 1L1"), "Unknown industry gets default icon");

  // Sharp vs rounded logo
  const sharpLogo = generateLogo({
    businessName: "Test",
    industry: "design",
    archetype: "PORTFOLIO",
    primaryColor: "#000",
    accentColor: "#fff",
    headingFont: "DM Sans",
    borderRadius: "0",
  });
  assert(sharpLogo.svg.includes("rect") && !sharpLogo.svg.includes("rx="), "Sharp logo uses rect without radius");

  console.log("");

  // ── Blog Generator Tests ───────────────────────────────────────────────
  console.log("Blog Generator:");

  assert(isEligibleForAutoBlog("PRO") === true, "PRO tier eligible");
  assert(isEligibleForAutoBlog("AGENCY") === true, "AGENCY tier eligible");
  assert(isEligibleForAutoBlog("STARTER") === false, "STARTER tier not eligible");
  assert(isEligibleForAutoBlog("FREE") === false, "FREE tier not eligible");

  // Blog ideas with failing LLM (should use templates)
  const failingLLM: SimpleLLMFunction = async () => null;
  const ideas = await generateBlogIdeas("HVAC", "AceMech HVAC", failingLLM, 3);
  assert(ideas.length === 3, "3 fallback blog ideas generated");
  assert(ideas[0].title.includes("HVAC"), "Blog ideas are industry-specific");
  assert(ideas[0].keywords.length >= 2, "Blog ideas have keywords");

  // Blog post with failing LLM (should use placeholder)
  const post = await generateBlogPost(ideas[0], "AceMech HVAC", "HVAC", failingLLM);
  assert(post.title === ideas[0].title, "Blog post title matches idea");
  assert(post.llmModel === "fallback", "Fallback model used when LLM unavailable");
  assert(Array.isArray(post.content), "Blog post content is array");

  // Blog ideas with mock LLM that returns JSON
  const mockBlogLLM: SimpleLLMFunction = async () => ({
    text: JSON.stringify([
      { title: "LLM Generated Idea", topic: "test", keywords: ["llm", "test"], targetWordCount: 1000 },
    ]),
    model: "test-model",
    cost: 0.001,
  });
  const llmIdeas = await generateBlogIdeas("HVAC", "AceMech", mockBlogLLM, 1);
  assert(llmIdeas[0].title === "LLM Generated Idea", "LLM blog ideas parsed correctly");

  console.log("");

  // ── Image Planner Tests ────────────────────────────────────────────────
  console.log("Image Planner:");

  // Without PEXELS_API_KEY, generateImagePlan should return empty plan gracefully
  const origKey = process.env.PEXELS_API_KEY;
  delete process.env.PEXELS_API_KEY;

  const emptyPlan = await generateImagePlan({
    name: "AceMech HVAC",
    industry: "HVAC",
    archetype: "SERVICE",
    description: "HVAC contractor",
    serviceNames: ["AC Repair", "Heating"],
    teamCount: 4,
    testimonialCount: 3,
  });
  assert(emptyPlan.hero === null, "No hero image without API key");
  assert(emptyPlan.services.length === 0, "No service images without API key");
  assert(emptyPlan.team.length === 0, "No team images without API key");

  if (origKey) process.env.PEXELS_API_KEY = origKey;

  console.log("");

  // ── Summary ────────────────────────────────────────────────────────────
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
