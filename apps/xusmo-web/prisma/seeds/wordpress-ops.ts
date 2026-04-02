// =============================================================================
// XUSMO — WordPress Operations Seed
// Seeds PluginCatalog, AdminAgent, GoldenImage, and BlockPattern tables.
// Idempotent — uses upsert so it can be re-run safely.
// Run: npx tsx prisma/seeds/wordpress-ops.ts
// =============================================================================

import path from "node:path";
import dotenv from "dotenv";

// Load .env.local first, fall back to .env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import {
  Archetype,
  GoldenImageStatus,
  PatternStatus,
  PluginRisk,
  PluginStatus,
} from "@prisma/client";
import { prisma } from "../../src/lib/db";

// =============================================================================
// 1. PLUGIN CATALOG
// =============================================================================

const plugins = [
  {
    slug: "wordpress-seo",
    name: "Yoast SEO",
    status: PluginStatus.APPROVED,
    riskLevel: PluginRisk.MEDIUM,
    isRequired: true,
    category: "seo",
  },
  {
    slug: "contact-form-7",
    name: "Contact Form 7",
    status: PluginStatus.APPROVED,
    riskLevel: PluginRisk.MEDIUM,
    isRequired: true,
    category: "forms",
  },
  {
    slug: "safe-svg",
    name: "Safe SVG",
    status: PluginStatus.APPROVED,
    riskLevel: PluginRisk.LOW,
    category: "media",
  },
  {
    slug: "wordfence",
    name: "Wordfence Security",
    status: PluginStatus.BANNED,
    riskLevel: PluginRisk.HIGH,
    isBanned: true,
    category: "security",
    testNotes: "BANNED from customer fleet — too heavy, 200ms+ slowdown, premium nags. MAY be used as a temporary lab-only QA tool during Golden Image promotion security scans. Install on sandbox, scan, uninstall. Never baked into GI artifact.",
  },
  {
    slug: "elementor",
    name: "Elementor",
    status: PluginStatus.BANNED,
    riskLevel: PluginRisk.HIGH,
    isBanned: true,
    category: "page-builder",
  },
];

async function seedPlugins() {
  console.log("Seeding plugin catalog...");
  for (const p of plugins) {
    await prisma.pluginCatalog.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        status: p.status,
        riskLevel: p.riskLevel,
        isRequired: p.isRequired ?? false,
        isBanned: p.isBanned ?? false,
        category: p.category,
        testNotes: (p as Record<string, unknown>).testNotes as string | undefined,
      },
      create: {
        slug: p.slug,
        name: p.name,
        status: p.status,
        riskLevel: p.riskLevel,
        isRequired: p.isRequired ?? false,
        isBanned: p.isBanned ?? false,
        category: p.category,
        testNotes: (p as Record<string, unknown>).testNotes as string | undefined,
      },
    });
  }
  console.log(`  -> ${plugins.length} plugins upserted.`);
}

// =============================================================================
// 2. ADMIN AGENTS
// =============================================================================

const agents = [
  {
    name: "patrol",
    displayName: "Site Patrol",
    schedule:
      process.env.AGENT_PATROL_SCHEDULE || "0 */6 * * *",
    description:
      "Monitors all managed sites for uptime, version compliance, SSL, backups, and overall health.",
  },
  {
    name: "plugin-updater",
    displayName: "Plugin Updater",
    schedule:
      process.env.AGENT_PLUGIN_UPDATER_SCHEDULE || "0 */6 * * *",
    description:
      "Checks for plugin updates and auto-applies LOW risk updates. MEDIUM risk requires approval.",
  },
  {
    name: "backup",
    displayName: "Backup Agent",
    schedule:
      process.env.AGENT_BACKUP_SCHEDULE || "0 3 * * *",
    description:
      "Creates daily database and file backups for all managed sites.",
  },
  {
    name: "ssl-security",
    displayName: "SSL & Security",
    schedule:
      process.env.AGENT_SSL_SCHEDULE || "0 4 * * *",
    description:
      "Monitors SSL certificates, auto-renews expiring certs, checks security headers.",
  },
  {
    name: "performance",
    displayName: "Performance Agent",
    schedule:
      process.env.AGENT_PERFORMANCE_SCHEDULE || "0 2 * * 0",
    description:
      "Weekly Lighthouse audits for PREMIUM managed sites.",
    managedOnly: true,
    targetPlans: ["PREMIUM"],
  },
];

async function seedAgents() {
  console.log("Seeding admin agents...");
  for (const a of agents) {
    await prisma.adminAgent.upsert({
      where: { name: a.name },
      update: {
        displayName: a.displayName,
        schedule: a.schedule,
        description: a.description,
        managedOnly: a.managedOnly ?? true,
        targetPlans: a.targetPlans ?? undefined,
      },
      create: {
        name: a.name,
        displayName: a.displayName,
        schedule: a.schedule,
        description: a.description,
        managedOnly: a.managedOnly ?? true,
        targetPlans: a.targetPlans ?? undefined,
      },
    });
  }
  console.log(`  -> ${agents.length} admin agents upserted.`);
}

// =============================================================================
// 3. GOLDEN IMAGES
// =============================================================================

const goldenImages = [
  {
    version: "GI-SERVICE-2026Q1-001",
    archetype: Archetype.SERVICE,
    wpVersion: "6.7.2",
    themeVersion: "1.2.0",
    phpVersion: "8.2",
    pluginCount: 3,
    patternCount: 9,
    status: GoldenImageStatus.ACTIVE,
    pluginList: ["wordpress-seo", "contact-form-7", "safe-svg"],
  },
  {
    version: "GI-VENUE-2026Q1-001",
    archetype: Archetype.VENUE,
    wpVersion: "6.7.2",
    themeVersion: "1.2.0",
    phpVersion: "8.2",
    pluginCount: 3,
    patternCount: 9,
    status: GoldenImageStatus.ACTIVE,
    pluginList: ["wordpress-seo", "contact-form-7", "safe-svg"],
  },
  {
    version: "GI-PORTFOLIO-2026Q1-001",
    archetype: Archetype.PORTFOLIO,
    wpVersion: "6.7.2",
    themeVersion: "1.2.0",
    phpVersion: "8.2",
    pluginCount: 3,
    patternCount: 8,
    status: GoldenImageStatus.ACTIVE,
    pluginList: ["wordpress-seo", "contact-form-7", "safe-svg"],
  },
];

async function seedGoldenImages() {
  console.log("Seeding golden images...");
  for (const gi of goldenImages) {
    await prisma.goldenImage.upsert({
      where: { version: gi.version },
      update: {
        archetype: gi.archetype,
        wpVersion: gi.wpVersion,
        themeVersion: gi.themeVersion,
        phpVersion: gi.phpVersion,
        pluginCount: gi.pluginCount,
        patternCount: gi.patternCount,
        status: gi.status,
        pluginList: gi.pluginList,
      },
      create: {
        version: gi.version,
        archetype: gi.archetype,
        wpVersion: gi.wpVersion,
        themeVersion: gi.themeVersion,
        phpVersion: gi.phpVersion,
        pluginCount: gi.pluginCount,
        patternCount: gi.patternCount,
        status: gi.status,
        pluginList: gi.pluginList,
      },
    });
  }
  console.log(`  -> ${goldenImages.length} golden images upserted.`);
}

// =============================================================================
// 4. BLOCK PATTERNS
// =============================================================================

// Archetype mappings
const SERVICE_PATTERNS = [
  "hero-image-bg",
  "services-grid",
  "trust-bar",
  "testimonials-carousel",
  "faq-accordion",
  "cta-banner",
  "contact-form-section",
  "stats-counter",
  "map-embed",
];

const VENUE_PATTERNS = [
  "hero-image-bg",
  "hours-widget",
  "menu-grid",
  "gallery-masonry",
  "booking-cta",
  "map-embed",
  "trust-bar",
  "cta-banner",
  "contact-form-section",
];

const PORTFOLIO_PATTERNS = [
  "hero-split-screen",
  "portfolio-grid",
  "gallery-masonry",
  "team-grid",
  "testimonials-carousel",
  "cta-split",
  "logo-cloud",
  "contact-form-section",
];

function archetypesForSlug(slug: string): Archetype[] {
  const archetypes: Archetype[] = [];
  if (SERVICE_PATTERNS.includes(slug)) archetypes.push(Archetype.SERVICE);
  if (VENUE_PATTERNS.includes(slug)) archetypes.push(Archetype.VENUE);
  if (PORTFOLIO_PATTERNS.includes(slug)) archetypes.push(Archetype.PORTFOLIO);
  return archetypes;
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const blockPatterns: {
  slug: string;
  status: PatternStatus;
}[] = [
  // LIVE patterns
  { slug: "hero-image-bg", status: PatternStatus.LIVE },
  { slug: "hero-split-screen", status: PatternStatus.LIVE },
  { slug: "services-grid", status: PatternStatus.LIVE },
  { slug: "trust-bar", status: PatternStatus.LIVE },
  { slug: "testimonials-carousel", status: PatternStatus.LIVE },
  { slug: "faq-accordion", status: PatternStatus.LIVE },
  { slug: "cta-banner", status: PatternStatus.LIVE },
  { slug: "contact-form-section", status: PatternStatus.LIVE },
  { slug: "hours-widget", status: PatternStatus.LIVE },
  { slug: "menu-grid", status: PatternStatus.LIVE },
  { slug: "gallery-masonry", status: PatternStatus.LIVE },
  { slug: "map-embed", status: PatternStatus.LIVE },
  { slug: "booking-cta", status: PatternStatus.LIVE },
  { slug: "stats-counter", status: PatternStatus.LIVE },
  { slug: "logo-cloud", status: PatternStatus.LIVE },
  { slug: "blog-preview", status: PatternStatus.LIVE },
  { slug: "cta-split", status: PatternStatus.LIVE },

  // TESTING patterns
  { slug: "team-grid", status: PatternStatus.TESTING },
  { slug: "portfolio-grid", status: PatternStatus.TESTING },

  // DRAFT patterns
  { slug: "pricing-table", status: PatternStatus.DRAFT },
];

async function seedBlockPatterns() {
  console.log("Seeding block patterns...");
  for (const bp of blockPatterns) {
    const archetypes = archetypesForSlug(bp.slug);
    await prisma.blockPattern.upsert({
      where: { slug: bp.slug },
      update: {
        name: slugToName(bp.slug),
        htmlCode: "<!-- placeholder -->",
        archetypes: archetypes.length > 0 ? archetypes : undefined,
        status: bp.status,
      },
      create: {
        slug: bp.slug,
        name: slugToName(bp.slug),
        htmlCode: "<!-- placeholder -->",
        archetypes: archetypes.length > 0 ? archetypes : undefined,
        status: bp.status,
      },
    });
  }
  console.log(`  -> ${blockPatterns.length} block patterns upserted.`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log("=== Xusmo WordPress Ops Seed ===\n");
  await seedPlugins();
  await seedAgents();
  await seedGoldenImages();
  await seedBlockPatterns();
  console.log("\n=== Seed complete! ===");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
