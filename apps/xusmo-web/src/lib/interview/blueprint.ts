// =============================================================================
// Blueprint Generator
// Transforms interview answers + classification + industry defaults into
// a structured Blueprint JSON that drives the entire build pipeline.
// Usage: import { generateBlueprint } from "@/lib/interview/blueprint";
// =============================================================================

import { prisma } from "@/lib/db";
import { getArchetypeMetadata } from "@/lib/classification/archetypes";
import type { Archetype } from "@/lib/classification/archetypes";

// ---------------------------------------------------------------------------
// Types matching Blueprint DB model
// ---------------------------------------------------------------------------

interface BlueprintBusinessInfo {
  name: string;
  description: string;
  tagline: string;
  yearsInBusiness: string;
  location: string;
  phone: string;
  email: string;
}

interface BlueprintService {
  name: string;
  description: string;
  featured: boolean;
}

interface BlueprintPageBlock {
  type: string;
  data: Record<string, unknown>;
  order: number;
}

interface BlueprintPage {
  slug: string;
  title: string;
  isRequired: boolean;
  blocks: BlueprintPageBlock[];
}

interface BlueprintDesignPrefs {
  primaryColors: string[];
  tone: string;
  fontPreference: string;
  layoutDensity: string;
  imageryThemes: string[];
}

interface BlueprintContactPrefs {
  phone: string;
  email: string;
  formType: string;
  showMap: boolean;
}

interface BlueprintComplianceFlags {
  isRegulated: boolean;
  disclaimers: string[];
}

interface BlueprintSeoData {
  focusKeywords: string[];
  schemaType: string;
  metaDescription: string;
}

interface BlueprintStory {
  foundingStory: string;
  differentiator: string;
  targetAudience: string;
  uniqueSellingPoint: string;
  certifications: string;
  serviceAreas: string;
}

interface BlueprintTeamMember {
  name: string;
  role: string;
  bio: string;
}

interface BlueprintTestimonial {
  quote: string;
  name: string;
  title: string;
}

interface BlueprintFaq {
  question: string;
  answer: string;
}

interface BlueprintPortfolioItem {
  title: string;
  category: string;
  description: string;
}

interface BlueprintSocialMedia {
  facebook?: string;
  instagram?: string;
}

export interface BlueprintOutput {
  businessInfo: BlueprintBusinessInfo;
  services: BlueprintService[];
  pages: BlueprintPage[];
  features: string[];
  designPrefs: BlueprintDesignPrefs;
  trustSignals: Array<{ type: string; value: string }>;
  contactPrefs: BlueprintContactPrefs;
  complianceFlags: BlueprintComplianceFlags;
  seoData: BlueprintSeoData;
  goals: string[];
  // New fields from enhanced interview (stages 2, 4, 5, 7)
  story: BlueprintStory;
  team: BlueprintTeamMember[];
  testimonials: BlueprintTestimonial[];
  businessHours: string;
  socialMedia: BlueprintSocialMedia;
  faqs: BlueprintFaq[];
  portfolioItems: BlueprintPortfolioItem[];
  requestedPages: string[];
}

// ---------------------------------------------------------------------------
// Helper: build a tagline from template + business info
// ---------------------------------------------------------------------------

function buildTagline(
  sampleTaglines: string[],
  businessName: string,
  location: string
): string {
  if (sampleTaglines.length === 0) return `${businessName} — Quality You Can Trust`;
  let tagline = sampleTaglines[0];
  tagline = tagline.replace(/\{City\}/gi, location.split(",")[0]?.trim() ?? location);
  tagline = tagline.replace(/\{Business Name\}/gi, businessName);
  return tagline;
}

// ---------------------------------------------------------------------------
// Helper: determine form type from goal
// ---------------------------------------------------------------------------

function getFormType(primaryGoal: string): string {
  switch (primaryGoal) {
    case "phone_calls":
      return "click_to_call";
    case "form_leads":
      return "quote_form";
    case "book_appointments":
      return "booking_widget";
    case "showcase_work":
      return "inquiry_form";
    case "sell_products":
      return "product_inquiry";
    default:
      return "contact_form";
  }
}

// ---------------------------------------------------------------------------
// Helper: build pages from archetype metadata
// ---------------------------------------------------------------------------

function buildPages(
  archetype: Archetype,
  componentLibrary: string[],
  requestedPages?: string[]
): BlueprintPage[] {
  const meta = getArchetypeMetadata(archetype);
  const pages: BlueprintPage[] = [];

  // Determine which pages to include:
  // If user explicitly requested pages (stage 7), use those
  // Otherwise fall back to archetype required + first 3 optional
  const allSlugs = requestedPages && requestedPages.length > 0
    ? requestedPages
    : [...meta.requiredPages, ...meta.optionalPages.slice(0, 6)];

  // Ensure home and contact are always included
  const slugSet = new Set(allSlugs);
  slugSet.add("home");
  slugSet.add("contact");

  for (const slug of slugSet) {
    const title = slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isRequired = meta.requiredPages.includes(slug);
    const blocks: BlueprintPageBlock[] = [];

    if (slug === "home") {
      const homeComponents = componentLibrary.slice(0, 5);
      homeComponents.forEach((comp, i) => {
        blocks.push({ type: comp, data: {}, order: i + 1 });
      });
    } else if (slug === "contact") {
      blocks.push({ type: "contact_section", data: {}, order: 1 });
      blocks.push({ type: "map_embed", data: {}, order: 2 });
    } else {
      const relevant = componentLibrary.filter((c) =>
        c.toLowerCase().includes(slug.replace(/_/g, "").toLowerCase())
      );
      (relevant.length > 0 ? relevant : componentLibrary.slice(2, 4)).forEach(
        (comp, i) => {
          blocks.push({ type: comp, data: {}, order: i + 1 });
        }
      );
    }

    pages.push({ slug, title, isRequired, blocks });
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Main: generateBlueprint
// ---------------------------------------------------------------------------

export async function generateBlueprint(leadId: string) {
  const startTime = Date.now();

  // 1. Load Lead with all answers
  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
  });
  const answers = (lead.rawAnswers as Record<string, unknown>) ?? {};

  // 2. Load IndustryDefault
  const industry = lead.industryId
    ? await prisma.industryDefault.findUnique({
        where: { id: lead.industryId },
      })
    : null;

  // 3. Determine archetype
  const archetype: Archetype = lead.archetype ?? "SERVICE";
  const archetypeMeta = getArchetypeMetadata(archetype);

  // 4. Build the Blueprint JSON
  const businessName = (answers.business_name as string) ?? lead.businessName ?? "My Business";
const businessDesc = (answers.business_description as string) ?? lead.businessDescription ?? "";
  const location = (answers.location as string) ?? lead.location ?? "";

  const businessInfo: BlueprintBusinessInfo = {
    name: businessName,
    description: (answers.business_description as string) ?? lead.businessDescription ?? "",
    tagline: businessDesc.length > 20
      ? ""  // Let the engine generate a tagline from the business description
      : buildTagline(
          (industry?.sampleTaglines as string[]) ?? [],
          businessName,
          location
        ),
    yearsInBusiness: (answers.years_in_business as string) ?? lead.yearsInBusiness ?? "",
    location,
    phone: (answers.phone as string) ?? lead.phone ?? "",
    email: (answers.email as string) ?? lead.email ?? "",
  };

  // Build services from business description first, fall back to industry defaults
  const defaultServices = (industry?.defaultServices as Array<{ name: string; description: string }>) ?? [];
  const selectedServiceValues = (answers.selected_services as string[]) ?? [];

  // If user described their business, the engine will generate relevant services.
  // Only use industry defaults if there's no business description at all.
  let services: BlueprintService[];
  if (businessDesc.length > 20) {
    // Pass the actual business description as the primary service
    // The engine's LLM will expand this into real service cards
    services = [
      { name: businessName, description: businessDesc, featured: true },
    ];
    // Also add any explicitly selected services
    if (selectedServiceValues.length > 0) {
      for (const svc of selectedServiceValues) {
        services.push({ name: svc.replace(/_/g, " "), description: "", featured: true });
      }
    }
  } else {
    // Fallback to industry defaults
    services = defaultServices.map((s) => ({
      name: s.name,
      description: s.description,
      featured: selectedServiceValues.includes(
        s.name.toLowerCase().replace(/\s+/g, "_")
      ),
    }));
    if (!services.some((s) => s.featured) && services.length > 0) {
      services.slice(0, 3).forEach((s) => (s.featured = true));
    }
  }

  const features = (lead.features as string[]) ?? (industry?.defaultFeatures as string[]) ?? [];

  // Extract new interview data (stages 2, 4, 5, 7)
  const requestedPages = (answers.requested_pages as string[]) ?? [];
  const pages = buildPages(archetype, archetypeMeta.componentLibrary, requestedPages);

  // Story (stage 4)
  const story: BlueprintStory = {
    foundingStory: (answers.founding_story as string) ?? "",
    differentiator: (answers.differentiator as string) ?? "",
    targetAudience: (answers.target_audience as string) ?? "",
    uniqueSellingPoint: (answers.unique_selling_point as string) ?? "",
    certifications: (answers.certifications as string) ?? "",
    serviceAreas: (answers.service_areas as string) ?? "",
  };

  // Team (stage 4 repeater)
  const rawTeam = (answers.team_members as Array<Record<string, string>>) ?? [];
  const team: BlueprintTeamMember[] = rawTeam
    .filter((t) => t.name)
    .map((t) => ({
      name: t.name ?? "",
      role: t.role ?? "",
      bio: t.bio ?? "",
    }));

  // Testimonials (stage 5 repeater)
  const rawTestimonials = (answers.testimonials as Array<Record<string, string>>) ?? [];
  const testimonials: BlueprintTestimonial[] = rawTestimonials
    .filter((t) => t.quote && t.name)
    .map((t) => ({
      quote: t.quote ?? "",
      name: t.name ?? "",
      title: t.title ?? "",
    }));

  // FAQs (stage 5 repeater)
  const rawFaqs = (answers.custom_faqs as Array<Record<string, string>>) ?? [];
  const faqs: BlueprintFaq[] = rawFaqs
    .filter((f) => f.question && f.answer)
    .map((f) => ({
      question: f.question ?? "",
      answer: f.answer ?? "",
    }));

  // Portfolio items (stage 5 repeater, PORTFOLIO archetype)
  const rawPortfolio = (answers.portfolio_items as Array<Record<string, string>>) ?? [];
  const portfolioItems: BlueprintPortfolioItem[] = rawPortfolio
    .filter((p) => p.title)
    .map((p) => ({
      title: p.title ?? "",
      category: p.category ?? "",
      description: p.description ?? "",
    }));

  // Social & hours (stage 5)
  const businessHours = (answers.business_hours as string) ?? "";
  const socialMedia: BlueprintSocialMedia = {
    facebook: (answers.social_facebook as string) || undefined,
    instagram: (answers.social_instagram as string) || undefined,
  };

  const colorPref = answers.color_preference as string;
  const designPrefs: BlueprintDesignPrefs = {
    primaryColors:
      colorPref === "custom"
        ? [] // User will provide later
        : (industry?.primaryColors as string[]) ?? ["#1a1a2e", "#e94560", "#0f3460"],
    tone: (answers.tone as string) ?? (industry?.tone as string) ?? "professional",
    fontPreference: (industry?.fontPreference as string) ?? "modern_sans",
    layoutDensity: (industry?.layoutDensity as string) ?? "standard",
    imageryThemes: (industry?.imageryThemes as string[]) ?? [],
  };

  const trustSignals: Array<{ type: string; value: string }> =
    ((industry?.commonTrustSignals as string[]) ?? []).map((signal) => ({
      type: "badge",
      value: signal,
    }));

  const primaryGoal = answers.primary_goal as string;
  const contactPrefs: BlueprintContactPrefs = {
    phone: businessInfo.phone,
    email: businessInfo.email,
    formType: getFormType(primaryGoal ?? "form_leads"),
    showMap: archetype === "SERVICE" || archetype === "VENUE",
  };

  const complianceFlags: BlueprintComplianceFlags = {
    isRegulated: (industry?.isRegulated as boolean) ?? false,
    disclaimers: (industry?.defaultDisclaimers as string[]) ?? [],
  };

  const seoData: BlueprintSeoData = {
    focusKeywords: (industry?.seoKeywords as string[]) ?? [],
    schemaType: (industry?.schemaType as string) ?? "LocalBusiness",
    metaDescription: `${businessName} in ${location}. ${businessInfo.description.slice(0, 120)}`,
  };

  const secondaryGoals = (answers.secondary_goals as string[]) ?? [];
  const goals: string[] = primaryGoal ? [primaryGoal, ...secondaryGoals] : secondaryGoals;

  const blueprint: BlueprintOutput = {
    businessInfo,
    services,
    pages,
    features,
    designPrefs,
    trustSignals,
    contactPrefs,
    complianceFlags,
    seoData,
    goals,
    story,
    team,
    testimonials,
    businessHours,
    socialMedia,
    faqs,
    portfolioItems,
    requestedPages,
  };

  // 5. Create Blueprint record in DB
  const interviewDuration = Math.round((Date.now() - (lead.createdAt?.getTime() ?? startTime)) / 1000);
  const questionsAsked = Object.keys(answers).length;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const dbBlueprint = await prisma.blueprint.create({
    data: {
      leadId,
      businessInfo: blueprint.businessInfo as any,
      services: blueprint.services as any,
      pages: blueprint.pages as any,
      features: blueprint.features as any,
      designPrefs: blueprint.designPrefs as any,
      trustSignals: blueprint.trustSignals as any,
      contactPrefs: blueprint.contactPrefs as any,
      complianceFlags: blueprint.complianceFlags as any,
      seoData: blueprint.seoData as any,
      goals: blueprint.goals as any,
      story: blueprint.story as any,
      team: blueprint.team as any,
      testimonials: blueprint.testimonials as any,
      businessHours: blueprint.businessHours || null,
      socialMedia: blueprint.socialMedia as any,
      faqs: blueprint.faqs as any,
      portfolioItems: blueprint.portfolioItems as any,
      requestedPages: blueprint.requestedPages as any,
      interviewDuration,
      questionsAsked,
    },
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // 6. Update Lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "BLUEPRINT_GENERATED" },
  });

  // 7. Return
  return {
    blueprintId: dbBlueprint.id,
    blueprint,
  };
}
