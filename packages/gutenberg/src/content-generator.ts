// =============================================================================
// Content Generator — Pattern-Based Content Generation (pure logic)
// Builds LLM prompts for each pattern type, generates slot content via an
// injected LLM function, and hydrates pattern templates into Gutenberg HTML.
// No Prisma, no BullMQ — those stay in the host application wrapper.
// =============================================================================

import {
  getPageLayoutWithDesignPackage,
  type PatternSlug,
  type DesignPackage,
} from "./registry";
import { hydratePattern, type PatternSlots } from "./hydrator";
import type { Archetype, LLMFunction } from "./types";

// ---------------------------------------------------------------------------
// Blueprint data types (match the JSON shapes stored in DB)
// ---------------------------------------------------------------------------

export interface BlueprintBusinessInfo {
  name: string;
  description: string;
  tagline: string;
  phone: string;
  email: string;
  location: string;
  yearsInBusiness: string;
}

export interface BlueprintService {
  name: string;
  description: string;
  featured: boolean;
}

export interface BlueprintPage {
  slug: string;
  title: string;
  isRequired: boolean;
  blocks: Array<{ type: string; data: Record<string, unknown>; order: number }>;
  content?: string;
}

export interface BlueprintStory {
  foundingStory: string;
  differentiator: string;
  targetAudience: string;
  uniqueSellingPoint: string;
  certifications: string;
  serviceAreas: string;
}

export interface BlueprintTeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface BlueprintTestimonial {
  quote: string;
  name: string;
  title: string;
}

export interface BlueprintFaq {
  question: string;
  answer: string;
}

export interface BlueprintPortfolioItem {
  title: string;
  category: string;
  description: string;
}

export interface ContactPrefs {
  phone: string;
  email: string;
  formType: string;
  showMap: boolean;
}

// ---------------------------------------------------------------------------
// High-level generation options
// ---------------------------------------------------------------------------

export interface GeneratePageContentOptions {
  businessInfo: BlueprintBusinessInfo;
  services: BlueprintService[];
  story: BlueprintStory;
  team: BlueprintTeamMember[];
  testimonials: BlueprintTestimonial[];
  faqs: BlueprintFaq[];
  trustSignals: Array<{ type: string; value: string }>;
  contactPrefs: ContactPrefs;
  businessHours: string;
  industryName: string;
  archetype: Archetype;
  industryCode?: string;
  isRegulated: boolean;
  tone?: string;
  targetAudience?: string;
  primaryGoal?: string;
  designPackage?: DesignPackage | null;
}

// ---------------------------------------------------------------------------
// Build focused LLM prompt for each pattern type
// ---------------------------------------------------------------------------

export function buildSlotPrompt(
  patternSlug: PatternSlug,
  biz: BlueprintBusinessInfo,
  services: BlueprintService[],
  story: BlueprintStory,
  industryName: string,
  archetype: string,
  trustSignals: Array<{ type: string; value: string }>
): { prompt: string; expectedSlots: string[] } {
  const ctx = `Business: ${biz.name}
Industry: ${industryName} (${archetype})
Location: ${biz.location}
Years in business: ${biz.yearsInBusiness || "Not specified"}
Description: ${biz.description}
Tagline: ${biz.tagline}
Differentiator: ${story.differentiator || "Not specified"}
Target audience: ${story.targetAudience || "General audience"}
USP: ${story.uniqueSellingPoint || biz.tagline}`;

  const servicesList = services
    .filter((s) => s.featured)
    .slice(0, 6)
    .map((s) => `- ${s.name}: ${s.description}`)
    .join("\n");

  switch (patternSlug) {
    case "hero-split-screen":
    case "hero-image-bg": {
      const heroTone = archetype === "COMMERCE"
        ? "Use exciting, product-focused language. Think about what makes shoppers click. Mention the product category."
        : archetype === "VENUE"
        ? "Use inviting, experiential language. Make people want to visit. Mention the atmosphere or cuisine."
        : archetype === "PORTFOLIO"
        ? "Use confident, results-oriented language. Showcase expertise and creative talent."
        : "Use professional, trust-building language. Emphasize reliability and quality.";
      return {
        prompt: `${ctx}

Write a compelling hero section for this ${industryName} business website.
${heroTone}
Return JSON with these exact keys:
- "headline": A powerful H1 headline (8-15 words) that MUST include "${biz.name}" and convey the brand's unique value
- "description": A 2-3 sentence value proposition (40-60 words) specific to what this business offers
- "cta_primary": Primary call-to-action button text (2-5 words)
- "cta_secondary": Secondary button text (2-4 words)

The headline MUST mention "${biz.name}". Be specific to ${industryName}. No generic filler like "Welcome to Our Business".`,
        expectedSlots: ["headline", "description", "cta_primary", "cta_secondary"],
      };
    }

    case "services-grid":
      return {
        prompt: `${ctx}
Services:
${servicesList}

Write content for a services grid section.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief subtitle (8-15 words)
- "service_1_name": First service name
- "service_1_desc": First service description (15-25 words)
- "service_2_name": Second service name
- "service_2_desc": Second service description (15-25 words)
- "service_3_name": Third service name
- "service_3_desc": Third service description (15-25 words)

Use the actual services listed above. Be specific and compelling.`,
        expectedSlots: [
          "section_title", "section_subtitle",
          "service_1_name", "service_1_desc",
          "service_2_name", "service_2_desc",
          "service_3_name", "service_3_desc",
        ],
      };

    case "trust-bar":
      return {
        prompt: `${ctx}
Trust signals: ${trustSignals.map((t) => t.value).join(", ") || "None provided"}

Write 4 concise trust badges for a trust bar section.
Return JSON with these exact keys:
- "trust_1": First trust badge (2-5 words)
- "trust_2": Second trust badge (2-5 words)
- "trust_3": Third trust badge (2-5 words)
- "trust_4": Fourth trust badge (2-5 words)

Use the provided trust signals if available, otherwise create relevant ones for this ${industryName} business.`,
        expectedSlots: ["trust_1", "trust_2", "trust_3", "trust_4"],
      };

    case "testimonials-carousel":
      return {
        prompt: `${ctx}

Write 3 realistic customer testimonials for this ${industryName} business.
Return JSON with these exact keys:
- "section_title": Section heading (3-6 words)
- "section_subtitle": Brief subtitle (6-12 words)
- "quote_1": First testimonial (20-40 words)
- "name_1": First person's name
- "title_1": First person's title/role
- "quote_2": Second testimonial (20-40 words)
- "name_2": Second person's name
- "title_2": Second person's title/role
- "quote_3": Third testimonial (20-40 words)
- "name_3": Third person's name
- "title_3": Third person's title/role

Make testimonials specific to ${industryName} services. Sound authentic.`,
        expectedSlots: [
          "section_title", "section_subtitle",
          "quote_1", "name_1", "title_1",
          "quote_2", "name_2", "title_2",
          "quote_3", "name_3", "title_3",
        ],
      };

    case "faq-accordion":
      return {
        prompt: `${ctx}

Write 5 FAQ items for a ${industryName} business.
Return JSON with these exact keys:
- "section_title": Section heading (3-6 words)
- "section_subtitle": Brief subtitle (6-12 words)
- "faq_1_q": First question
- "faq_1_a": First answer (20-40 words)
- "faq_2_q": Second question
- "faq_2_a": Second answer (20-40 words)
- "faq_3_q": Third question
- "faq_3_a": Third answer (20-40 words)
- "faq_4_q": Fourth question
- "faq_4_a": Fourth answer (20-40 words)
- "faq_5_q": Fifth question
- "faq_5_a": Fifth answer (20-40 words)

CRITICAL: Each answer MUST directly and specifically answer its paired question. Do NOT give generic answers.
Questions should be ones a real customer of a ${industryName} business would ask about ${biz.name}.`,
        expectedSlots: [
          "section_title", "section_subtitle",
          "faq_1_q", "faq_1_a",
          "faq_2_q", "faq_2_a",
          "faq_3_q", "faq_3_a",
          "faq_4_q", "faq_4_a",
          "faq_5_q", "faq_5_a",
        ],
      };

    case "cta-banner":
    case "cta-split": {
      const ctaTone = archetype === "COMMERCE"
        ? `Use shopping-oriented language like "Shop Now", "Browse Collection", "Find Your Style". Avoid B2B language like "free consultation".`
        : archetype === "VENUE"
        ? `Use visit/booking language like "Reserve Your Table", "Book Now", "Visit Us Today". Avoid B2B language.`
        : archetype === "PORTFOLIO"
        ? `Use project-oriented language like "Start Your Project", "Get a Quote", "See Our Work".`
        : `Use service-oriented language like "Get a Free Quote", "Schedule a Call", "Contact Us Today".`;
      return {
        prompt: `${ctx}

Write a call-to-action section for this ${industryName} business.
${ctaTone}
Return JSON with these exact keys:
- "headline": CTA heading (4-8 words) specific to ${biz.name}
- "description": Supporting text (15-25 words) that motivates the target audience
- "cta_text": Button text (2-5 words)

Make it action-oriented and specific to ${industryName}. Mention ${biz.name} in the description.`,
        expectedSlots: ["headline", "description", "cta_text"],
      };
    }

    case "stats-counter":
      return {
        prompt: `${ctx}
Certifications: ${story.certifications || "None specified"}

Write 4 impressive stats for this ${industryName} business.
Return JSON with these exact keys:
- "stat_1_number": First stat number (e.g., "500+", "15+")
- "stat_1_label": First stat label (2-4 words)
- "stat_2_number": Second stat number
- "stat_2_label": Second stat label
- "stat_3_number": Third stat number
- "stat_3_label": Third stat label
- "stat_4_number": Fourth stat number
- "stat_4_label": Fourth stat label

Use years in business if available. Make numbers realistic for a ${industryName}.
IMPORTANT: Each stat label MUST be unique — no duplicates.`,
        expectedSlots: [
          "stat_1_number", "stat_1_label",
          "stat_2_number", "stat_2_label",
          "stat_3_number", "stat_3_label",
          "stat_4_number", "stat_4_label",
        ],
      };

    case "team-grid":
      return {
        prompt: `${ctx}

Write content for a team section.
Return JSON with these exact keys:
- "section_title": Section heading (3-5 words)
- "section_subtitle": Brief subtitle (6-12 words)
- "member_1_name": First team member name
- "member_1_role": First member's role/title
- "member_2_name": Second team member name
- "member_2_role": Second member's role/title
- "member_3_name": Third team member name
- "member_3_role": Third member's role/title
- "member_4_name": Fourth team member name
- "member_4_role": Fourth member's role/title

Make roles relevant to a ${industryName} business. Use realistic diverse names.`,
        expectedSlots: [
          "section_title", "section_subtitle",
          "member_1_name", "member_1_role",
          "member_2_name", "member_2_role",
          "member_3_name", "member_3_role",
          "member_4_name", "member_4_role",
        ],
      };

    case "contact-form-section":
      return {
        prompt: `${ctx}

Write content for a contact form section.
Return JSON with these exact keys:
- "headline": Contact section heading (3-6 words)
- "description": Welcoming description (15-30 words)

Be warm and encouraging.`,
        expectedSlots: ["headline", "description"],
      };

    case "hours-widget":
      return {
        prompt: `${ctx}

Write content for a business hours widget.
Return JSON with these exact keys:
- "headline": Section heading (2-4 words)
- "hours_text": Business hours text (standard format, e.g., "Monday - Friday: 8:00 AM - 6:00 PM")

Use typical hours for a ${industryName} business.`,
        expectedSlots: ["headline", "hours_text"],
      };

    case "map-embed":
      return {
        prompt: `${ctx}

Write content for a map/location section.
Return JSON with these exact keys:
- "headline": Section heading (2-4 words)
- "location_text": Brief directions/welcome text (10-20 words) mentioning ${biz.location || "our location"}

Be welcoming and specific.`,
        expectedSlots: ["headline", "location_text"],
      };

    case "booking-cta":
      return {
        prompt: `${ctx}

Write a booking/reservation CTA.
Return JSON with these exact keys:
- "headline": Booking heading (3-6 words)
- "description": Supporting text (15-25 words)
- "cta_text": Button text (2-4 words)

Make it specific to a ${industryName} business.`,
        expectedSlots: ["headline", "description", "cta_text"],
      };

    case "pricing-table":
      return {
        prompt: `${ctx}

Write content for a pricing section header.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief subtitle about transparent pricing (8-15 words)

Be professional and trustworthy.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    case "portfolio-grid":
      return {
        prompt: `${ctx}

Write content for a portfolio/work showcase section.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief subtitle (8-15 words)

Make it relevant to a ${industryName} business showcasing their work.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    case "gallery-masonry":
      return {
        prompt: `${ctx}

Write content for a gallery section header.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief subtitle (8-15 words)

Make it relevant to a ${industryName} business.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    case "menu-grid":
      return {
        prompt: `${ctx}

Write content for a menu/offerings section.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief appetizing subtitle (8-15 words)

Make it appetizing and relevant.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    case "logo-cloud":
      return {
        prompt: `${ctx}

Write content for a "trusted by" logo cloud section.
Return JSON with these exact keys:
- "section_title": Section heading (2-4 words)
- "section_subtitle": Brief subtitle (6-12 words)

Keep it professional.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    case "blog-preview":
      return {
        prompt: `${ctx}

Write content for a blog/news preview section.
Return JSON with these exact keys:
- "section_title": Section heading (2-5 words)
- "section_subtitle": Brief subtitle (6-12 words)

Keep it engaging.`,
        expectedSlots: ["section_title", "section_subtitle"],
      };

    default:
      return {
        prompt: `${ctx}\n\nWrite a brief section for this ${industryName} business.\nReturn JSON with: "headline" and "description" keys.`,
        expectedSlots: ["headline", "description"],
      };
  }
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPrompt(
  tone?: string,
  targetAudience?: string,
  primaryGoal?: string
): string {
  let prompt =
    "You are an expert web copywriter specializing in small business websites. You output ONLY valid JSON objects with the exact keys requested. No markdown, no code fences, no commentary. Write natural, compelling, brand-specific content that matches the business type and tone. Never use generic B2B consulting language for retail/e-commerce businesses. Each answer must directly address its paired question. Never use placeholder text.";

  if (tone && tone !== "professional") {
    prompt += `\n\nIMPORTANT: Write in a ${tone} tone throughout. `;
    const toneGuide: Record<string, string> = {
      friendly: "Use warm, approachable language. Be conversational, not corporate.",
      playful: "Use fun, energetic language. Be witty and engaging.",
      authoritative: "Use confident, expert language. Establish credibility and command.",
      casual: "Use relaxed, everyday language. Avoid jargon and formality.",
      luxury: "Use refined, exclusive language. Convey premium quality and sophistication.",
      inspirational: "Use motivating, uplifting language. Paint a vision of transformation.",
    };
    prompt += toneGuide[tone] || `Match the ${tone} style consistently.`;
  }

  if (targetAudience) {
    prompt += `\n\nTarget audience: ${targetAudience}. Tailor language, examples, and pain points to resonate with this specific audience.`;
  }

  if (primaryGoal) {
    const goalGuide: Record<string, string> = {
      phone_calls: "Optimize CTAs for phone calls. Use urgency and direct 'Call Now' language.",
      form_leads: "Optimize CTAs for form submissions. Emphasize free quotes and consultations.",
      book_appointments: "Optimize CTAs for bookings. Use scheduling and availability language.",
      showcase_work: "Optimize CTAs for portfolio exploration. Highlight expertise and results.",
      sell_products: "Optimize CTAs for purchases. Use shopping and product-discovery language.",
      provide_info: "Optimize CTAs for engagement. Use 'Learn More' and educational language.",
    };
    const guide = goalGuide[primaryGoal];
    if (guide) {
      prompt += `\n\n${guide}`;
    }
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Generate pattern slots via LLM (injectable)
// ---------------------------------------------------------------------------

export async function generatePatternSlots(
  patternSlug: PatternSlug,
  biz: BlueprintBusinessInfo,
  services: BlueprintService[],
  story: BlueprintStory,
  industryName: string,
  archetype: string,
  industryCode: string | undefined,
  isRegulated: boolean,
  trustSignals: Array<{ type: string; value: string }>,
  llm: LLMFunction,
  tone?: string,
  targetAudience?: string,
  primaryGoal?: string
): Promise<PatternSlots | null> {
  const { prompt } = buildSlotPrompt(
    patternSlug,
    biz,
    services,
    story,
    industryName,
    archetype,
    trustSignals
  );

  const task = isRegulated ? "regulated_content" : "generate_pattern_content";
  let systemPrompt = buildSystemPrompt(tone, targetAudience, primaryGoal);
  if (isRegulated) {
    systemPrompt += "\n\nIMPORTANT: This is a regulated industry. Do not make claims that could be considered professional advice. Include appropriate disclaimers.";
  }

  const response = await llm(task, prompt, systemPrompt, industryCode);
  if (!response || !response.text) return null;

  // Parse JSON from response (strip code fences if present)
  try {
    let jsonText = response.text.trim();
    // Remove markdown code fences
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(jsonText);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as PatternSlots;
    }
  } catch {
    console.warn(
      `[gutenberg] Failed to parse LLM JSON for pattern "${patternSlug}", using fallback`
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Build fallback slots from blueprint data (no LLM needed)
// ---------------------------------------------------------------------------

const CONTENT_GOAL_CTA_MAP: Record<string, string> = {
  phone_calls: "Call Us Today",
  form_leads: "Get a Free Quote",
  book_appointments: "Book Now",
  showcase_work: "View Our Work",
  sell_products: "Shop Now",
  provide_info: "Learn More",
};

export function buildFallbackSlots(
  patternSlug: PatternSlug,
  biz: BlueprintBusinessInfo,
  services: BlueprintService[],
  story: BlueprintStory,
  team: BlueprintTeamMember[],
  testimonials: BlueprintTestimonial[],
  faqs: BlueprintFaq[],
  trustSignals: Array<{ type: string; value: string }>,
  businessHours: string,
  contactPrefs: ContactPrefs,
  archetype: string,
  primaryGoal?: string
): PatternSlots {
  const goalCta = primaryGoal ? CONTENT_GOAL_CTA_MAP[primaryGoal] : undefined;
  const featuredServices = services.filter((s) => s.featured).slice(0, 6);
  const topServices =
    featuredServices.length > 0 ? featuredServices : services.slice(0, 3);

  switch (patternSlug) {
    case "hero-split-screen": {
      const yearsStr = biz.yearsInBusiness
        ? parseInt(biz.yearsInBusiness.replace(/[^0-9]/g, ""), 10)
        : 0;
      const clientEst = yearsStr > 0 ? `${Math.round(yearsStr * 20 / 10) * 10}+` : "500+";
      return {
        headline: biz.tagline || `${biz.name} — Quality You Can Trust`,
        description: biz.description || (biz.location
          ? `Professional services in ${biz.location}. Contact ${biz.name} today.`
          : `Professional services from ${biz.name}. Get in touch today.`),
        cta_primary: contactPrefs.formType === "click_to_call" ? `Call ${biz.phone}` : (goalCta || "Get a Free Quote"),
        cta_secondary: "Our Services",
        stat_1_number: clientEst,
        stat_1_label: "Happy Clients",
        stat_2_number: yearsStr > 0 ? `${yearsStr}+` : "10+",
        stat_2_label: "Years Experience",
      };
    }

    case "hero-image-bg":
    case "hero-centered-minimal":
    case "hero-video-bg":
    case "hero-asymmetric":
      return {
        headline: biz.tagline || `${biz.name} — Quality You Can Trust`,
        description: biz.description || (biz.location
          ? `Professional services in ${biz.location}. Contact ${biz.name} today.`
          : `Professional services from ${biz.name}. Get in touch today.`),
        cta_primary: contactPrefs.formType === "click_to_call" ? `Call ${biz.phone}` : (goalCta || "Get a Free Quote"),
        cta_secondary: "Our Services",
      };

    case "hero-cards":
      return {
        headline: biz.tagline || `Everything You Need from ${biz.name}`,
        description: biz.description || `Discover our comprehensive services designed to help you succeed.`,
        cta_primary: contactPrefs.formType === "click_to_call" ? `Call ${biz.phone}` : (goalCta || "Get Started"),
        card_1_title: topServices[0]?.name ?? "Quality First",
        card_1_desc: topServices[0] ? topServices[0].description.substring(0, 60) : "Premium quality in every detail.",
        card_2_title: topServices[1]?.name ?? "Fast Delivery",
        card_2_desc: topServices[1] ? topServices[1].description.substring(0, 60) : "On time, every time.",
        card_3_title: topServices[2]?.name ?? "Expert Support",
        card_3_desc: topServices[2] ? topServices[2].description.substring(0, 60) : "Help when you need it most.",
      };

    case "services-grid":
    case "services-alternating": {
      const svcDefaults = archetype === "COMMERCE"
        ? ["Featured Collection", "Best Sellers", "New Arrivals"]
        : archetype === "VENUE"
        ? ["Dining Experience", "Private Events", "Catering"]
        : archetype === "PORTFOLIO"
        ? ["Design", "Development", "Strategy"]
        : ["Consultation", "Professional Service", "Maintenance & Repair"];
      return {
        section_title: "Our Services",
        section_subtitle: `Professional ${biz.name} services tailored to your needs.`,
        service_1_name: topServices[0]?.name ?? svcDefaults[0],
        service_1_desc: topServices[0]?.description ?? `Expert ${svcDefaults[0].toLowerCase()} from ${biz.name} with attention to detail.`,
        service_2_name: topServices[1]?.name ?? svcDefaults[1],
        service_2_desc: topServices[1]?.description ?? `Customized ${svcDefaults[1].toLowerCase()} from ${biz.name} designed to meet your unique needs.`,
        service_3_name: topServices[2]?.name ?? svcDefaults[2],
        service_3_desc: topServices[2]?.description ?? `Dedicated ${svcDefaults[2].toLowerCase()} and expert guidance from the ${biz.name} team.`,
      };
    }

    case "services-icons": {
      const s4 = services[3];
      const iconSvcDefaults = archetype === "COMMERCE"
        ? ["Featured Collection", "Best Sellers", "New Arrivals", "Gift Cards"]
        : archetype === "VENUE"
        ? ["Dining Experience", "Private Events", "Catering", "Takeaway"]
        : archetype === "PORTFOLIO"
        ? ["Design", "Development", "Strategy", "Consulting"]
        : ["Consultation", "Professional Service", "Maintenance & Repair", "Emergency Service"];
      return {
        section_title: "Our Services",
        section_subtitle: `Everything you need from ${biz.name}, all in one place.`,
        service_1_name: topServices[0]?.name ?? iconSvcDefaults[0],
        service_1_desc: topServices[0]?.description ?? `Expert ${iconSvcDefaults[0].toLowerCase()} from ${biz.name} with attention to detail.`,
        service_2_name: topServices[1]?.name ?? iconSvcDefaults[1],
        service_2_desc: topServices[1]?.description ?? `Customized ${iconSvcDefaults[1].toLowerCase()} from ${biz.name} designed to meet your unique needs.`,
        service_3_name: topServices[2]?.name ?? iconSvcDefaults[2],
        service_3_desc: topServices[2]?.description ?? `Dedicated ${iconSvcDefaults[2].toLowerCase()} and expert guidance from the ${biz.name} team.`,
        service_4_name: s4?.name ?? iconSvcDefaults[3],
        service_4_desc: s4?.description ?? `Comprehensive ${iconSvcDefaults[3].toLowerCase()} that covers all aspects of your needs.`,
      };
    }

    case "trust-bar":
      return {
        trust_1: trustSignals[0]?.value ?? "4.9/5 Customer Rating",
        trust_2: trustSignals[1]?.value ?? "Trusted by 500+ Clients",
        trust_3: trustSignals[2]?.value ?? "Licensed & Insured",
        trust_4: trustSignals[3]?.value ?? (biz.yearsInBusiness ? `${biz.yearsInBusiness} Experience` : "10+ Years Experience"),
      };

    case "testimonials-carousel":
    case "testimonials-cards": {
      const t1 = testimonials[0];
      const t2 = testimonials[1];
      const t3 = testimonials[2];
      return {
        section_title: "What Our Clients Say",
        section_subtitle: `Hear from our satisfied customers.`,
        quote_1: t1?.quote ?? `Outstanding service from ${biz.name}. Highly recommended!`,
        name_1: t1?.name ?? "Alex M.",
        title_1: t1?.title ?? `${biz.name} Customer`,
        quote_2: t2?.quote ?? `Professional, reliable, and great value. Could not be happier.`,
        name_2: t2?.name ?? "Jordan R.",
        title_2: t2?.title ?? "Verified Buyer",
        quote_3: t3?.quote ?? `Exceptional quality and attention to detail. A top-notch team.`,
        name_3: t3?.name ?? "Taylor S.",
        title_3: t3?.title ?? "Returning Customer",
      };
    }

    case "testimonials-single": {
      const ts = testimonials[0];
      return {
        quote: ts?.quote ?? `This team completely transformed our business. Their attention to detail and dedication to our success made all the difference. I cannot recommend ${biz.name} highly enough.`,
        name: ts?.name ?? "Alex M.",
        title: ts?.title ?? `${biz.name} Customer`,
      };
    }

    case "faq-accordion": {
      const f1 = faqs[0];
      const f2 = faqs[1];
      const f3 = faqs[2];
      const f4 = faqs[3];
      const f5 = faqs[4];
      const isCommerce = archetype === "COMMERCE";
      return {
        section_title: "Frequently Asked Questions",
        section_subtitle: `Find answers to common questions about ${biz.name}.`,
        faq_1_q: f1?.question ?? (isCommerce ? "What products do you offer?" : "What services do you offer?"),
        faq_1_a: f1?.answer ?? `${biz.name} offers a wide selection tailored to your needs. Browse our collection or contact us for details.`,
        faq_2_q: f2?.question ?? (isCommerce ? "What is your shipping policy?" : "How much does it cost?"),
        faq_2_a: f2?.answer ?? (isCommerce ? "We offer fast, reliable shipping on all orders. Contact us for specific delivery timeframes." : "Our pricing varies based on the scope of each project. We provide free estimates and transparent pricing."),
        faq_3_q: f3?.question ?? (isCommerce ? "What is your return policy?" : "How long does it take?"),
        faq_3_a: f3?.answer ?? (isCommerce ? "We want you to be completely satisfied. Contact us within 30 days of purchase for returns or exchanges." : "Timelines depend on the project. Most standard projects are completed within 2-4 weeks."),
        faq_4_q: f4?.question ?? "Do you offer a guarantee?",
        faq_4_a: f4?.answer ?? `Yes, we stand behind our work with a satisfaction guarantee. If you are not happy, we will make it right.`,
        faq_5_q: f5?.question ?? (isCommerce ? "How can I track my order?" : "How do I get started?"),
        faq_5_a: f5?.answer ?? (isCommerce ? "Once your order ships, you will receive a tracking number via email to monitor your delivery." : "Simply reach out through our contact form, give us a call, or send us an email to get started."),
      };
    }

    case "cta-banner":
    case "cta-split":
    case "cta-gradient":
    case "cta-minimal": {
      const ctaDefaults = archetype === "COMMERCE"
        ? { headline: `Shop ${biz.name} Today`, description: `Discover our collection and find exactly what you are looking for at ${biz.name}.`, cta_text: goalCta || "Shop Now" }
        : archetype === "VENUE"
        ? { headline: `Visit ${biz.name} Today`, description: `Experience what makes ${biz.name} special. Reserve your spot today.`, cta_text: goalCta || "Book a Table" }
        : archetype === "PORTFOLIO"
        ? { headline: `Start Your Project`, description: `Let ${biz.name} bring your vision to life. Get in touch today.`, cta_text: goalCta || "Get in Touch" }
        : { headline: "Ready to Get Started?", description: `Contact ${biz.name} today for a free consultation.`, cta_text: contactPrefs.formType === "click_to_call" ? `Call ${biz.phone}` : (goalCta || "Get a Free Quote") };
      return ctaDefaults;
    }

    case "stats-counter": {
      const yearsNum = biz.yearsInBusiness
        ? parseInt(biz.yearsInBusiness.replace(/[^0-9]/g, ""), 10)
        : 0;
      const projectEstimate = yearsNum > 0
        ? `${Math.round(yearsNum * 50 / 10) * 10}+`
        : "200+";
      const clientEstimate = yearsNum > 0
        ? `${Math.round(yearsNum * 20 / 10) * 10}+`
        : "100+";
      return {
        stat_1_number: yearsNum > 0 ? `${yearsNum}+` : "10+",
        stat_1_label: "Years Experience",
        stat_2_number: projectEstimate,
        stat_2_label: "Projects Completed",
        stat_3_number: clientEstimate,
        stat_3_label: "Happy Clients",
        stat_4_number: "100%",
        stat_4_label: "Satisfaction Guarantee",
      };
    }

    case "team-grid": {
      const m1 = team[0];
      const m2 = team[1];
      const m3 = team[2];
      const m4 = team[3];
      return {
        section_title: `Meet the ${biz.name} Team`,
        section_subtitle: `The dedicated professionals behind ${biz.name}.`,
        member_1_name: m1?.name ?? `The ${biz.name} Team`,
        member_1_role: m1?.role ?? "Founder & Lead",
        member_2_name: m2?.name ?? `${biz.name} Operations`,
        member_2_role: m2?.role ?? "Operations Manager",
        member_3_name: m3?.name ?? `${biz.name} Specialist`,
        member_3_role: m3?.role ?? "Senior Specialist",
        member_4_name: m4?.name ?? `${biz.name} Marketing`,
        member_4_role: m4?.role ?? "Marketing Manager",
      };
    }

    case "contact-form-section":
      return {
        headline: "Get In Touch",
        description: `We would love to hear from you. Contact ${biz.name} and we will get back to you shortly.`,
        contact_address: biz.location || "123 Main Street, Suite 100<br>City, State 12345",
        contact_phone: biz.phone || "(555) 123-4567",
        contact_email: biz.email || "hello@example.com",
        contact_hours: businessHours || "Mon - Fri: 9:00 AM - 5:00 PM<br>Sat: 10:00 AM - 2:00 PM<br>Sun: Closed",
      };

    case "hours-widget":
      return {
        headline: "Business Hours",
        hours_text: businessHours || "Monday - Friday: 8:00 AM - 6:00 PM",
      };

    case "map-embed":
      return {
        headline: "Find Us",
        location_text: biz.location
          ? `Visit us in ${biz.location}. We look forward to seeing you!`
          : "Visit our location or get directions below.",
      };

    case "booking-cta":
      return {
        headline: "Book Your Appointment Today",
        description:
          "Schedule a consultation with our team of experts. We offer flexible scheduling to fit your busy lifestyle.",
        cta_text: "Book Now",
      };

    case "pricing-table":
      return {
        section_title: "Pricing Plans",
        section_subtitle: "Choose the plan that fits your needs.",
      };

    case "portfolio-grid":
      return {
        section_title: "Our Work",
        section_subtitle: "Explore our recent projects and see what we can do.",
      };

    case "gallery-masonry":
      return {
        section_title: "Our Gallery",
        section_subtitle: "A showcase of our finest work and projects.",
      };

    case "menu-grid":
      return {
        section_title: "Our Menu",
        section_subtitle: "Crafted with care using the finest ingredients.",
      };

    case "logo-cloud":
      return {
        section_title: "Trusted By",
        section_subtitle: "Companies and organizations that trust our services.",
      };

    case "blog-preview":
      return {
        section_title: "Latest from Our Blog",
        section_subtitle: "Stay up to date with our news and insights.",
      };

    case "features-checklist":
      return {
        section_title: `Why Choose ${biz.name}`,
        feature_1: trustSignals[0]?.value ?? "Licensed and insured professionals",
        feature_2: biz.yearsInBusiness ? `Over ${biz.yearsInBusiness} of industry experience` : "Over 10 years of industry experience",
        feature_3: "100% satisfaction guarantee",
        feature_4: "Transparent pricing with no hidden fees",
        feature_5: "Fast response times and flexible scheduling",
        feature_6: biz.location ? `Proudly serving ${biz.location}` : "Locally owned and operated",
      };

    case "features-columns":
      return {
        section_title: `What Sets ${biz.name} Apart`,
        section_subtitle: `The qualities that make us your best choice.`,
        feature_1_title: topServices[0]?.name ?? "Quality Craftsmanship",
        feature_1_desc: topServices[0]?.description?.substring(0, 80) ?? "Every project receives our full attention to detail and highest standards.",
        feature_2_title: topServices[1]?.name ?? "Reliable Service",
        feature_2_desc: topServices[1]?.description?.substring(0, 80) ?? "We show up on time and deliver on our promises, every single time.",
        feature_3_title: topServices[2]?.name ?? "Expert Team",
        feature_3_desc: topServices[2]?.description?.substring(0, 80) ?? "Our skilled professionals bring years of experience to every job.",
        feature_4_title: "Customer First",
        feature_4_desc: `Your satisfaction is ${biz.name}'s top priority from start to finish.`,
      };

    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// High-level page content generator
// ---------------------------------------------------------------------------

/**
 * Generate complete Gutenberg HTML for a single page.
 * Looks up the pattern sequence, generates/falls back slot content,
 * hydrates templates, and returns concatenated HTML.
 */
export async function generatePageContent(
  pageSlug: string,
  options: GeneratePageContentOptions,
  llm: LLMFunction
): Promise<string> {
  const {
    businessInfo,
    services,
    story,
    team,
    testimonials,
    faqs,
    trustSignals,
    contactPrefs,
    businessHours,
    industryName,
    archetype,
    industryCode,
    isRegulated,
    tone,
    targetAudience,
    primaryGoal,
    designPackage,
  } = options;

  // 1. Look up pattern sequence
  const patternSequence = getPageLayoutWithDesignPackage(archetype, pageSlug, designPackage);

  // 2. For each pattern, generate slot content
  const hydratedPatterns: string[] = [];

  for (const patternSlug of patternSequence) {
    // Build fallback slots from blueprint data
    const fallbackSlots = buildFallbackSlots(
      patternSlug,
      businessInfo,
      services,
      story,
      team,
      testimonials,
      faqs,
      trustSignals,
      businessHours,
      contactPrefs,
      archetype,
      primaryGoal
    );

    // Try LLM generation for richer content
    let finalSlots: PatternSlots = fallbackSlots;
    const llmSlots = await generatePatternSlots(
      patternSlug,
      businessInfo,
      services,
      story,
      industryName,
      archetype,
      industryCode,
      isRegulated,
      trustSignals,
      llm,
      tone,
      targetAudience,
      primaryGoal
    );

    if (llmSlots) {
      // Merge: LLM slots override fallback, but keep fallback for any missing keys
      finalSlots = { ...fallbackSlots };
      for (const [key, value] of Object.entries(llmSlots)) {
        if (typeof value === "string" && value.trim()) {
          finalSlots[key] = value;
        }
      }
    }

    // Deduplicate stats labels — LLM sometimes generates duplicate labels
    if (patternSlug === "stats-counter") {
      const labelKeys = ["stat_1_label", "stat_2_label", "stat_3_label", "stat_4_label"];
      const seen = new Set<string>();
      const replacements = ["Years Experience", "Projects Completed", "Happy Clients", "Satisfaction Rate"];
      for (const key of labelKeys) {
        const label = (finalSlots[key] as string || "").toLowerCase().trim();
        if (seen.has(label)) {
          const replacement = replacements.find((r) => !seen.has(r.toLowerCase()));
          if (replacement) {
            finalSlots[key] = replacement;
            seen.add(replacement.toLowerCase());
          }
        } else {
          seen.add(label);
        }
      }
    }

    // 3. Hydrate the pattern template with final slots
    try {
      let hydrated = await hydratePattern(patternSlug, finalSlots);

      // Adjust links based on archetype
      if (archetype === "COMMERCE") {
        hydrated = hydrated.replace(/href="\/services\/"/g, 'href="/shop/"');
        hydrated = hydrated.replace(
          /(<a[^>]*class="wp-block-button__link[^"]*"[^>]*)href="\/contact\/"([^>]*>)(Shop|Browse|Buy|Order|View|Explore)\b/gi,
          '$1href="/shop/"$2$3'
        );
      }

      hydratedPatterns.push(hydrated);
    } catch (err) {
      console.warn(
        `[gutenberg] Failed to hydrate pattern "${patternSlug}" for page "${pageSlug}": ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  }

  // 4. Concatenate hydrated patterns = final page content
  return hydratedPatterns.join("\n\n");
}
