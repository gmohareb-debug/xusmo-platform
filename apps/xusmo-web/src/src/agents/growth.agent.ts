// =============================================================================
// Growth Agent — Proof-driven upsell triggers and recommendations
// =============================================================================

import { prisma } from "@/lib/db";

export interface UpsellRecommendation {
  id: string;
  type: "upgrade" | "domain" | "annual" | "feature";
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  priority: number; // 1-5, 5 being highest
  dismissable: boolean;
}

interface SiteContext {
  siteId: string;
  businessName: string;
  industry: string;
  tier: string;
  billingCycle: string;
  hasBlog: boolean;
  blogPostCount: number;
  hasCustomDomain: boolean;
  daysSinceCreation: number;
  monthlyVisits: number | null;
  formSubmissions: number | null;
}

/**
 * Evaluate a site and return applicable upsell recommendations
 */
export function evaluateUpsellTriggers(ctx: SiteContext): UpsellRecommendation[] {
  const recommendations: UpsellRecommendation[] = [];

  // Trigger 1: No blog posts after 30 days → suggest Pro for auto-blogging
  if (
    ctx.daysSinceCreation > 30 &&
    ctx.blogPostCount === 0 &&
    ctx.tier !== "PRO" &&
    ctx.tier !== "AGENCY"
  ) {
    recommendations.push({
      id: `blog-upsell-${ctx.siteId}`,
      type: "upgrade",
      title: "Boost Your SEO with Blog Posts",
      message: `Sites in ${ctx.industry} with 4+ monthly blog posts see 3x more organic traffic. Upgrade to Pro and we'll write them for you.`,
      ctaLabel: "Upgrade to Pro",
      ctaHref: "/pricing",
      priority: 4,
      dismissable: true,
    });
  }

  // Trigger 2: Traffic but no form submissions
  if (
    ctx.monthlyVisits !== null &&
    ctx.monthlyVisits > 50 &&
    ctx.formSubmissions !== null &&
    ctx.formSubmissions === 0
  ) {
    recommendations.push({
      id: `forms-upsell-${ctx.siteId}`,
      type: "feature",
      title: "Convert Visitors into Leads",
      message: `Your site had ${ctx.monthlyVisits} visitors this month but 0 form submissions. A premium contact form with follow-up automation could help.`,
      ctaLabel: "Learn More",
      ctaHref: "/pricing",
      priority: 3,
      dismissable: true,
    });
  }

  // Trigger 3: No custom domain after 14 days
  if (ctx.daysSinceCreation > 14 && !ctx.hasCustomDomain) {
    recommendations.push({
      id: `domain-upsell-${ctx.siteId}`,
      type: "domain",
      title: "Get Your Own Domain",
      message:
        "70% of people trust businesses with their own domain more. Connect or buy a custom domain for your site.",
      ctaLabel: "Connect Domain",
      ctaHref: "/portal/domains",
      priority: 3,
      dismissable: true,
    });
  }

  // Trigger 4: Monthly billing → suggest annual
  if (ctx.billingCycle === "MONTHLY") {
    recommendations.push({
      id: `annual-upsell-${ctx.siteId}`,
      type: "annual",
      title: "Save with Annual Billing",
      message:
        "Save $28.80/yr by switching to annual billing. Plus, get a free custom domain included.",
      ctaLabel: "Switch to Annual",
      ctaHref: "/portal/billing",
      priority: 2,
      dismissable: true,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate a monthly performance email digest
 */
export function generateMonthlyDigest(ctx: SiteContext): {
  subject: string;
  highlights: string[];
  recommendations: UpsellRecommendation[];
} {
  const highlights: string[] = [];

  if (ctx.monthlyVisits !== null) {
    highlights.push(`Your site received ${ctx.monthlyVisits} visits this month`);
  }
  if (ctx.formSubmissions !== null && ctx.formSubmissions > 0) {
    highlights.push(`${ctx.formSubmissions} form submissions received`);
  }
  if (ctx.blogPostCount > 0) {
    highlights.push(`${ctx.blogPostCount} blog posts published`);
  }

  return {
    subject: `${ctx.businessName} — Monthly Website Performance Report`,
    highlights,
    recommendations: evaluateUpsellTriggers(ctx),
  };
}

/**
 * Get recommended add-ons for a site based on its industry classification
 */
export async function getRecommendedAddOns(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      entitlements: { include: { addOn: { select: { slug: true } } } },
      build: {
        include: {
          blueprint: {
            include: { lead: { select: { industryName: true, archetype: true } } },
          },
        },
      },
    },
  });

  if (!site) return [];

  const industry = site.build?.blueprint?.lead?.industryName?.toLowerCase() ?? "";
  const archetype = site.build?.blueprint?.lead?.archetype ?? site.archetype;
  const existingSlugs = site.entitlements
    .filter(e => e.status === "ACTIVE")
    .map(e => e.addOn.slug);

  const recommended = await prisma.addOn.findMany({
    where: {
      isActive: true,
      slug: { notIn: existingSlugs },
      OR: [
        { industries: { has: industry } },
        { archetypes: { has: archetype } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });

  // Sort: industry-specific first, then archetype-matched
  return recommended.sort((a, b) => {
    const aMatch = a.industries.includes(industry) ? 0 : 1;
    const bMatch = b.industries.includes(industry) ? 0 : 1;
    return aMatch - bMatch;
  });
}
