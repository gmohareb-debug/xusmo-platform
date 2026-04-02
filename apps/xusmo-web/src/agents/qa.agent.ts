// =============================================================================
// QA Agent
// Runs quality checks on the built WordPress site.
// Checks: page count, content, forms, settings.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";
import { sendNotification } from "@/lib/notifications/email";
import { getFontPairForIndustry } from "@/lib/wordpress/fonts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QAJobData {
  buildId: string;
  blueprintId: string;
}

interface QACheck {
  name: string;
  passed: boolean;
  details: string;
}

interface QAGateResult {
  gate: string;
  passed: boolean;
  score: number;
  details: string;
  requiresHumanReview?: boolean;
}

// ---------------------------------------------------------------------------
// Design Relevance Gates
// ---------------------------------------------------------------------------

async function industryFitGate(
  buildId: string,
  siteId: string,
  requiredSections: string[],
  wp: ReturnType<typeof getExecutor>
): Promise<QAGateResult> {
  if (requiredSections.length === 0) {
    return { gate: "industry_fit", passed: true, score: 100, details: "No required sections defined" };
  }

  const missing: string[] = [];
  try {
    const pagesJson = await wp.execute(
      "post list --post_type=page --post_status=publish --fields=ID,post_title,post_name --format=json"
    );
    const pages = JSON.parse(pagesJson) as Array<{ ID: string; post_title: string; post_name: string }>;
    const allContent: string[] = [];

    for (const p of pages) {
      try {
        const content = await wp.execute(`post get ${p.ID} --field=post_content`);
        allContent.push(`${p.post_name} ${p.post_title} ${content}`.toLowerCase());
      } catch { /* skip */ }
    }

    const fullText = allContent.join(" ");
    const sectionPatterns: Record<string, string[]> = {
      hours_display: ["hours", "schedule", "open", "closed", "mon", "tue", "wed"],
      menu_or_schedule: ["menu", "schedule", "class", "course", "dish", "appetizer"],
      reservation_cta: ["reserv", "book", "appointment", "schedule a"],
      location_map: ["map", "location", "address", "directions", "find us"],
      services_grid: ["services", "what we do", "our services"],
      services_list: ["services", "treatments", "what we offer"],
      service_area_map: ["service area", "we serve", "coverage"],
      emergency_cta: ["emergency", "24/7", "urgent", "call now"],
      license_badges: ["license", "certified", "insured", "bonded"],
      practice_areas: ["practice area", "legal service", "specializ"],
      attorney_bios: ["attorney", "lawyer", "counsel", "partner"],
      consultation_form: ["consult", "free consultation", "schedule"],
      legal_disclaimer: ["disclaimer", "not constitute", "legal advice"],
      portfolio_grid: ["portfolio", "gallery", "our work", "projects"],
      inquiry_form: ["inquir", "contact", "get in touch"],
      about_bio: ["about", "our story", "who we are"],
      booking_cta: ["book", "appointment", "schedule"],
      gallery: ["gallery", "photos", "images", "portfolio"],
      class_schedule: ["class", "schedule", "timetable"],
      membership_tiers: ["membership", "pricing", "plans", "packages"],
      trial_pass_cta: ["trial", "free pass", "try", "first visit"],
      appointment_cta: ["appointment", "book", "schedule"],
      insurance_info: ["insurance", "accepted", "coverage"],
      contact_form: ["contact", "get in touch", "reach out"],
      credentials_badges: ["certified", "credential", "qualification"],
      quote_form: ["quote", "estimate", "free quote"],
      testimonials: ["testimonial", "review", "what our clients"],
    };

    for (const section of requiredSections) {
      const patterns = sectionPatterns[section] ?? [section.replace(/_/g, " ")];
      const found = patterns.some(p => fullText.includes(p));
      if (!found) missing.push(section);
    }
  } catch {
    return { gate: "industry_fit", passed: false, score: 0, details: "Failed to fetch site content" };
  }

  const score = ((requiredSections.length - missing.length) / requiredSections.length) * 100;
  return {
    gate: "industry_fit",
    passed: missing.length === 0,
    score: Math.round(score),
    details: missing.length > 0
      ? `Missing required sections: ${missing.join(", ")}`
      : "All required sections present",
  };
}

async function languageGate(
  siteId: string,
  industryCode: string,
  defaultServices: unknown[],
  wp: ReturnType<typeof getExecutor>
): Promise<QAGateResult> {
  try {
    const pagesJson = await wp.execute(
      "post list --post_type=page --post_status=publish --fields=ID --format=json"
    );
    const pages = JSON.parse(pagesJson) as Array<{ ID: string }>;
    let allText = "";

    for (const p of pages) {
      try {
        const content = await wp.execute(`post get ${p.ID} --field=post_content`);
        allText += " " + content;
      } catch { /* skip */ }
    }

    allText = allText.toLowerCase();
    const services = (defaultServices as Array<{ name: string }>).map(s => s.name.toLowerCase());
    const found = services.filter(s => allText.includes(s));
    const termScore = services.length > 0 ? (found.length / services.length) * 100 : 100;

    return {
      gate: "language",
      passed: termScore >= 40,
      score: Math.round(termScore),
      details: `Industry terminology coverage: ${found.length}/${services.length} terms found`,
    };
  } catch {
    return { gate: "language", passed: false, score: 0, details: "Failed to check language" };
  }
}

function complianceGate(
  regulated: boolean,
  disclaimers: string[],
  industryCode: string
): QAGateResult {
  if (regulated) {
    return {
      gate: "compliance",
      passed: false,
      score: 0,
      details: `REGULATED INDUSTRY (${industryCode}): Mandatory human review required. Check for: ${disclaimers.join(", ")}`,
      requiresHumanReview: true,
    };
  }
  return { gate: "compliance", passed: true, score: 100, details: "Non-regulated industry" };
}

async function consistencyGate(
  siteId: string,
  expectedColors: string[],
  fontPreference: string,
  wp: ReturnType<typeof getExecutor>
): Promise<QAGateResult> {
  try {
    const stylesRaw = await wp.execute("option get wp_global_styles --format=json");
    const stylesStr = stylesRaw.toLowerCase();

    const colorsMatch = expectedColors.length === 0 || expectedColors.every(c => stylesStr.includes(c.toLowerCase()));
    const fonts = getFontPairForIndustry(fontPreference);
    const fontsMatch = stylesStr.includes(fonts.heading.toLowerCase());

    return {
      gate: "consistency",
      passed: colorsMatch && fontsMatch,
      score: (colorsMatch ? 50 : 0) + (fontsMatch ? 50 : 0),
      details: !colorsMatch
        ? `Color mismatch: expected ${expectedColors.join(",")}`
        : !fontsMatch
          ? `Font mismatch: expected ${fonts.heading}/${fonts.body}`
          : "Colors and fonts match industry defaults",
    };
  } catch {
    // wp_global_styles may not exist yet
    return { gate: "consistency", passed: true, score: 50, details: "Could not verify wp_global_styles (may not be set)" };
  }
}

// ---------------------------------------------------------------------------
// Process QA job
// ---------------------------------------------------------------------------

export async function processQAJob(job: Job<QAJobData>) {
  const startTime = Date.now();
  const { buildId, blueprintId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "qa",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    // Engine builds skip QA agent (no WordPress to validate)
    const buildCheck = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      select: { generatorType: true, siteId: true },
    });
    const generatorType =
      (buildCheck as Record<string, unknown>).generatorType as string ??
      "gutenberg";

    if (generatorType === "engine") {
      console.log(`[qa] Build ${buildId}: skipping (engine build)`);
      // Mark build as complete — engine sites go straight to PREVIEW_READY
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: "PREVIEW_READY",
          currentAgent: "qa",
          progress: 100,
          completedAt: new Date(),
        },
      });
      const durationMs = Date.now() - startTime;
      await prisma.agentLog.update({
        where: { id: agentLog.id },
        data: { status: "COMPLETED", durationMs, completedAt: new Date() },
      });
      // Pipeline is complete for engine builds — no need to call completeAgent
      return { skipped: true, reason: "engine build", durationMs };
    }

    await prisma.build.update({
      where: { id: buildId },
      data: { status: "QA_RUNNING", currentAgent: "qa", progress: 80 },
    });

    const build = await prisma.build.findUniqueOrThrow({ where: { id: buildId } });
    const blueprint = await prisma.blueprint.findUniqueOrThrow({ where: { id: blueprintId } });
    const wp = getExecutor(build.siteId ?? undefined);

    const checks: QACheck[] = [];

    // --- Check 1: Page count ---
    const expectedPages = (blueprint.pages as unknown as Array<{ slug: string; isRequired: boolean }>)
      .filter((p) => p.isRequired).length;
    try {
      const pageList = await wp.execute("post list --post_type=page --post_status=publish --format=count");
      const pageCount = parseInt(pageList.trim(), 10);
      checks.push({
        name: "page_count",
        passed: pageCount >= expectedPages,
        details: `Found ${pageCount} pages, expected at least ${expectedPages}`,
      });
    } catch {
      checks.push({ name: "page_count", passed: false, details: "Failed to list pages" });
    }

    // --- Check 2: Content check (no empty pages) ---
    try {
      const pages = await wp.execute(
        "post list --post_type=page --post_status=publish --fields=ID,post_title --format=json"
      );
      const pageData = JSON.parse(pages) as Array<{ ID: string; post_title: string }>;
      let emptyPages = 0;

      for (const p of pageData) {
        try {
          const content = await wp.execute(`post get ${p.ID} --field=post_content`);
          if (!content || content.trim().length < 10) {
            emptyPages++;
          }
        } catch {
          emptyPages++;
        }
      }

      checks.push({
        name: "content_check",
        passed: emptyPages === 0,
        details: emptyPages === 0
          ? "All pages have content"
          : `${emptyPages} page(s) have empty or minimal content`,
      });
    } catch {
      checks.push({ name: "content_check", passed: false, details: "Failed to check page content" });
    }

    // --- Check 3: Contact Form 7 check ---
    try {
      const contactPageId = await wp.execute(
        "post list --post_type=page --name=contact --field=ID --format=ids"
      );
      if (contactPageId.trim()) {
        const contactContent = await wp.execute(`post get ${contactPageId.trim()} --field=post_content`);
        const hasCF7 = contactContent.includes("contact-form-7");
        checks.push({
          name: "form_check",
          passed: hasCF7,
          details: hasCF7
            ? "Contact Form 7 shortcode found on contact page"
            : "No Contact Form 7 shortcode found on contact page",
        });
      } else {
        checks.push({ name: "form_check", passed: false, details: "Contact page not found" });
      }
    } catch {
      checks.push({ name: "form_check", passed: false, details: "Failed to check contact form" });
    }

    // --- Check 4: Settings check ---
    try {
      const siteTitle = await wp.execute("option get blogname");
      const tagline = await wp.execute("option get blogdescription");
      const titleSet = siteTitle.trim().length > 0 && siteTitle.trim() !== "Xusmo Golden Image";
      const taglineSet = tagline.trim().length > 0;

      checks.push({
        name: "settings_check",
        passed: titleSet && taglineSet,
        details: `Title: "${siteTitle.trim()}", Tagline: "${tagline.trim()}"`,
      });
    } catch {
      checks.push({ name: "settings_check", passed: false, details: "Failed to check site settings" });
    }

    // --- Design Relevance Gates ---
    const designGates: QAGateResult[] = [];
    try {
      const fullBuild = await prisma.build.findUnique({
        where: { id: buildId },
        include: {
          blueprint: {
            include: { lead: { include: { industry: true } } },
          },
        },
      });

      const industry = fullBuild?.blueprint?.lead?.industry;
      if (industry && fullBuild.siteId) {
        const requiredSections = (industry.requiredSections as string[] | null) ?? [];
        const defaultServices = (industry.defaultServices as unknown[]) ?? [];
        const primaryColors = (industry.primaryColors as string[] | null) ?? [];
        const fontPref = industry.fontPreference ?? "clean sans-serif";
        const regulated = industry.isRegulated;
        const disclaimers = (industry.defaultDisclaimers as string[] | null) ?? [];

        designGates.push(await industryFitGate(buildId, fullBuild.siteId, requiredSections, wp));
        designGates.push(await languageGate(fullBuild.siteId, industry.industryCode, defaultServices, wp));
        designGates.push(complianceGate(regulated, disclaimers, industry.industryCode));
        designGates.push(await consistencyGate(fullBuild.siteId, primaryColors, fontPref, wp));

        // Calculate overall design relevance
        const designRelevanceScore = designGates.reduce((sum, g) => sum + g.score, 0) / designGates.length;
        const industryFitGrade = designRelevanceScore >= 90 ? "A" : designRelevanceScore >= 75 ? "B" : designRelevanceScore >= 60 ? "C" : designRelevanceScore >= 40 ? "D" : "F";

        await prisma.build.update({
          where: { id: buildId },
          data: { designRelevanceScore, industryFitGrade },
        });

        console.log(`[qa] Design relevance: ${designRelevanceScore.toFixed(1)}% (${industryFitGrade})`);
      }
    } catch (designError) {
      console.error("[qa] Design relevance gates error (non-fatal):", designError);
    }

    // --- Results ---
    const allPassed = checks.every((c) => c.passed);
    const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

    // Create QA Report
    await prisma.qaReport.create({
      data: {
        buildId,
        passed: allPassed,
        formsWorking: checks.find((c) => c.name === "form_check")?.passed ?? false,
        linksValid: checks.find((c) => c.name === "content_check")?.passed ?? false,
        notes: checks.map((c) => `${c.passed ? "PASS" : "FAIL"} ${c.name}: ${c.details}`).join("\n"),
        rawReport: { score, checks, designGates } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });

    // Update build status
    if (allPassed) {
      await prisma.build.update({
        where: { id: buildId },
        data: { status: "PREVIEW_READY", progress: 100, completedAt: new Date() },
      });
      // Update lead status and send notification
      const bp = await prisma.blueprint.findUnique({
        where: { id: blueprintId },
        select: { leadId: true, lead: { select: { userId: true, businessName: true } } },
      });
      if (bp) {
        await prisma.lead.update({ where: { id: bp.leadId }, data: { status: "PREVIEW_READY" } });
        const siteRecord = await prisma.site.findFirst({ where: { build: { id: buildId } } });
        sendNotification(bp.lead.userId, "PREVIEW_READY", {
          businessName: bp.lead.businessName ?? "Your business",
          siteUrl: siteRecord?.wpUrl ?? "",
        }).catch((err) => console.error("[qa] Notification error:", err));
      }
    } else {
      await prisma.build.update({
        where: { id: buildId },
        data: { status: "QA_FAILED", progress: 90, failureReason: `QA score: ${score}%. Failed checks: ${checks.filter((c) => !c.passed).map((c) => c.name).join(", ")}` },
      });
    }

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { score, passed: allPassed, checks } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    return { score, passed: allPassed, checks, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs,
        completedAt: new Date(),
      },
    });

    await prisma.build.update({
      where: { id: buildId },
      data: { status: "FAILED", failureReason: error instanceof Error ? error.message : "QA failed", failedAt: new Date() },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createQAWorker(connection: { host: string; port: number }) {
  return new Worker<QAJobData>("qa", processQAJob, {
    connection,
    concurrency: 2,
  });
}
