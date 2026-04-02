import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADD_ONS = [
  // --- CONTENT ---
  { slug: "auto-blogger", name: "Auto-Blogger", category: "content", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["SERVICE","VENUE","PORTFOLIO","COMMERCE"], industries: [], description: "AI-generated blog posts on your industry topics. 4 posts/month, SEO-optimized.", sortOrder: 1 },
  { slug: "extra-page-pack", name: "Extra Page Pack (5 pages)", category: "content", pricingType: "ONE_TIME", priceInCents: 4900, interval: null, archetypes: ["SERVICE","VENUE","PORTFOLIO","COMMERCE"], industries: [], description: "Add 5 additional pages to your site. Content AI-generated from your brief.", sortOrder: 2 },

  // --- BOOKING & SCHEDULING ---
  { slug: "reservation-widget", name: "Reservation/Booking System", category: "booking", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["VENUE","SERVICE"], industries: ["restaurant","salon","barbershop","spa","dental","clinic","gym","studio"], description: "Online reservations and appointment booking with calendar integration.", sortOrder: 3 },
  { slug: "class-schedule", name: "Class/Event Schedule Widget", category: "booking", pricingType: "RECURRING", priceInCents: 1900, interval: "month", archetypes: ["VENUE"], industries: ["gym","studio","yoga","dance","school","martial_arts"], description: "Interactive class schedule with filtering, instructor profiles, and sign-up.", sortOrder: 4 },

  // --- RESTAURANT-SPECIFIC ---
  { slug: "online-menu-builder", name: "Online Menu Builder", category: "booking", pricingType: "RECURRING", priceInCents: 1900, interval: "month", archetypes: ["VENUE"], industries: ["restaurant","cafe","bar","bakery","catering"], description: "Digital menu with categories, pricing, dietary flags, and photos.", sortOrder: 5 },

  // --- PORTFOLIO ---
  { slug: "portfolio-gallery-premium", name: "Portfolio Gallery Premium", category: "content", pricingType: "ONE_TIME", priceInCents: 4900, interval: null, archetypes: ["PORTFOLIO"], industries: ["photography","architecture","interior_design","art","graphic_design"], description: "Masonry gallery with lightbox, filterable categories, and client proofing.", sortOrder: 6 },

  // --- LEAD GEN ---
  { slug: "client-portal-integration", name: "Client Portal Integration", category: "booking", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["SERVICE"], industries: ["legal","consulting","coaching","accounting","financial"], description: "Secure client portal for document sharing, messaging, and appointment booking.", sortOrder: 7 },
  { slug: "property-listings-feed", name: "Property Listings Feed", category: "content", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["PORTFOLIO"], industries: ["real_estate"], description: "Auto-synced property listings from MLS/IDX feed with search and filtering.", sortOrder: 8 },

  // --- SEO ---
  { slug: "seo-boost", name: "SEO Boost Pack", category: "seo", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["SERVICE","VENUE","PORTFOLIO","COMMERCE"], industries: [], description: "Advanced SEO: local schema markup, monthly keyword audit, competitor tracking, GBP optimization.", sortOrder: 9 },
  { slug: "gbp-setup", name: "Google Business Profile Setup", category: "seo", pricingType: "ONE_TIME", priceInCents: 4900, interval: null, archetypes: ["SERVICE","VENUE"], industries: [], description: "Full GBP setup and optimization: categories, photos, posts, review strategy.", sortOrder: 10 },

  // --- ANALYTICS ---
  { slug: "performance-dashboard", name: "Performance Dashboard", category: "analytics", pricingType: "RECURRING", priceInCents: 1500, interval: "month", archetypes: ["SERVICE","VENUE","PORTFOLIO","COMMERCE"], industries: [], description: "Monthly traffic, conversions, SEO rankings, and Lighthouse score tracking.", sortOrder: 11 },

  // --- E-COMMERCE (Phase 2) ---
  { slug: "ecommerce-starter", name: "E-Commerce Starter Kit", category: "ecommerce", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["COMMERCE"], industries: ["retail","artisan","boutique"], description: "WooCommerce setup: shop page, cart, checkout, up to 25 products. Phase 2.", sortOrder: 12 },
  { slug: "abandoned-cart-recovery", name: "Abandoned Cart Recovery", category: "ecommerce", pricingType: "RECURRING", priceInCents: 2900, interval: "month", archetypes: ["COMMERCE"], industries: [], description: "Automated email sequences for cart abandoners. 3-email sequence.", sortOrder: 13 },
];

const BUNDLES = [
  { slug: "lead-boost", name: "Lead Boost Pack", description: "Booking + call tracking + WhatsApp chat", discountPct: 15, addOnSlugs: ["reservation-widget", "gbp-setup"] },
  { slug: "seo-boost-bundle", name: "SEO Boost Bundle", description: "Auto-Blogger + SEO Boost + GBP setup", discountPct: 20, addOnSlugs: ["auto-blogger", "seo-boost", "gbp-setup"] },
  { slug: "growth-pack", name: "Growth Pack", description: "Performance Dashboard + Auto-Blogger + SEO Boost", discountPct: 15, addOnSlugs: ["performance-dashboard", "auto-blogger", "seo-boost"] },
];

async function main() {
  console.log("Seeding add-ons...");

  for (const addon of ADD_ONS) {
    await prisma.addOn.upsert({
      where: { slug: addon.slug },
      update: {
        name: addon.name,
        description: addon.description,
        category: addon.category,
        pricingType: addon.pricingType,
        priceInCents: addon.priceInCents,
        interval: addon.interval,
        archetypes: addon.archetypes,
        industries: addon.industries,
        sortOrder: addon.sortOrder,
      },
      create: addon,
    });
    console.log(`  + ${addon.name}`);
  }

  console.log("\nSeeding bundles...");

  for (const bundle of BUNDLES) {
    const { addOnSlugs, ...bundleData } = bundle;
    const created = await prisma.bundle.upsert({
      where: { slug: bundle.slug },
      update: {
        name: bundleData.name,
        description: bundleData.description,
        discountPct: bundleData.discountPct,
      },
      create: bundleData,
    });

    // Link add-ons to bundle
    for (const slug of addOnSlugs) {
      const addon = await prisma.addOn.findUnique({ where: { slug } });
      if (addon) {
        await prisma.bundleItem.upsert({
          where: { bundleId_addOnId: { bundleId: created.id, addOnId: addon.id } },
          update: {},
          create: { bundleId: created.id, addOnId: addon.id },
        });
      }
    }
    console.log(`  + ${bundle.name} (${addOnSlugs.length} add-ons)`);
  }

  console.log("\nDone! Seeded", ADD_ONS.length, "add-ons and", BUNDLES.length, "bundles.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
