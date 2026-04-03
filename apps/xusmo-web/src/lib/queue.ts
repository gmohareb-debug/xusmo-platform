// =============================================================================
// BullMQ Queue Definitions + Pipeline Orchestrator
// Defines queues and orchestration for the agent pipeline.
// Usage: import { startBuildPipeline, queueNextAgent } from "@/lib/queue";
// =============================================================================

import { Queue } from "bullmq";
import { prisma } from "@/lib/db";
import type { BuildStatus } from "@prisma/client";
import { getLimitsForTrack } from "@/lib/billing/limits";
import { cloneSite } from "@/lib/wordpress/clone";
import {
  injectContent,
  updateSiteSettings,
  createMenu,
  createBlockNavigation,
  customizeFooter,
  uploadHeroImage,
  setHeroCoverImage,
  injectTemplatePart,
  type PageToCreate,
} from "@/lib/wordpress/content";
import { buildThemeJson } from "@/lib/wordpress/fonts";
import { getThemePreset, mergeUserColors } from "@/lib/wordpress/theme-presets";
import { getExecutor } from "@/lib/wordpress/ssh";
import type { Archetype } from "@/lib/classification/archetypes";
import { createSiteContainer, allocatePort, type XusmoTheme } from "@/lib/wordpress/container";
import { classifyDesignStyle } from "@/lib/wordpress/pattern-registry";

// Multi-theme feature flag — also accept quoted "true" from systemd EnvironmentFile
const USE_MULTI_THEME = (process.env.USE_MULTI_THEME ?? "").replace(/"/g, "").trim() === "true";
const THEME_MAP: Record<string, XusmoTheme> = {
  SERVICE: "xusmo-service",
  COMMERCE: "xusmo-commerce",
  VENUE: "xusmo-venue",
  PORTFOLIO: "xusmo-portfolio",
};

// ---------------------------------------------------------------------------
// Build concurrency limiter — prevents OOM and LLM rate-limit issues
// when 100+ users trigger builds simultaneously. Queued builds wait
// until a slot opens. MAX_CONCURRENT_BUILDS defaults to 5.
// ---------------------------------------------------------------------------

const MAX_CONCURRENT_BUILDS = parseInt(process.env.MAX_CONCURRENT_BUILDS || "5", 10);
let activeBuildCount = 0;
const buildWaitQueue: Array<() => void> = [];

async function acquireBuildSlot(): Promise<void> {
  if (activeBuildCount < MAX_CONCURRENT_BUILDS) {
    activeBuildCount++;
    console.log(`[concurrency] Build slot acquired (${activeBuildCount}/${MAX_CONCURRENT_BUILDS} active)`);
    return;
  }
  console.log(`[concurrency] All ${MAX_CONCURRENT_BUILDS} build slots in use, queuing...`);
  return new Promise((resolve) => buildWaitQueue.push(resolve));
}

function releaseBuildSlot(): void {
  activeBuildCount--;
  if (buildWaitQueue.length > 0) {
    activeBuildCount++;
    const next = buildWaitQueue.shift()!;
    console.log(`[concurrency] Build slot released → next queued build starting (${activeBuildCount}/${MAX_CONCURRENT_BUILDS} active, ${buildWaitQueue.length} waiting)`);
    next();
  } else {
    console.log(`[concurrency] Build slot released (${activeBuildCount}/${MAX_CONCURRENT_BUILDS} active)`);
  }
}

// ---------------------------------------------------------------------------
// Redis connection config (BullMQ bundles its own ioredis)
// ---------------------------------------------------------------------------

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6380";
const url = new URL(redisUrl);
export const redisConnection = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  ...(url.password ? { password: url.password } : {}),
};

const defaultOpts = { connection: redisConnection };

// ---------------------------------------------------------------------------
// Queue definitions
// ---------------------------------------------------------------------------

export const contentQueue = new Queue("content", defaultOpts);
export const buildQueue = new Queue("build", defaultOpts);
export const seoQueue = new Queue("seo", defaultOpts);
export const assetQueue = new Queue("asset", defaultOpts);
export const qaQueue = new Queue("qa", defaultOpts);
export const publishQueue = new Queue("publish", defaultOpts);
export const securityQueue = new Queue("security", defaultOpts);
export const revisionQueue = new Queue("revision", defaultOpts);

// ---------------------------------------------------------------------------
// Agent pipeline order
// ---------------------------------------------------------------------------

const PIPELINE_ORDER = ["content", "build", "seo", "asset", "qa"] as const;

function getNextAgent(current: string): string | null {
  const idx = PIPELINE_ORDER.indexOf(current as typeof PIPELINE_ORDER[number]);
  if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[idx + 1];
}

function getQueueForAgent(agentName: string): Queue | null {
  switch (agentName) {
    case "content": return contentQueue;
    case "build": return buildQueue;
    case "seo": return seoQueue;
    case "asset": return assetQueue;
    case "qa": return qaQueue;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Start build pipeline
// ---------------------------------------------------------------------------

export async function startBuildPipeline(blueprintId: string) {
  // Load Blueprint
  const blueprint = await prisma.blueprint.findUniqueOrThrow({
    where: { id: blueprintId },
    include: { lead: true },
  });

  const generatorType = (blueprint as Record<string, unknown>).generatorType as string ?? "engine";

  // Create Build record
  const build = await prisma.build.create({
    data: {
      blueprintId,
      status: "QUEUED",
      archetype: blueprint.lead.archetype ?? "SERVICE",
      generatorType,
      industryId: blueprint.lead.industryId,
      startedAt: new Date(),
      currentAgent: "content",
    },
  });

  // Queue first agent (content)
  await contentQueue.add(
    "generate-content",
    { buildId: build.id, blueprintId },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    }
  );

  return { buildId: build.id, status: "QUEUED" as const };
}

// ---------------------------------------------------------------------------
// Queue next agent in pipeline
// ---------------------------------------------------------------------------

export async function queueNextAgent(
  buildId: string,
  blueprintId: string,
  currentAgent: string
) {
  const nextAgent = getNextAgent(currentAgent);
  if (!nextAgent) return null;

  const queue = getQueueForAgent(nextAgent);
  if (!queue) return null;

  await queue.add(
    `${nextAgent}-job`,
    { buildId, blueprintId },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    }
  );

  return nextAgent;
}

// ---------------------------------------------------------------------------
// Build status helper
// ---------------------------------------------------------------------------

export async function updateBuildStatus(
  buildId: string,
  status: BuildStatus,
  currentAgent?: string,
  progress?: number
) {
  await prisma.build.update({
    where: { id: buildId },
    data: {
      status,
      ...(currentAgent ? { currentAgent } : {}),
      ...(progress !== undefined ? { progress } : {}),
    },
  });
}

// ---------------------------------------------------------------------------
// Dev-mode pipeline — creates Build + Site + Pages synchronously (no Redis)
// ---------------------------------------------------------------------------

// Blueprint shape types for type-safe access
interface BpBusinessInfo {
  name: string;
  description: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
}

interface BpService {
  name: string;
  description: string;
  featured: boolean;
}

interface BpPage {
  slug: string;
  title: string;
  isRequired: boolean;
  blocks: Array<{ type: string; data: Record<string, unknown>; order: number }>;
  content?: string; // Gutenberg HTML — populated by content agent
}

interface BpStory {
  foundingStory: string;
  differentiator: string;
  targetAudience: string;
  uniqueSellingPoint: string;
  certifications: string;
  serviceAreas: string;
}

interface BpTestimonial {
  quote: string;
  name: string;
  title: string;
}

interface BpFaq {
  question: string;
  answer: string;
}

interface BpTeamMember {
  name: string;
  role: string;
  bio: string;
}

interface BpContactPrefs {
  phone: string;
  email: string;
  formType: string;
  showMap: boolean;
}

interface BpSeoData {
  focusKeywords: string[];
  schemaType: string;
  metaDescription: string;
}

interface DevPageContent {
  heroHeadline: string | null;
  heroSubheadline: string | null;
  ctaLabel: string | null;
  bodyContent: Array<{ type: string; content: string }>;
  metaTitle: string | null;
  metaDesc: string | null;
}

const GOAL_CTA_MAP: Record<string, string> = {
  phone_calls: "Call Us Today",
  form_leads: "Get a Free Quote",
  book_appointments: "Book an Appointment",
  showcase_work: "View Our Work",
  sell_products: "Shop Now",
  provide_info: "Learn More",
  physical_products: "Shop Now",
  digital_products: "Browse Products",
  services_online: "Get Started",
  subscriptions: "Subscribe Now",
};

function generateDevPageContent(
  page: BpPage,
  biz: BpBusinessInfo,
  services: BpService[],
  story: BpStory,
  testimonials: BpTestimonial[],
  faqs: BpFaq[],
  team: BpTeamMember[],
  contactPrefs: BpContactPrefs,
  seoData: BpSeoData,
  goals: string[],
): DevPageContent {
  const featured = services.filter((s) => s.featured).slice(0, 6);
  const topServices = featured.length > 0 ? featured : services.slice(0, 3);
  const primaryGoal = goals[0] ?? "provide_info";
  const defaultCta = GOAL_CTA_MAP[primaryGoal] ?? "Get Started";

  switch (page.slug) {
    case "home":
      return {
        heroHeadline: biz.tagline || `Welcome to ${biz.name}`,
        heroSubheadline: biz.description,
        ctaLabel: defaultCta,
        bodyContent: [
          ...topServices.map((s) => ({
            type: "service",
            content: `**${s.name}** — ${s.description}`,
          })),
          ...(story.differentiator
            ? [{ type: "text", content: story.differentiator }]
            : []),
          ...(testimonials.length > 0
            ? [
                {
                  type: "testimonial",
                  content: testimonials
                    .slice(0, 3)
                    .map((t) => `"${t.quote}" — ${t.name}, ${t.title}`)
                    .join("\n\n"),
                },
              ]
            : []),
        ],
        metaTitle: `${biz.name} | ${biz.location || "Home"}`,
        metaDesc: seoData.metaDescription || biz.description.slice(0, 160),
      };

    case "services":
    case "products":
      return {
        heroHeadline: page.title,
        heroSubheadline: `Professional services from ${biz.name}.`,
        ctaLabel: defaultCta,
        bodyContent: services.map((s) => ({
          type: "service",
          content: `**${s.name}** — ${s.description}`,
        })),
        metaTitle: `${page.title} | ${biz.name}`,
        metaDesc: `Explore services offered by ${biz.name} in ${biz.location}.`,
      };

    case "about":
    case "about_us":
      return {
        heroHeadline: `About ${biz.name}`,
        heroSubheadline: story.foundingStory || biz.description,
        ctaLabel: "Contact Us",
        bodyContent: [
          ...(story.foundingStory
            ? [{ type: "text", content: story.foundingStory }]
            : []),
          ...(story.uniqueSellingPoint
            ? [{ type: "text", content: story.uniqueSellingPoint }]
            : []),
          ...(story.certifications
            ? [{ type: "text", content: `Certifications: ${story.certifications}` }]
            : []),
          ...team.map((m) => ({
            type: "team_member",
            content: `**${m.name}** — ${m.role}${m.bio ? `: ${m.bio}` : ""}`,
          })),
        ],
        metaTitle: `About Us | ${biz.name}`,
        metaDesc: `Learn about ${biz.name}. ${(story.differentiator || biz.description).slice(0, 120)}`,
      };

    case "contact":
    case "contact_us":
      return {
        heroHeadline: "Contact Us",
        heroSubheadline: `Get in touch with ${biz.name}. We'd love to hear from you.`,
        ctaLabel:
          contactPrefs.formType === "click_to_call"
            ? `Call ${biz.phone || "Us"}`
            : "Send Message",
        bodyContent: [
          {
            type: "contact_info",
            content: [
              biz.phone ? `Phone: ${biz.phone}` : null,
              biz.email ? `Email: ${biz.email}` : null,
              biz.location ? `Location: ${biz.location}` : null,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
        metaTitle: `Contact | ${biz.name}`,
        metaDesc: `Contact ${biz.name} in ${biz.location}. ${biz.phone ? `Phone: ${biz.phone}.` : ""} ${biz.email ? `Email: ${biz.email}.` : ""}`.trim(),
      };

    case "faq":
    case "faqs":
      return {
        heroHeadline: "Frequently Asked Questions",
        heroSubheadline: "Find answers to common questions below.",
        ctaLabel: "Contact Us",
        bodyContent:
          faqs.length > 0
            ? faqs.map((f) => ({
                type: "faq",
                content: `**${f.question}**\n${f.answer}`,
              }))
            : [
                {
                  type: "faq",
                  content:
                    "**What services do you offer?**\nContact us to learn about our full range of services.",
                },
              ],
        metaTitle: `FAQ | ${biz.name}`,
        metaDesc: `Frequently asked questions about ${biz.name} services.`,
      };

    case "portfolio":
    case "gallery":
      return {
        heroHeadline: page.title,
        heroSubheadline: `See our work at ${biz.name}.`,
        ctaLabel: defaultCta,
        bodyContent: [
          {
            type: "text",
            content: "Browse our portfolio of completed projects.",
          },
        ],
        metaTitle: `${page.title} | ${biz.name}`,
        metaDesc: `View the ${page.title.toLowerCase()} from ${biz.name}.`,
      };

    case "shop":
    case "store":
      return {
        heroHeadline: "Shop",
        heroSubheadline: `Browse products from ${biz.name}.`,
        ctaLabel: "Shop Now",
        bodyContent: [
          {
            type: "text",
            content: "Our product catalog will be available here.",
          },
        ],
        metaTitle: `Shop | ${biz.name}`,
        metaDesc: `Shop products from ${biz.name}.`,
      };

    default:
      return {
        heroHeadline: page.title,
        heroSubheadline: `${page.title} from ${biz.name}.`,
        ctaLabel: defaultCta,
        bodyContent: [
          {
            type: "text",
            content: `Content for the ${page.title} page. Edit this in the Content Editor.`,
          },
        ],
        metaTitle: `${page.title} | ${biz.name}`,
        metaDesc: `${page.title} — ${biz.name}${biz.location ? ` in ${biz.location}` : ""}.`,
      };
  }
}

export async function startDevBuildPipeline(blueprintId: string) {
  const blueprint = await prisma.blueprint.findUniqueOrThrow({
    where: { id: blueprintId },
    include: { lead: true },
  });

  const leadTrack = blueprint.lead.track ?? "WEBSITE";
  const isEcommerce = leadTrack === "ECOMMERCE";
  const archetype = isEcommerce
    ? "COMMERCE"
    : (blueprint.lead.archetype ?? "SERVICE");
  const generatorType = (blueprint as Record<string, unknown>).generatorType as string ?? "engine";

  // Auto-select a matching theme from the pool (least used for variety)
  const matchingTheme = await prisma.themePoolEntry.findFirst({
    where: { archetype: archetype as Archetype },
    orderBy: { usageCount: "asc" },
    select: { id: true },
  });
  const themePoolEntryId = matchingTheme?.id ?? null;
  if (themePoolEntryId) {
    console.log(`[dev-pipeline] Auto-selected theme: ${themePoolEntryId}`);
  }

  // Create Build record — the async pipeline updates it as it progresses
  const build = await prisma.build.create({
    data: {
      blueprintId,
      status: "IN_PROGRESS",
      archetype,
      generatorType,
      industryId: blueprint.lead.industryId,
      progress: 0,
      startedAt: new Date(),
      currentAgent: "content",
    },
  });

  console.log(`[dev-pipeline] Generator: ${generatorType}`);

  // Fire the real agent pipeline asynchronously with concurrency limiting.
  // Builds wait in queue until a slot opens (max MAX_CONCURRENT_BUILDS).
  void (async () => {
    await acquireBuildSlot();
    try {
      await runDevPipelineAsync(build.id, blueprintId, themePoolEntryId);
    } catch (err) {
      console.error("[dev-pipeline] Unhandled pipeline error:", err);
    } finally {
      releaseBuildSlot();
    }
  })();

  // Return immediately — client redirects to build page, polls for status
  return { buildId: build.id, siteId: null, status: "IN_PROGRESS" as const };
}

// ---------------------------------------------------------------------------
// Async dev pipeline — runs content agent + WP provisioning in background
// ---------------------------------------------------------------------------

async function runDevPipelineAsync(buildId: string, blueprintId: string, themePoolEntryId: string | null) {
  try {
    console.log(`[dev-pipeline] USE_MULTI_THEME=${USE_MULTI_THEME} (raw=${JSON.stringify(process.env.USE_MULTI_THEME)}), COOLIFY=${!!process.env.COOLIFY_API_TOKEN}`);

    // Determine which generator to use
    const buildRecord = await prisma.build.findUniqueOrThrow({ where: { id: buildId } });
    const generatorType = (buildRecord as Record<string, unknown>).generatorType as string ?? "engine";

    // =====================================================================
    // Stage 1: Content Generation — branched by generator type
    // =====================================================================

    // Will hold the engine's React component JSON (SiteDocument) if generatorType=engine
    let engineDesignDocument: unknown = null;

    if (generatorType === "engine") {
      // ── Engine path: WP1 AI pipeline → React JSON → Gutenberg blocks ──
      console.log("[dev-pipeline] Stage 1: Running engine generator...");

      const { generateViaEngine } = await import("@/lib/generators/engine-adapter");
      const bp = await prisma.blueprint.findUniqueOrThrow({
        where: { id: blueprintId },
        include: { lead: true },
      });
      const biz = (bp.businessInfo as Record<string, unknown>) ?? {};
      const bpStory = (bp.story as Record<string, unknown>) ?? {};
      const bpDesign = (bp.designPrefs as Record<string, unknown>) ?? {};
      const bpServices = (bp.services as Array<Record<string, unknown>>) ?? [];
      const serviceNames = bpServices.map((s: Record<string, unknown>) => `${s.name}: ${s.description}`).join("\n- ");

      const prompt = [
        `Build a professional website for "${biz.name ?? "My Business"}".`,
        ``,
        `BUSINESS DETAILS:`,
        `- Business Name: ${biz.name ?? "My Business"}`,
        `- Industry: ${bp.lead.industryName ?? "General Business"}`,
        `- Archetype: ${bp.lead.archetype ?? "SERVICE"}`,
        `- Description: ${biz.description ?? ""}`,
        biz.tagline ? `- Tagline: ${biz.tagline}` : "",
        biz.location ? `- Location: ${biz.location}` : "",
        biz.phone ? `- Phone: ${biz.phone}` : "",
        biz.email ? `- Email: ${biz.email}` : "",
        bpStory.differentiator ? `- What makes them different: ${bpStory.differentiator}` : "",
        bpStory.targetAudience ? `- Target audience: ${bpStory.targetAudience}` : "",
        bpDesign.tone ? `- Tone/style: ${bpDesign.tone}` : "",
        ``,
        serviceNames ? `SERVICES:\n- ${serviceNames}` : "",
        ``,
        `IMPORTANT: The navbar logo MUST say "${biz.name ?? "My Business"}". All content must be about this specific business.`,
      ].filter(Boolean).join("\n");

      // Pass structured blueprint data so the engine skips redundant re-analysis
      const blueprintContext = {
        businessName: biz.name as string,
        description: biz.description as string,
        industry: bp.lead.industryName,
        archetype: bp.lead.archetype,
        location: biz.location as string,
        tagline: biz.tagline as string,
        phone: biz.phone as string,
        email: biz.email as string,
        tone: (bpDesign.tone as string) || "professional",
        primaryGoal: (bp.lead.rawAnswers as Record<string, string>)?.primary_goal || "leads",
        differentiator: bpStory.differentiator as string,
        targetAudience: bpStory.targetAudience as string,
        colors: bpDesign.primaryColors as string[],
        services: bpServices.map((s: Record<string, unknown>) => ({
          name: s.name as string,
          description: s.description as string,
        })),
      };

      const { siteDoc, gutenbergPages } = await generateViaEngine(prompt, blueprintContext);

      // Preserve the React JSON as source of truth — will be stored in Site.designDocument
      engineDesignDocument = siteDoc;

      // Store engine-generated Gutenberg blocks in blueprint pages
      const bpPages = (bp.pages as Array<Record<string, unknown>>) ?? [];
      for (const page of bpPages) {
        const slug = page.slug as string;
        if (gutenbergPages[slug]) {
          page.content = gutenbergPages[slug];
        }
      }
      await prisma.blueprint.update({
        where: { id: blueprintId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { pages: bpPages as any },
      });

      console.log("[dev-pipeline] Stage 1 complete: Engine content generated + converted to Gutenberg blocks.");
    } else {
      // ── Gutenberg path: Pattern hydration via @xusmo/gutenberg ──
      console.log("[dev-pipeline] Stage 1: Running content agent (gutenberg)...");

      const { processContentJob } = await import("@/agents/content.agent");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockJob = { data: { buildId, blueprintId, themePoolEntryId, skipQueue: true } } as any;
      await processContentJob(mockJob);

      console.log("[dev-pipeline] Stage 1 complete: Gutenberg content generated.");
    }

    // =====================================================================
    // Stage 2: Create Site + Page Records
    // =====================================================================
    console.log("[dev-pipeline] Stage 2: Creating site and page records...");

    await prisma.build.update({
      where: { id: buildId },
      data: { currentAgent: "build", progress: 30 },
    });

    // Reload blueprint with LLM-generated content (pages now have .content)
    const blueprint = await prisma.blueprint.findUniqueOrThrow({
      where: { id: blueprintId },
      include: { lead: true },
    });

    const biz: BpBusinessInfo = {
      name: "My Business", description: "", tagline: "",
      location: "", phone: "", email: "",
      ...((blueprint.businessInfo as unknown as Partial<BpBusinessInfo>) ?? {}),
    };
    const services = (blueprint.services as unknown as BpService[]) ?? [];
    const bpPages = (blueprint.pages as unknown as BpPage[]) ?? [];
    const story: BpStory = {
      foundingStory: "", differentiator: "", targetAudience: "",
      uniqueSellingPoint: "", certifications: "", serviceAreas: "",
      ...((blueprint.story as unknown as Partial<BpStory>) ?? {}),
    };
    const testimonials = (blueprint.testimonials as unknown as BpTestimonial[]) ?? [];
    const faqs = (blueprint.faqs as unknown as BpFaq[]) ?? [];
    const team = (blueprint.team as unknown as BpTeamMember[]) ?? [];
    const contactPrefs: BpContactPrefs = {
      phone: biz.phone, email: biz.email,
      formType: "contact_form", showMap: false,
      ...((blueprint.contactPrefs as unknown as Partial<BpContactPrefs>) ?? {}),
    };
    const seoData: BpSeoData = {
      focusKeywords: [], schemaType: "LocalBusiness",
      metaDescription: biz.description.slice(0, 160),
      ...((blueprint.seoData as unknown as Partial<BpSeoData>) ?? {}),
    };
    const goals = (blueprint.goals as unknown as string[]) ?? [];
    const leadTrack = blueprint.lead.track ?? "WEBSITE";
    const isEcommerce = leadTrack === "ECOMMERCE";
    const archetype = isEcommerce
      ? "COMMERCE"
      : (blueprint.lead.archetype ?? "SERVICE");
    const limits = getLimitsForTrack(leadTrack, "FREE");

    // Resolve tenantId
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: blueprint.lead.userId },
      select: { tenantId: true },
      orderBy: { createdAt: "asc" },
    });

    // Determine theme for multi-theme architecture
    const wpTheme: XusmoTheme = THEME_MAP[archetype] ?? "xusmo-service";
    let wpStyleVariation: string | null = null;
    if (USE_MULTI_THEME && themePoolEntryId) {
      const themeEntry = await prisma.themePoolEntry.findUnique({
        where: { id: themePoolEntryId },
        select: { colors: true, fonts: true, borderRadius: true, buttonStyle: true, designPackage: true, styleVariation: true },
      });
      if (themeEntry) {
        wpStyleVariation = (themeEntry.styleVariation as string) || classifyDesignStyle({
          colors: themeEntry.colors as Record<string, string>,
          fonts: themeEntry.fonts as { heading: string },
          borderRadius: themeEntry.borderRadius as { medium?: string } | undefined,
          buttonStyle: themeEntry.buttonStyle as { textTransform?: string } | undefined,
          designPackage: themeEntry.designPackage as { homeLayout?: string[] } | null,
        });
      }
    }

    // Create Site record (set wpUrl for dev mode so the preview iframe works)
    const devWpUrl = process.env.WP_SITE_URL ?? "http://localhost:8088";
    const site = await prisma.site.create({
      data: {
        userId: blueprint.lead.userId,
        businessName: biz.name,
        archetype,
        industryId: blueprint.lead.industryId,
        tier: "FREE",
        status: "STAGING",
        track: leadTrack,
        isEcommerce,
        pageLimit: limits.pageLimit,
        tenantId: membership?.tenantId ?? null,
        wpUrl: process.env.NODE_ENV === "production" ? null : devWpUrl,
        themePoolEntryId,
        wpTheme: USE_MULTI_THEME ? wpTheme : null,
        wpStyleVariation: USE_MULTI_THEME ? wpStyleVariation : null,
        // Store engine's React component JSON as source of truth
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        designDocument: engineDesignDocument as any ?? undefined,
      },
    });

    // Increment theme usage count
    if (themePoolEntryId) {
      await prisma.themePoolEntry.update({
        where: { id: themePoolEntryId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Create Page records with BOTH structured content (studio editor)
    // AND Gutenberg HTML content (WordPress rendering)
    for (let i = 0; i < bpPages.length; i++) {
      const bpPage = bpPages[i];
      const structured = generateDevPageContent(
        bpPage, biz, services, story, testimonials, faqs, team,
        contactPrefs, seoData, goals,
      );

      await prisma.page.create({
        data: {
          siteId: site.id,
          slug: bpPage.slug,
          title: bpPage.title,
          isRequired: bpPage.isRequired,
          sortOrder: i,
          content: bpPage.content ?? null,
          blocks: bpPage.blocks as unknown as undefined,
          heroHeadline: structured.heroHeadline,
          heroSubheadline: structured.heroSubheadline,
          ctaLabel: structured.ctaLabel,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bodyContent: structured.bodyContent as any,
          metaTitle: structured.metaTitle,
          metaDesc: structured.metaDesc,
        },
      });
    }

    console.log("[dev-pipeline] Stage 2 complete: Site + pages created.");

    // =====================================================================
    // Stage 3: WordPress Provisioning (non-fatal)
    // SKIPPED for engine builds — engine sites use React component preview
    // and only provision WordPress at publish time.
    // =====================================================================
    let wpUrl: string | null = null;
    let wpAdminUrl: string | null = null;
    let wpAdminUser: string | null = null;

    if (generatorType === "engine") {
      // Engine builds skip WP entirely — fast-track to completion
      console.log("[dev-pipeline] Stage 3: Skipped (engine build — no WP needed until publish).");
      await prisma.build.update({
        where: { id: buildId },
        data: { progress: 75 },
      });
    } else {

    try {
      console.log("[dev-pipeline] Stage 3: WordPress provisioning...");
      await prisma.build.update({
        where: { id: buildId },
        data: { progress: 50 },
      });

      // Multi-theme: spin up per-site container; Legacy: use shared WP instance
      let siteMetadata: Awaited<ReturnType<typeof cloneSite>>;
      if (USE_MULTI_THEME) {
        const port = allocatePort(site.id);
        const containerInfo = await createSiteContainer({
          siteId: site.id,
          theme: wpTheme,
          styleVariation: wpStyleVariation ?? undefined,
          port,
        });
        siteMetadata = {
          siteSlug: containerInfo.shortId,
          siteUrl: containerInfo.siteUrl,
          adminUrl: `${containerInfo.siteUrl}/wp-admin`,
          adminUser: "admin",
          adminPassword: "admin123",
        };
        // Store container info in Site record
        await prisma.site.update({
          where: { id: site.id },
          data: {
            wpContainerName: containerInfo.wpContainerName,
            wpCliContainer: containerInfo.cliContainerName,
            wpPort: containerInfo.port,
            wpDbName: containerInfo.dbName,
            wpUrl: containerInfo.siteUrl,
          },
        });
        console.log(`[dev-pipeline] Per-site container created: ${containerInfo.wpContainerName} on port ${port}`);

        // Re-verify WP-CLI is available (container may have restarted during provisioning)
        try {
          const wp = getExecutor(site.id);
          await wp.execute("--version", 10_000);
        } catch {
          console.log("[dev-pipeline] WP-CLI not accessible, reinstalling...");
          const { exec: execCmd } = await import("child_process");
          await new Promise<void>((res, rej) => {
            execCmd(
              `docker exec ${containerInfo.wpContainerName} bash -c "curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp"`,
              { timeout: 60_000 },
              (err) => err ? rej(err) : res()
            );
          });
          console.log("[dev-pipeline] WP-CLI reinstalled.");
        }

        // Wait for WordPress → MySQL connection to be ready (Coolify containers need time)
        const wpCheck = getExecutor(site.id);
        for (let dbAttempt = 0; dbAttempt < 12; dbAttempt++) {
          try {
            await wpCheck.execute("db check", 10_000);
            console.log("[dev-pipeline] WordPress DB connection verified.");
            break;
          } catch {
            if (dbAttempt < 11) {
              await new Promise((r) => setTimeout(r, 5000));
            } else {
              console.warn("[dev-pipeline] WordPress DB not reachable after 60s — continuing anyway.");
            }
          }
        }
      } else {
        siteMetadata = await cloneSite(blueprintId, biz.name);
      }
      wpUrl = siteMetadata.siteUrl;
      wpAdminUrl = siteMetadata.adminUrl;
      wpAdminUser = siteMetadata.adminUser;

      // Update WP site settings
      const multiSiteId = USE_MULTI_THEME ? site.id : undefined;
      await updateSiteSettings(siteMetadata.siteSlug, {
        title: biz.name,
        tagline: biz.tagline,
      }, multiSiteId);

      // Inject Gutenberg HTML content into WordPress pages
      const pagesToCreate: PageToCreate[] = bpPages
        .filter((p) => p.content)
        .map((p) => ({
          slug: p.slug,
          title: p.title,
          content: p.content!,
        }));

      let wpPageIds = new Map<string, number>();
      if (pagesToCreate.length > 0) {
        wpPageIds = await injectContent(siteMetadata.siteSlug, pagesToCreate, multiSiteId);
        await createMenu(siteMetadata.siteSlug, wpPageIds, multiSiteId);
        await createBlockNavigation(siteMetadata.siteSlug, wpPageIds, multiSiteId);

        // Update Page records with WordPress post IDs
        for (const [slug, wpPostId] of wpPageIds) {
          await prisma.page.updateMany({
            where: { siteId: site.id, slug },
            data: { wpPostId },
          });
        }
      }

      // Set pretty permalinks (so navigation links work as /about/ not ?page_id=10)
      const wp = USE_MULTI_THEME ? getExecutor(site.id) : getExecutor();
      try {
        await wp.execute('rewrite structure "/%postname%/" --hard');
        await wp.execute("rewrite flush --hard");
        console.log("[dev-pipeline] Pretty permalinks set.");
      } catch (permalinkErr) {
        console.warn("[dev-pipeline] Permalink setup failed (non-fatal):", permalinkErr);
      }

      // Install Contact Form 7 and inject form into contact page
      try {
        await wp.execute("plugin install contact-form-7 --activate", 60000);
        console.log("[dev-pipeline] Contact Form 7 installed.");

        // Create a contact form with business email as recipient
        const recipientEmail = biz.email || "admin@example.com";
        const cf7Php = `<?php
$form_content = '<label> Your Name' . "\\n" . '    [text* your-name autocomplete:name] </label>' . "\\n\\n"
  . '<label> Your Email' . "\\n" . '    [email* your-email autocomplete:email] </label>' . "\\n\\n"
  . '<label> Phone' . "\\n" . '    [tel your-phone autocomplete:tel] </label>' . "\\n\\n"
  . '<label> Your Message' . "\\n" . '    [textarea your-message] </label>' . "\\n\\n"
  . '[submit "Send Message"]';
$props = array(
  'title' => 'Contact Form',
  'form' => $form_content,
  'mail' => array(
    'subject' => '${biz.name} Website Contact: [your-name]',
    'sender' => '${biz.name} <wordpress@localhost>',
    'recipient' => '${recipientEmail}',
    'body' => 'From: [your-name]' . "\\n" . 'Email: [your-email]' . "\\n" . 'Phone: [your-phone]' . "\\n\\n" . '[your-message]',
    'additional_headers' => 'Reply-To: [your-email]',
    'attachments' => '',
    'use_html' => false,
    'exclude_blank' => false,
  ),
);
$cf7 = WPCF7_ContactForm::get_template($props);
$cf7->set_properties($props);
$cf7->save();
echo $cf7->id();
`;
        await wp.writeFile("/tmp/xusmo-cf7-create.php", cf7Php);
        const cf7IdStr = await wp.execute('eval "include(\\"/tmp/xusmo-cf7-create.php\\");"');
        const cf7Id = parseInt(cf7IdStr.trim(), 10);

        if (!isNaN(cf7Id)) {
          // Inject the CF7 shortcode into the contact page content
          const contactPageId = wpPageIds.get("contact");
          if (contactPageId) {
            // Replace CF7 shortcode placeholder (without id) with one that includes the real id
            const contactContent = await wp.execute(`post get ${contactPageId} --field=post_content`);
            const finalContact = contactContent.replace(
              /\[contact-form-7\s+title="Contact Form"\]/g,
              `[contact-form-7 id="${cf7Id}" title="Contact Form"]`
            );
            await wp.writeFile("/tmp/xusmo-contact-updated.html", finalContact);
            await wp.execute(
              `eval "wp_update_post(['ID' => ${contactPageId}, 'post_content' => file_get_contents('/tmp/xusmo-contact-updated.html')]);"`
            );
            console.log(`[dev-pipeline] CF7 form (ID ${cf7Id}) injected into contact page.`);
          }
        }
      } catch (cf7Err) {
        console.warn("[dev-pipeline] Contact Form 7 setup failed (non-fatal):", cf7Err);
      }

      // Install & configure WooCommerce for COMMERCE archetype sites
      if (archetype === "COMMERCE") {
        try {
          await wp.execute("plugin install woocommerce --activate", 120000);
          console.log("[dev-pipeline] WooCommerce installed and activated.");

          // ---------------------------------------------------------------
          // B3: Create WooCommerce standard pages & configure store settings
          // ---------------------------------------------------------------

          // Create required WC pages if they don't already exist
          const wcPages = [
            { slug: "cart", title: "Cart", content: "<!-- wp:shortcode -->[woocommerce_cart]<!-- /wp:shortcode -->" },
            { slug: "checkout", title: "Checkout", content: "<!-- wp:shortcode -->[woocommerce_checkout]<!-- /wp:shortcode -->" },
            { slug: "my-account", title: "My Account", content: "<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->" },
          ];

          for (const pg of wcPages) {
            try {
              const existingId = await wp.execute(
                `eval "\\$p = get_page_by_path('${pg.slug}'); echo \\$p ? \\$p->ID : 0;"`
              );
              if (parseInt(existingId.trim(), 10) > 0) {
                console.log(`[dev-pipeline] WC page "${pg.title}" already exists (ID ${existingId.trim()}).`);
                continue;
              }
              await wp.writeFile("/tmp/xusmo-wc-page.html", pg.content);
              const newId = await wp.execute(
                `post create --post_type=page --post_title="${pg.title}" --post_name="${pg.slug}" --post_status=publish --porcelain`
              );
              const pageId = parseInt(newId.trim(), 10);
              if (!isNaN(pageId)) {
                await wp.execute(
                  `eval "wp_update_post(['ID' => ${pageId}, 'post_content' => file_get_contents('/tmp/xusmo-wc-page.html')]);"`
                );
              }
              console.log(`[dev-pipeline] WC page "${pg.title}" created (ID ${newId.trim()}).`);
            } catch (pgErr) {
              console.warn(`[dev-pipeline] Failed to create WC page "${pg.title}" (non-fatal):`, pgErr);
            }
          }

          // Point WooCommerce options to the correct page IDs
          try {
            await wp.execute(
              `eval "` +
              `\\$shop = get_page_by_path('shop'); ` +
              `\\$cart = get_page_by_path('cart'); ` +
              `\\$checkout = get_page_by_path('checkout'); ` +
              `\\$account = get_page_by_path('my-account'); ` +
              `if(\\$shop) update_option('woocommerce_shop_page_id', \\$shop->ID); ` +
              `if(\\$cart) update_option('woocommerce_cart_page_id', \\$cart->ID); ` +
              `if(\\$checkout) update_option('woocommerce_checkout_page_id', \\$checkout->ID); ` +
              `if(\\$account) update_option('woocommerce_myaccount_page_id', \\$account->ID);"`
            );
            console.log("[dev-pipeline] WooCommerce page options configured.");
          } catch (optErr) {
            console.warn("[dev-pipeline] WC page options failed (non-fatal):", optErr);
          }

          // Store settings from blueprint business info
          const wcSettings: Record<string, string> = {
            woocommerce_currency: "USD",
            woocommerce_default_country: "US",
            woocommerce_calc_taxes: "no",
            woocommerce_enable_reviews: "yes",
            woocommerce_catalog_columns: "4",
            woocommerce_catalog_rows: "3",
          };
          if (biz.location) {
            wcSettings.woocommerce_store_address = biz.location;
            // Try to extract city from location (e.g. "123 Main St, Austin, TX 78701")
            const parts = biz.location.split(",").map((p: string) => p.trim());
            if (parts.length >= 2) {
              wcSettings.woocommerce_store_city = parts[1] || "";
            }
          }
          for (const [key, val] of Object.entries(wcSettings)) {
            try {
              await wp.writeFile("/tmp/xusmo-wc-opt.txt", val);
              await wp.execute(
                `eval "update_option('${key}', trim(file_get_contents('/tmp/xusmo-wc-opt.txt')));"`
              );
            } catch {
              // Non-fatal — individual option failure
            }
          }
          console.log("[dev-pipeline] WooCommerce store settings configured.");

          // ---------------------------------------------------------------
          // B4: Seed sample products from interview data
          // ---------------------------------------------------------------
          const rawAnswers = (blueprint.lead.rawAnswers as Record<string, unknown>) ?? {};
          const sampleProducts = Array.isArray(rawAnswers.sample_products)
            ? (rawAnswers.sample_products as Array<{ name?: string; price?: string; description?: string }>)
            : [];

          // Use interview products or fall back to placeholders
          const productsToCreate = sampleProducts.length > 0
            ? sampleProducts
            : [
                { name: "Sample Product 1", price: "$29.99", description: `Quality product from ${biz.name}.` },
                { name: "Sample Product 2", price: "$49.99", description: `Popular choice at ${biz.name}.` },
                { name: "Sample Product 3", price: "$79.99", description: `Premium offering from ${biz.name}.` },
              ];

          let productsCreated = 0;
          for (const prod of productsToCreate) {
            try {
              const prodName = prod.name || "Product";
              // Sanitize price: strip $ and , — keep numeric value
              const rawPrice = (prod.price || "0").replace(/[$,]/g, "").trim();
              const price = parseFloat(rawPrice) > 0 ? rawPrice : "0.00";
              const desc = prod.description || "";

              // Use writeFile for name + description to avoid shell quoting issues (user input)
              await wp.writeFile("/tmp/xusmo-prod-name.txt", prodName);
              if (desc) {
                await wp.writeFile("/tmp/xusmo-prod-desc.txt", desc);
              }

              const prodIdStr = await wp.execute(
                `eval "` +
                `\\$name = trim(file_get_contents('/tmp/xusmo-prod-name.txt')); ` +
                `\\$p = new WC_Product_Simple(); ` +
                `\\$p->set_name(\\$name); ` +
                `\\$p->set_regular_price('${price}'); ` +
                `\\$p->set_status('publish'); ` +
                `\\$id = \\$p->save(); ` +
                `echo \\$id;"`,
                30000
              );
              const prodId = parseInt(prodIdStr.trim(), 10);
              if (!isNaN(prodId) && desc) {
                await wp.execute(
                  `eval "wp_update_post(['ID' => ${prodId}, 'post_excerpt' => file_get_contents('/tmp/xusmo-prod-desc.txt')]);"`
                );
              }
              productsCreated++;
            } catch (prodErr) {
              console.warn(`[dev-pipeline] Failed to create product "${prod.name}" (non-fatal):`, prodErr);
            }
          }
          console.log(`[dev-pipeline] ${productsCreated} WooCommerce products created.`);

          // Create product categories from interview data
          const productCategories = typeof rawAnswers.product_categories === "string"
            ? rawAnswers.product_categories
            : "";
          if (productCategories) {
            const cats = productCategories.split(/[,\n]/).map((c: string) => c.trim()).filter(Boolean);
            for (const cat of cats.slice(0, 10)) {
              try {
                // Use writeFile to avoid shell injection from user-supplied category names
                await wp.writeFile("/tmp/xusmo-wc-cat.txt", cat);
                await wp.execute(
                  `eval "` +
                  `\\$name = trim(file_get_contents('/tmp/xusmo-wc-cat.txt')); ` +
                  `wp_insert_term(\\$name, 'product_cat');"`
                );
              } catch {
                // Category may already exist — non-fatal
              }
            }
            if (cats.length > 0) {
              console.log(`[dev-pipeline] ${Math.min(cats.length, 10)} product categories created.`);
            }
          }

          // Add Cart & My Account links to the WP navigation
          try {
            const navIdStr = await wp.execute(
              `eval "\\$navs = get_posts(['post_type'=>'wp_navigation','numberposts'=>1]); echo \\$navs ? \\$navs[0]->ID : 0;"`
            );
            const navId = parseInt(navIdStr.trim(), 10);
            if (navId > 0) {
              const navContent = await wp.execute(`post get ${navId} --field=post_content`);
              const cartLink = `<!-- wp:navigation-link {"label":"Cart","url":"/cart/","kind":"custom","isTopLevelLink":true} /-->`;
              const accountLink = `<!-- wp:navigation-link {"label":"My Account","url":"/my-account/","kind":"custom","isTopLevelLink":true} /-->`;
              const updatedNav = navContent.trim() + "\n" + cartLink + "\n" + accountLink;
              await wp.writeFile("/tmp/xusmo-wc-nav.html", updatedNav);
              await wp.execute(
                `eval "wp_update_post(['ID' => ${navId}, 'post_content' => file_get_contents('/tmp/xusmo-wc-nav.html')]);"`
              );
              console.log("[dev-pipeline] Cart & My Account added to navigation.");
            }
          } catch (navErr) {
            console.warn("[dev-pipeline] WC nav links failed (non-fatal):", navErr);
          }

        } catch (wooErr) {
          console.warn("[dev-pipeline] WooCommerce setup failed (non-fatal):", wooErr);
        }
      }

      // Inject design package header/footer variants if theme has one
      try {
        const themeEntry = site.themePoolEntryId
          ? await prisma.themePoolEntry.findUnique({
              where: { id: site.themePoolEntryId },
              select: { designPackage: true },
            })
          : null;

        const dp = themeEntry?.designPackage as Record<string, unknown> | null;
        if (dp?.headerVariant && typeof dp.headerVariant === "string") {
          await injectTemplatePart(siteMetadata.siteSlug, "header", dp.headerVariant, "Header", multiSiteId, USE_MULTI_THEME ? wpTheme : undefined);
          console.log(`[dev-pipeline] Header variant "${dp.headerVariant}" injected.`);
        }
        if (dp?.footerVariant && typeof dp.footerVariant === "string") {
          await injectTemplatePart(siteMetadata.siteSlug, "footer", dp.footerVariant, "Footer", multiSiteId, USE_MULTI_THEME ? wpTheme : undefined);
          console.log(`[dev-pipeline] Footer variant "${dp.footerVariant}" injected.`);
        }
      } catch (dpErr) {
        console.warn("[dev-pipeline] Design package header/footer injection failed (non-fatal):", dpErr);
      }

      // Customize footer with real business data (AFTER design package injection
      // so business data overwrites the generic design package footer)
      const bpSocial = (blueprint.socialMedia as unknown as { facebook?: string; instagram?: string }) ?? {};
      const bpHours = (blueprint.businessHours as string) ?? "";
      try {
        await customizeFooter(siteMetadata.siteSlug, {
          name: biz.name,
          address: biz.location || undefined,
          phone: biz.phone || undefined,
          email: biz.email || undefined,
          tagline: biz.tagline || undefined,
          socialMedia: (bpSocial.facebook || bpSocial.instagram) ? bpSocial : undefined,
          businessHours: bpHours || undefined,
        }, multiSiteId, USE_MULTI_THEME ? wpTheme : undefined);
      } catch (footerErr) {
        console.warn("[dev-pipeline] Footer customization failed (non-fatal):", footerErr);
      }

      // Image Agent — search Pexels for ALL site images (non-fatal)
      try {
        const { processImageJob } = await import("@/agents/image.agent");
        const imagePlan = await processImageJob(buildId, blueprintId);

        if (imagePlan) {
          // Upload per-page hero images — each page gets a distinct image
          let heroPageCount = 0;
          for (const [slug, pageId] of wpPageIds) {
            // Determine which image to use: page-specific hero if available, else main hero
            const pageHero = imagePlan.pageHeroes[slug];
            const heroImg = pageHero || imagePlan.hero;
            if (!heroImg) continue;

            try {
              const uploaded = await uploadHeroImage(
                siteMetadata.siteSlug,
                heroImg.url,
                heroImg.alt,
                slug,
                multiSiteId
              );
              if (uploaded) {
                await setHeroCoverImage(siteMetadata.siteSlug, pageId, uploaded.wpUrl, uploaded.attachmentId, heroImg.alt, multiSiteId);
                heroPageCount++;
              }
            } catch {
              // Page may not have a wp:cover block — that's fine
            }
          }
          if (heroPageCount > 0) {
            console.log(`[dev-pipeline] Hero images set on ${heroPageCount} pages (${Object.keys(imagePlan.pageHeroes).length} unique + main hero fallback).`);
          }

          // Upload extra images for different pages (About, Services, etc.)
          const { uploadSiteImage } = await import("@/lib/wordpress/content");
          const contentImageUrls: string[] = [];

          for (const img of imagePlan.extras) {
            const uploaded = await uploadSiteImage(siteMetadata.siteSlug, img.url, img.slot, img.alt, multiSiteId);
            if (uploaded) contentImageUrls.push(uploaded.wpUrl);
          }

          // Upload service images to WordPress media library
          for (const img of imagePlan.services) {
            const uploaded = await uploadSiteImage(siteMetadata.siteSlug, img.url, img.slot, img.alt, multiSiteId);
            if (uploaded) contentImageUrls.push(uploaded.wpUrl);
          }

          // Upload gallery images
          for (const img of imagePlan.gallery) {
            const uploaded = await uploadSiteImage(siteMetadata.siteSlug, img.url, img.slot, img.alt, multiSiteId);
            if (uploaded) contentImageUrls.push(uploaded.wpUrl);
          }

          // Upload team member headshots and inject into page content
          const teamUrls: string[] = [];
          for (const img of imagePlan.team) {
            const uploaded = await uploadSiteImage(siteMetadata.siteSlug, img.url, img.slot, img.alt, multiSiteId);
            if (uploaded) teamUrls.push(uploaded.wpUrl);
          }

          // Inject team photos into about page (replace empty src="" alt="Team member" images)
          if (teamUrls.length > 0) {
            const aboutPageId = wpPageIds.get("about");
            if (aboutPageId) {
              try {
                const aboutContent = await wp.execute(`post get ${aboutPageId} --field=post_content`);
                let teamIdx = 0;
                const updatedAbout = aboutContent.replace(
                  /(<img[^>]*) src="" alt="Team member"/g,
                  (match: string, prefix: string) => {
                    if (teamIdx >= teamUrls.length) return match;
                    const url = teamUrls[teamIdx++];
                    return `${prefix} src="${url}" alt="Team member"`;
                  }
                );
                if (teamIdx > 0) {
                  await wp.writeFile("/tmp/xusmo-about-team.html", updatedAbout);
                  await wp.execute(
                    `eval "wp_update_post(['ID' => ${aboutPageId}, 'post_content' => file_get_contents('/tmp/xusmo-about-team.html')]);"`
                  );
                  console.log(`[dev-pipeline] Team photos injected: ${teamIdx} headshots on about page.`);
                }
              } catch (teamErr) {
                console.warn("[dev-pipeline] Team photo injection failed (non-fatal):", teamErr);
              }
            }
          }

          // Upload testimonial avatars
          for (const img of imagePlan.testimonialAvatars) {
            await uploadSiteImage(siteMetadata.siteSlug, img.url, img.slot, img.alt, multiSiteId);
          }

          // Inject content images into pages — replace remaining src="" with uploaded images
          if (contentImageUrls.length > 0) {
            let contentImgIdx = 0;
            for (const [slug, pageId] of wpPageIds) {
              if (contentImgIdx >= contentImageUrls.length) break;
              try {
                const pageContent = await wp.execute(`post get ${pageId} --field=post_content`);
                // Find all empty src="" in non-team img tags
                const emptySrcPattern = /(<img[^>]*) src="(?:https?:\/\/[^"]*placeholder[^"]*|)"(?! alt="Team member")/g;
                if (!emptySrcPattern.test(pageContent)) {
                  // Also check for simple src=""
                  const simpleSrc = /src=""\s+(?!alt="Team member")/;
                  if (!simpleSrc.test(pageContent)) continue;
                }

                let injected = 0;
                const updatedContent = pageContent.replace(
                  /(<img[^>]*?) src=""([^>]*?)(?<! alt="Team member")(\/?>)/g,
                  (match: string, pre: string, mid: string, close: string) => {
                    // Skip team member images (already handled above)
                    if (mid.includes('alt="Team member"') || pre.includes('alt="Team member"')) return match;
                    if (contentImgIdx >= contentImageUrls.length) return match;
                    const url = contentImageUrls[contentImgIdx++];
                    injected++;
                    return `${pre} src="${url}"${mid}${close}`;
                  }
                );

                if (injected > 0) {
                  await wp.writeFile("/tmp/xusmo-page-imgs.html", updatedContent);
                  await wp.execute(
                    `eval "wp_update_post(['ID' => ${pageId}, 'post_content' => file_get_contents('/tmp/xusmo-page-imgs.html')]);"`
                  );
                  console.log(`[dev-pipeline] ${injected} content images injected on page "${slug}".`);
                }
              } catch {
                // Individual page image injection failure is non-fatal
              }
            }
          }

          const totalUploaded =
            (imagePlan.hero ? 1 : 0) +
            imagePlan.services.length +
            imagePlan.gallery.length +
            imagePlan.team.length +
            imagePlan.testimonialAvatars.length +
            imagePlan.extras.length;
          console.log(`[dev-pipeline] Image Agent: ${totalUploaded} images uploaded to WordPress.`);
        }
      } catch (imgErr) {
        console.warn("[dev-pipeline] Image Agent failed (non-fatal):", imgErr);
      }

      // Update Site with WP URLs
      await prisma.site.update({
        where: { id: site.id },
        data: { wpUrl, wpAdminUrl, wpAdminUser },
      });

      console.log("[dev-pipeline] Stage 3 complete: WordPress provisioned.");
    } catch (wpErr) {
      console.warn(
        "[dev-pipeline] Stage 3 skipped (non-fatal):",
        wpErr instanceof Error ? wpErr.message : wpErr
      );
    }

    // =====================================================================
    // Stage 3b: Logo Agent (non-fatal)
    // Generates a professional logo if the client doesn't have one
    // =====================================================================
    try {
      const { processLogoJob } = await import("@/agents/logo.agent");
      const logoResult = await processLogoJob(site.id, blueprintId);
      if (logoResult) {
        console.log("[dev-pipeline] Logo generated successfully.");
      }
    } catch (logoErr) {
      console.warn("[dev-pipeline] Logo Agent failed (non-fatal):", logoErr);
    }

    // =====================================================================
    // Stage 3c: Auto-Blogger — Seed 3 blog posts (non-fatal)
    // Creates initial blog content for SEO and content richness
    // =====================================================================
    try {
      const { generateBlogIdeas, generateBlogPost } = await import("@/agents/autoblogger.agent");
      const industryName = blueprint.lead.industryName || "business";

      const ideas = await generateBlogIdeas(industryName, biz.name, 3);
      const wpExec = USE_MULTI_THEME ? getExecutor(site.id) : getExecutor();
      let postsCreated = 0;

      for (const idea of ideas.slice(0, 3)) {
        try {
          const post = await generateBlogPost(idea, industryName, biz.name);
          if (post) {
            // Create WP post
            const postIdStr = await wpExec.execute(
              `post create --post_type=post --post_title="${idea.title.replace(/"/g, '\\"')}" --post_status=publish --porcelain`
            );
            const postId = parseInt(postIdStr.trim(), 10);
            if (!isNaN(postId) && post.content) {
              const htmlContent = typeof post.content === "string"
                ? post.content
                : `<!-- wp:paragraph --><p>${post.excerpt}</p><!-- /wp:paragraph -->`;
              await wpExec.writeFile("/tmp/xusmo-blog-post.html", htmlContent);
              await wpExec.execute(
                `eval "wp_update_post(['ID' => ${postId}, 'post_content' => file_get_contents('/tmp/xusmo-blog-post.html')]);"`
              );
              postsCreated++;
            }
          }
        } catch {
          // Individual post failure is fine
        }
      }

      if (postsCreated > 0) {
        console.log(`[dev-pipeline] Auto-Blogger: ${postsCreated} blog posts seeded.`);
      }
    } catch (blogErr) {
      console.warn("[dev-pipeline] Auto-Blogger failed (non-fatal):", blogErr);
    }

    // =====================================================================
    // Stage 3d: SEO Meta Descriptions (non-fatal)
    // Sets Yoast meta title + meta description on every WP page
    // =====================================================================
    try {
      const wpSeo = USE_MULTI_THEME ? getExecutor(site.id) : getExecutor();
      const seoPages = await prisma.page.findMany({
        where: { siteId: site.id },
        select: { slug: true, title: true, wpPostId: true },
      });

      const rawSeoDesc =
        (blueprint.seoData as { metaDescription?: string } | null)?.metaDescription ||
        biz.description?.slice(0, 160) ||
        biz.tagline;
      // Clean up malformed location patterns like "Name in . Name sells..."
      const seoDescription = rawSeoDesc
        ?.replace(/\s+in\s*\.\s*/g, ". ")
        .replace(/\s+in\s*,\s*/g, ", ")
        .replace(/\.\s*\./g, ".")
        .trim();

      let seoCount = 0;
      for (const pg of seoPages) {
        if (!pg.wpPostId) continue;
        try {
          const metaTitle = `${pg.title} | ${biz.name}`;
          let metaDesc = "";
          if (pg.slug === "home") {
            metaDesc = seoDescription || `${biz.name} — ${biz.tagline}`;
          } else if (pg.slug === "contact") {
            metaDesc = `Contact ${biz.name}. Get in touch for a free quote or consultation.`;
          } else if (pg.slug === "services" || pg.slug === "shop") {
            metaDesc = `${archetype === "COMMERCE" ? "Shop products" : "Professional services"} from ${biz.name}. Quality you can trust.`;
          } else if (pg.slug === "about") {
            metaDesc = `Learn about ${biz.name}. ${(biz.description || biz.tagline).slice(0, 100)}`;
          } else if (pg.slug === "faq") {
            metaDesc = `Frequently asked questions about ${biz.name}. Find answers to common questions.`;
          } else {
            metaDesc = `${pg.title} — ${biz.name}`;
          }

          const safeTitle = metaTitle.replace(/"/g, '\\"');
          const safeDesc = metaDesc.slice(0, 160).replace(/"/g, '\\"');
          await wpSeo.execute(
            `post meta update ${pg.wpPostId} _yoast_wpseo_title "${safeTitle}"`
          );
          await wpSeo.execute(
            `post meta update ${pg.wpPostId} _yoast_wpseo_metadesc "${safeDesc}"`
          );
          seoCount++;
        } catch {
          // Individual page SEO failure is non-fatal
        }
      }
      if (seoCount > 0) {
        console.log(`[dev-pipeline] Yoast SEO meta set on ${seoCount} pages.`);
      }
    } catch (seoErr) {
      console.warn("[dev-pipeline] SEO meta injection failed (non-fatal):", seoErr);
    }

    // =====================================================================
    // Stage 4: Apply Theme (non-fatal)
    // Writes archetype theme.json + Google Fonts + CSS variables
    // =====================================================================
    try {
      await prisma.build.update({
        where: { id: buildId },
        data: { progress: 75 },
      });

      const preset = getThemePreset(archetype as Archetype);
      const designPrefs = blueprint.designPrefs as unknown as {
        primaryColors?: string[];
      } | null;
      const finalPreset = designPrefs?.primaryColors?.length
        ? mergeUserColors(preset, designPrefs.primaryColors)
        : preset;

      const themeJson = buildThemeJson(finalPreset);
      const themeJsonStr = JSON.stringify(themeJson, null, "\t");
      const wp = USE_MULTI_THEME ? getExecutor(site.id) : getExecutor();

      const themeDir = await wp.execute(`eval "echo get_stylesheet_directory();"`);
      await wp.writeFile(`${themeDir}/theme.json`, themeJsonStr);

      await wp.writeFile("/tmp/xusmo-fonts-url.txt", finalPreset.googleFontsUrl);
      await wp.execute(
        `eval "update_option('xusmo_google_fonts_url', trim(file_get_contents('/tmp/xusmo-fonts-url.txt')));"`
      );

      const customCss = `:root {
  --sf-border-radius-sm: ${finalPreset.borderRadius.small};
  --sf-border-radius-md: ${finalPreset.borderRadius.medium};
  --sf-border-radius-lg: ${finalPreset.borderRadius.large};
  --sf-border-radius-pill: ${finalPreset.borderRadius.pill};
  --sf-section-padding: ${finalPreset.sectionPadding};
}

/* Card polish — subtle shadow + hover lift */
.wp-block-group[style*="border-radius"] {
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.wp-block-group[style*="border-radius"]:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* Button hover */
.wp-block-button__link {
  transition: opacity 0.2s ease, transform 0.15s ease;
}
.wp-block-button__link:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== Header / Navigation ===== */

/* Sticky header with blur */
.xusmo-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Navigation links — clean hover effect */
.wp-block-navigation a {
  transition: color 0.2s ease, opacity 0.2s ease;
  position: relative;
  padding: 0.35rem 0;
  text-decoration: none !important;
}

/* Animated underline on hover */
.wp-block-navigation .wp-block-navigation-item a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--wp--preset--color--primary);
  transition: width 0.25s ease;
}
.wp-block-navigation .wp-block-navigation-item a:hover::after {
  width: 100%;
}

/* Nav hover color */
.wp-block-navigation a:hover {
  color: var(--wp--preset--color--primary) !important;
}

/* Mobile overlay polish */
.wp-block-navigation__responsive-container.is-menu-open {
  animation: xusmoFadeIn 0.2s ease;
}
@keyframes xusmoFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ===== Hero cover image polish ===== */

/* Better text readability over background images — dark overlay for white text */
.wp-block-cover .wp-block-cover__background {
  opacity: 0.65 !important;
}

/* Gradient overlay for text contrast at bottom */
.wp-block-cover[style*="background-image"]::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(transparent, rgba(0,0,0,0.25));
  pointer-events: none;
  z-index: 0;
}

/* Footer link styling */
.wp-block-group.has-surface-background-color a {
  transition: color 0.2s ease;
}

/* Smooth cover block */
.wp-block-cover {
  transition: min-height 0.3s ease;
}

/* Better separator styling */
.wp-block-separator.is-style-dots::before {
  font-size: 0.5em;
}

/* ===== Typography Hierarchy ===== */
.wp-block-group > .wp-block-heading:first-child { letter-spacing: -0.01em; }
.wp-block-details summary { font-size: 1rem; font-weight: 600; }
.wp-block-group > .wp-block-heading + p.has-text-muted-color {
  max-width: 600px; margin-left: auto; margin-right: auto;
}

/* ===== CTA Contrast on Primary Background ===== */
.wp-block-group.has-primary-background-color .wp-block-heading { color: #ffffff !important; }
.wp-block-group.has-primary-background-color p { color: rgba(255,255,255,0.9) !important; }
.wp-block-group.has-primary-background-color .wp-block-button__link {
  color: var(--wp--preset--color--primary) !important;
  background: var(--wp--preset--color--background) !important;
}

/* ===== Team Member Placeholder Avatars ===== */
.wp-block-image img[src=""] { display: none; }
.wp-block-image:has(img[src=""]) {
  background: linear-gradient(135deg, var(--wp--preset--color--surface, #f5f5f5), var(--wp--preset--color--border, #e0e0e0));
  border-radius: 100%;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}`;
      await wp.writeFile("/tmp/xusmo-custom-css.txt", customCss);
      await wp.execute(
        `eval "update_option('xusmo_custom_css', file_get_contents('/tmp/xusmo-custom-css.txt'));"`
      );

      console.log(
        `[dev-pipeline] Stage 4 complete: Theme applied (${archetype}).`
      );
    } catch (themeErr) {
      console.warn(
        "[dev-pipeline] Stage 4 skipped (non-fatal):",
        themeErr instanceof Error ? themeErr.message : themeErr
      );
    }

    } // end of: if (generatorType !== "engine") — WP provisioning block

    // =====================================================================
    // Stage 5: Golden Image Lineage + Mark Complete
    // =====================================================================
    const activeGI = await prisma.goldenImage.findFirst({
      where: { archetype, status: "ACTIVE" },
    });

    await prisma.site.update({
      where: { id: site.id },
      data: {
        goldenImageVersion:
          activeGI?.version ?? `GI-${archetype}-UNKNOWN`,
      },
    });

    // Create a builder agentLog for tracking
    await prisma.agentLog.create({
      data: {
        buildId,
        agentName: "builder",
        status: "COMPLETED",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: { buildId, blueprintId } as any,
        output: {
          siteId: site.id,
          siteUrl: wpUrl,
          pagesCreated: bpPages.length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        durationMs: 0,
        completedAt: new Date(),
      },
    });

    // Mark build as PREVIEW_READY (clear any stale failureReason from parallel workers)
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status: "PREVIEW_READY",
        siteId: site.id,
        progress: 100,
        currentAgent: null,
        completedAt: new Date(),
        goldenImageId: activeGI?.version ?? null,
        failureReason: null,
        failedAt: null,
      },
    });

    console.log(
      `[dev-pipeline] Build ${buildId} complete! Site ${site.id} ready for preview.`
    );
  } catch (err) {
    console.error("[dev-pipeline] Pipeline failed:", err);
    try {
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: "FAILED",
          failureReason:
            err instanceof Error ? err.message : "Dev pipeline failed",
          failedAt: new Date(),
        },
      });
    } catch {
      console.error("[dev-pipeline] Failed to update build status to FAILED");
    }
  }
}

// ---------------------------------------------------------------------------
// Agent completion helper
// ---------------------------------------------------------------------------

export async function completeAgent(
  buildId: string,
  blueprintId: string,
  agentName: string
) {
  try {
    // Queue next agent in pipeline
    const nextAgent = await queueNextAgent(buildId, blueprintId, agentName);

    if (nextAgent) {
      console.log(`[pipeline] ${agentName} done → queuing ${nextAgent}`);
    } else {
      console.log(`[pipeline] ${agentName} done → pipeline complete`);
    }

    return nextAgent;
  } catch (err) {
    // Non-fatal: in dev mode Redis may not be available or we may be
    // running agents synchronously without workers to pick up next jobs
    console.warn(
      `[pipeline] ${agentName} done — failed to queue next agent (non-fatal):`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
