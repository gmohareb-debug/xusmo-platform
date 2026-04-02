// =============================================================================
// @xusmo/engine — End-to-End Test Suite
// Validates all extracted functionality works independently.
// Run: npx tsx packages/engine/test/e2e.test.ts
// =============================================================================

import {
  // Component system
  ARCHETYPE_PRESETS,
  getArchetypeComponents,
  VISUAL_PERSONALITIES,
  PERSONALITY_TOKENS,
  // Image resolver
  resolveImages,
  // Generation functions (exist but need API keys)
  generateFull,
  generateThemeOnly,
  generateLayoutOnly,
  callLLMRaw,
  // Types
  type Archetype,
  type Personality,
  type SiteDocument,
  type PageDef,
  type SectionDef,
  type ThemeDef,
  type ThemeColors,
  type ThemeFonts,
  type BusinessProfile,
  type GenerationRequest,
  type GenerationResult,
  type SitePlan,
  type CostBreakdown,
  type LLMRequest,
  type LLMResponse,
  type EditorConfig,
  type PublishConfig,
  type PublishResult,
  type ComponentDef,
  type ComponentCategory,
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
  console.log("\n=== @xusmo/engine E2E Test Suite ===\n");

  // ── Archetype Presets ───────────────────────────────────────────────
  console.log("Archetype Presets:");

  const archetypes = Object.keys(ARCHETYPE_PRESETS) as Archetype[];
  assert(archetypes.length === 5, "5 archetypes defined (SERVICE, COMMERCE, VENUE, PORTFOLIO, INFORMATIONAL)");
  assert(archetypes.includes("SERVICE" as any), "SERVICE archetype exists");
  assert(archetypes.includes("COMMERCE" as any), "COMMERCE archetype exists");
  assert(archetypes.includes("VENUE" as any), "VENUE archetype exists");
  assert(archetypes.includes("PORTFOLIO" as any), "PORTFOLIO archetype exists");
  assert(archetypes.includes("INFORMATIONAL" as any), "INFORMATIONAL archetype exists");

  // Each archetype has description, groups, and extraComponents
  for (const arch of archetypes) {
    const preset = (ARCHETYPE_PRESETS as any)[arch];
    assert(typeof preset.description === "string" && preset.description.length > 10, `${arch} has description`);
    assert(Array.isArray(preset.groups) && preset.groups.length >= 5, `${arch} has 5+ component groups`);
    assert(Array.isArray(preset.extraComponents), `${arch} has extraComponents`);
  }

  // SERVICE should have CORE, HEROES, CONTENT, TRUST, SERVICES, PRICING, CONTACT...
  const servicePreset = (ARCHETYPE_PRESETS as any).SERVICE;
  assert(servicePreset.groups.length >= 9, "SERVICE has 9+ component groups");

  // COMMERCE should include ECOMMERCE group
  const commercePreset = (ARCHETYPE_PRESETS as any).COMMERCE;
  assert(commercePreset.groups.length >= 10, "COMMERCE has 10+ component groups (includes ECOMMERCE + SEARCH)");

  console.log("");

  // ── getArchetypeComponents ──────────────────────────────────────────
  console.log("getArchetypeComponents:");

  const serviceComponents = getArchetypeComponents("SERVICE");
  assert(Array.isArray(serviceComponents), "Returns array");
  assert(serviceComponents.length >= 30, "SERVICE has 30+ components");
  assert(serviceComponents.includes("navbar"), "SERVICE includes navbar");
  assert(serviceComponents.includes("footer"), "SERVICE includes footer");
  assert(serviceComponents.includes("hero"), "SERVICE includes hero");
  assert(serviceComponents.includes("services-section"), "SERVICE includes services-section");
  assert(serviceComponents.includes("testimonials"), "SERVICE includes testimonials");
  assert(serviceComponents.includes("contact"), "SERVICE includes contact");
  assert(serviceComponents.includes("pricing-table"), "SERVICE includes pricing-table");
  assert(serviceComponents.includes("faq-accordion"), "SERVICE includes faq-accordion");

  const commerceComponents = getArchetypeComponents("COMMERCE");
  assert(commerceComponents.includes("product-grid"), "COMMERCE includes product-grid");
  assert(commerceComponents.includes("product-card"), "COMMERCE includes product-card");
  assert(commerceComponents.includes("add-to-cart-button"), "COMMERCE includes add-to-cart-button");
  assert(commerceComponents.includes("advanced-search"), "COMMERCE includes advanced-search");

  const venueComponents = getArchetypeComponents("VENUE");
  assert(venueComponents.includes("gallery"), "VENUE includes gallery");
  assert(venueComponents.includes("carousel"), "VENUE includes carousel");

  const portfolioComponents = getArchetypeComponents("PORTFOLIO");
  assert(portfolioComponents.includes("gallery"), "PORTFOLIO includes gallery");
  assert(portfolioComponents.includes("lightbox"), "PORTFOLIO includes lightbox");

  // Unknown archetype falls back to SERVICE
  const unknownComponents = getArchetypeComponents("NONEXISTENT");
  assert(unknownComponents.length === serviceComponents.length, "Unknown archetype falls back to SERVICE");

  // No duplicates
  const uniqueService = new Set(serviceComponents);
  assert(uniqueService.size === serviceComponents.length, "No duplicate components in SERVICE");

  console.log("");

  // ── Visual Personalities ────────────────────────────────────────────
  console.log("Visual Personalities:");

  const personalities = Object.keys(VISUAL_PERSONALITIES) as Personality[];
  assert(personalities.length === 8, "8 visual personalities defined");

  const expectedPersonalities = ["minimal", "bold", "editorial", "warm-organic", "dark-luxury", "geometric", "playful", "corporate"];
  for (const p of expectedPersonalities) {
    assert(personalities.includes(p as any), `${p} personality exists`);
    const def = (VISUAL_PERSONALITIES as any)[p];
    assert(typeof def.description === "string" && def.description.length > 20, `${p} has description`);
    assert(Array.isArray(def.bestFor) && def.bestFor.length >= 3, `${p} has 3+ bestFor industries`);
  }

  // Verify industry mapping makes sense
  assert((VISUAL_PERSONALITIES as any).minimal.bestFor.includes("tech"), "minimal bestFor includes tech");
  assert((VISUAL_PERSONALITIES as any).bold.bestFor.includes("fitness"), "bold bestFor includes fitness");
  assert((VISUAL_PERSONALITIES as any).editorial.bestFor.includes("fashion"), "editorial bestFor includes fashion");
  assert((VISUAL_PERSONALITIES as any)["warm-organic"].bestFor.includes("restaurant"), "warm-organic bestFor includes restaurant");
  assert((VISUAL_PERSONALITIES as any)["dark-luxury"].bestFor.includes("hotel"), "dark-luxury bestFor includes hotel");
  assert((VISUAL_PERSONALITIES as any).geometric.bestFor.includes("fintech"), "geometric bestFor includes fintech");
  assert((VISUAL_PERSONALITIES as any).playful.bestFor.includes("kids"), "playful bestFor includes kids");
  assert((VISUAL_PERSONALITIES as any).corporate.bestFor.includes("legal"), "corporate bestFor includes legal");

  console.log("");

  // ── Personality Tokens ──────────────────────────────────────────────
  console.log("Personality Tokens:");

  assert(Object.keys(PERSONALITY_TOKENS).length === 8, "8 personality token sets");

  const requiredTokenKeys = ["radius", "shadow", "shadowHover", "cardBg", "gap", "cardPadding", "headingFont", "bodyFont", "radiusRange", "heroHeight", "headingSize"];
  for (const p of expectedPersonalities) {
    const tokens = (PERSONALITY_TOKENS as any)[p];
    for (const key of requiredTokenKeys) {
      assert(tokens[key] !== undefined, `${p} has ${key} token`);
    }
  }

  // Verify personality style distinctions
  assert((PERSONALITY_TOKENS as any).minimal.shadow === "none", "minimal has no shadow");
  assert((PERSONALITY_TOKENS as any).editorial.heroHeight === "100vh", "editorial hero is full viewport");
  assert((PERSONALITY_TOKENS as any)["dark-luxury"].heroHeight === "100vh", "dark-luxury hero is full viewport");
  assert(parseInt((PERSONALITY_TOKENS as any).playful.radius) >= 24, "playful has large radius (>=24px)");
  assert(parseInt((PERSONALITY_TOKENS as any).geometric.radius) <= 6, "geometric has small radius (<=6px)");
  assert(parseInt((PERSONALITY_TOKENS as any)["warm-organic"].radius) >= 20, "warm-organic has large radius (>=20px)");

  // Bold and playful have extraNote
  assert(typeof (PERSONALITY_TOKENS as any).bold.extraNote === "string", "bold has extraNote guidance");
  assert(typeof (PERSONALITY_TOKENS as any).playful.extraNote === "string", "playful has extraNote guidance");

  console.log("");

  // ── Component Catalog ───────────────────────────────────────────────
  console.log("Component Catalog:");

  // The catalog is loaded inside generate.js — we test it indirectly via
  // getArchetypeComponents returning valid keys that map to the catalog
  const allComponents = new Set<string>();
  for (const arch of archetypes) {
    for (const comp of getArchetypeComponents(arch)) {
      allComponents.add(comp);
    }
  }
  assert(allComponents.size >= 50, `${allComponents.size} unique components across all archetypes (50+ expected)`);

  // Core components in every archetype
  for (const arch of archetypes) {
    const comps = getArchetypeComponents(arch);
    assert(comps.includes("navbar"), `${arch} has navbar`);
    assert(comps.includes("footer"), `${arch} has footer`);
    assert(comps.includes("section-title"), `${arch} has section-title`);
  }

  console.log("");

  // ── Image Resolver (no API key) ─────────────────────────────────────
  console.log("Image Resolver:");

  // Without API keys, resolveImages should return object unchanged
  const origPexels = process.env.PEXELS_API_KEY;
  const origUnsplash = process.env.UNSPLASH_ACCESS_KEY;
  delete process.env.PEXELS_API_KEY;
  delete process.env.UNSPLASH_ACCESS_KEY;

  const testObj = {
    pages: [{
      sections: [{
        props: { image: "https://picsum.photos/seed/restaurant/1200/800" }
      }]
    }]
  };

  const resolved = await resolveImages(testObj, "1e40af");
  assert(resolved === testObj, "resolveImages returns same object without API keys");
  assert((resolved as any).pages[0].sections[0].props.image.includes("picsum.photos"), "picsum URL preserved when no API key");

  // Null/primitive inputs
  const nullResult = await resolveImages(null, "");
  assert(nullResult === null, "resolveImages handles null input");

  const strResult = await resolveImages("hello" as any, "");
  assert(strResult === "hello", "resolveImages handles string input");

  if (origPexels) process.env.PEXELS_API_KEY = origPexels;
  if (origUnsplash) process.env.UNSPLASH_ACCESS_KEY = origUnsplash;

  console.log("");

  // ── Generation Functions (existence check) ──────────────────────────
  console.log("Generation Functions:");

  assert(typeof generateFull === "function", "generateFull is exported function");
  assert(typeof generateThemeOnly === "function", "generateThemeOnly is exported function");
  assert(typeof generateLayoutOnly === "function", "generateLayoutOnly is exported function");
  assert(typeof callLLMRaw === "function", "callLLMRaw is exported function");
  assert(typeof resolveImages === "function", "resolveImages is exported function");

  console.log("");

  // ── Type Exports (compile-time verified, runtime spot check) ────────
  console.log("Type Exports:");

  // These type assertions compile if types are properly exported
  const _archetype: Archetype = "SERVICE";
  const _personality: Personality = "minimal";
  const _category: ComponentCategory = "hero";

  assert(_archetype === "SERVICE", "Archetype type works");
  assert(_personality === "minimal", "Personality type works");
  assert(_category === "hero", "ComponentCategory type works");

  // Verify interface shapes compile (would fail at TS compilation if wrong)
  const _theme: ThemeDef = {
    colors: { accent: "#000", accentLight: "#111", surface: "#fff", background: "#fff", text: "#000", border: "#ccc", muted: "#eee" },
    fonts: { heading: "Inter", body: "DM Sans" },
    radius: "8px",
  };
  assert(_theme.colors.accent === "#000", "ThemeDef type works");

  const _profile: BusinessProfile = {
    businessName: "Test",
    industry: "tech",
    targetAudience: "developers",
    primaryPainPoint: "complexity",
    valueProposition: "simplify",
    tone: "professional",
    websiteGoal: "leads",
    uniqueSellingPoints: ["fast"],
    keyServices: ["consulting"],
  };
  assert(_profile.businessName === "Test", "BusinessProfile type works");

  console.log("");

  // ── Cross-Archetype Consistency ─────────────────────────────────────
  console.log("Cross-Archetype Consistency:");

  // All archetypes should have meaningful, non-overlapping descriptions
  const descriptions = archetypes.map(a => (ARCHETYPE_PRESETS as any)[a].description);
  const uniqueDescriptions = new Set(descriptions);
  assert(uniqueDescriptions.size === archetypes.length, "All archetype descriptions are unique");

  // COMMERCE should have more components than PORTFOLIO (broader scope)
  assert(commerceComponents.length > portfolioComponents.length, "COMMERCE has more components than PORTFOLIO");

  // All personalities should have unique descriptions
  const personalityDescriptions = expectedPersonalities.map(p => (VISUAL_PERSONALITIES as any)[p].description);
  const uniquePersonalityDesc = new Set(personalityDescriptions);
  assert(uniquePersonalityDesc.size === expectedPersonalities.length, "All personality descriptions are unique");

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
