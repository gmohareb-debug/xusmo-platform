// =============================================================================
// Interview Engine — State Management
// Manages the 8-stage interview flow server-side:
//   - Creates/tracks leads through stages
//   - Triggers classification after Stage 1
//   - Loads industry-specific questions for Stages 3-7
//   - Validates and completes interviews
// Usage: import { startInterview, submitAnswer, advanceStage } from "@/lib/interview/engine";
// =============================================================================

import { prisma } from "@/lib/db";
import { classifyBusiness, getIndustryDefaults } from "@/lib/classification/classify";
import type { ClassificationResult } from "@/lib/classification/classify";
import type { Archetype } from "@/lib/classification/archetypes";
import {
  getInterviewQuestions,
  TOTAL_STAGES,
  type InterviewQuestion,
} from "./questions";
import type { IndustryDefault, SiteTrack } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InterviewState {
  leadId: string;
  currentStage: number;
  answers: Record<string, unknown>;
  classificationResult?: ClassificationResult | null;
  industryDefaults?: IndustryDefault | null;
}

// ---------------------------------------------------------------------------
// Helper: build a minimal ClassificationResult from persisted Lead data
// (needed for question generation in stages 4-7)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildMinimalClassification(
  lead: any,
  industryDefaults: IndustryDefault | null
): ClassificationResult | null {
  if (!lead.archetype || !lead.industryId) return null;
  return {
    industry: {
      industryId: lead.industryId,
      industryCode: industryDefaults?.industryCode ?? "",
      displayName: lead.industryName ?? "",
      confidence: lead.confidence ?? 0,
      alternatives: (lead.alternatives as Array<{
        industryCode: string;
        displayName: string;
        confidence: number;
      }>) ?? [],
    },
    archetype: {
      type: lead.archetype as "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE",
      confidence: lead.confidence ?? 0,
    },
    features: (lead.features as string[]) ?? [],
    template: {
      templateFamily: lead.archetype.toLowerCase(),
      styleVariant: lead.styleVariant ?? "",
      complexityLevel:
        (lead.complexityLevel as "simple" | "standard" | "complex") ?? "standard",
    },
    visualStyle: {
      primaryColors: (industryDefaults?.primaryColors as string[] | null) ?? [],
      fontPreference: industryDefaults?.fontPreference ?? "clean sans-serif",
      imageryThemes: (industryDefaults?.imageryThemes as string[] | null) ?? [],
      tone: industryDefaults?.tone ?? "professional",
      layoutDensity: (industryDefaults?.layoutDensity as string | null) ?? "balanced",
    },
    requiredSections: (industryDefaults?.requiredSections as string[] | null) ?? [],
    regulated: industryDefaults?.isRegulated ?? false,
    disclaimers: (industryDefaults?.defaultDisclaimers as string[] | null) ?? [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// startInterview — creates Lead, returns Stage 1 questions
// ---------------------------------------------------------------------------

export async function startInterview(userId: string, track?: SiteTrack) {
  const selectedTrack = track ?? "WEBSITE";

  // Resume an existing in-progress interview for the same track
  const existingLead = await prisma.lead.findFirst({
    where: {
      userId,
      status: "INTERVIEW_STARTED",
      track: selectedTrack,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingLead) {
    const questions = getInterviewQuestions(
      existingLead.currentStage,
      null,
      null,
      existingLead.track
    );
    return {
      leadId: existingLead.id,
      currentStage: existingLead.currentStage,
      track: existingLead.track,
      questions,
      resumed: true,
    };
  }

  const lead = await prisma.lead.create({
    data: {
      userId,
      status: "INTERVIEW_STARTED",
      currentStage: 1,
      track: selectedTrack,
      rawAnswers: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  const questions = getInterviewQuestions(1, null, null, selectedTrack);

  return {
    leadId: lead.id,
    currentStage: 1,
    track: selectedTrack,
    questions,
    resumed: false,
  };
}

// ---------------------------------------------------------------------------
// submitAnswer — stores a single answer
// ---------------------------------------------------------------------------

export async function submitAnswer(
  leadId: string,
  questionId: string,
  answer: unknown
) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const currentAnswers = (lead.rawAnswers as Record<string, unknown>) ?? {};
  currentAnswers[questionId] = answer;

  await prisma.lead.update({
    where: { id: leadId },
    data: { rawAnswers: currentAnswers as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  // Check if all required questions for this stage are answered
  // Load classification/industry context for conditional question resolution
  let industryDefaults: IndustryDefault | null = null;
  if (lead.industryId) {
    industryDefaults = await prisma.industryDefault.findUnique({
      where: { id: lead.industryId },
    });
  }
  const classResult = lead.archetype ? buildMinimalClassification(lead, industryDefaults) : null;
  const questions = getInterviewQuestions(lead.currentStage, classResult, industryDefaults, lead.track);

  // Filter questions by showWhen conditions
  const visibleQuestions = questions.filter((q) => {
    if (!q.showWhen) return true;
    if (q.showWhen.archetype && lead.archetype && !q.showWhen.archetype.includes(lead.archetype as Archetype)) return false;
    if (q.showWhen.answerId && currentAnswers[q.showWhen.answerId] !== q.showWhen.answerValue) return false;
    return true;
  });

  const requiredIds = visibleQuestions.filter((q) => q.required).map((q) => q.id);
  const stageComplete = requiredIds.every((id) => currentAnswers[id] != null);

  return { success: true, stageComplete };
}

// ---------------------------------------------------------------------------
// advanceStage — moves to next stage, runs classification after Stage 1
// ---------------------------------------------------------------------------

export async function advanceStage(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const answers = (lead.rawAnswers as Record<string, unknown>) ?? {};
  const nextStage = lead.currentStage + 1;

  if (nextStage > TOTAL_STAGES) {
    throw new Error("Interview already at final stage");
  }

  let classificationResult: ClassificationResult | null = null;
  let industryDefaults: IndustryDefault | null = null;

  // After Stage 1: run classification on business description
  if (lead.currentStage === 1 && answers.business_description) {
    classificationResult = await classifyBusiness(
      answers.business_description as string
    );

    if (classificationResult) {
      // E-commerce track forces COMMERCE archetype regardless of classification
      if (lead.track === "ECOMMERCE") {
        classificationResult.archetype = { type: "COMMERCE", confidence: 1 };
      }

      industryDefaults = await getIndustryDefaults(
        classificationResult.industry.industryCode
      );

      // Persist classification to Lead
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          businessName: (answers.business_name as string) ?? null,
          businessDescription: (answers.business_description as string) ?? null,
          phone: (answers.phone as string) ?? null,
          email: (answers.email as string) ?? null,
          location: (answers.location as string) ?? null,
          yearsInBusiness: (answers.years_in_business as string) ?? null,
          industryId: classificationResult.industry.industryId,
          industryName: classificationResult.industry.displayName,
          archetype: classificationResult.archetype.type,
          confidence: classificationResult.industry.confidence,
          alternatives: classificationResult.industry.alternatives as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          features: classificationResult.features as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          styleVariant: classificationResult.template.styleVariant,
          complexityLevel: classificationResult.template.complexityLevel,
          currentStage: nextStage,
        },
      });
    } else {
      // No classification match — still advance but mark for LLM fallback
      // E-commerce track still forces COMMERCE archetype
      const forceData: Record<string, unknown> = {
        businessName: (answers.business_name as string) ?? null,
        businessDescription: (answers.business_description as string) ?? null,
        phone: (answers.phone as string) ?? null,
        email: (answers.email as string) ?? null,
        location: (answers.location as string) ?? null,
        yearsInBusiness: (answers.years_in_business as string) ?? null,
        currentStage: nextStage,
      };
      if (lead.track === "ECOMMERCE") {
        forceData.archetype = "COMMERCE";
      }
      await prisma.lead.update({
        where: { id: leadId },
        data: forceData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    }
  } else {
    await prisma.lead.update({
      where: { id: leadId },
      data: { currentStage: nextStage },
    });
  }

  // For stages beyond 1, we may need classification + industry data from the lead
  // (classification only returned non-null after stage 1 advance)
  if (!classificationResult && lead.archetype && lead.industryId) {
    if (!industryDefaults) {
      industryDefaults = await prisma.industryDefault.findUnique({
        where: { id: lead.industryId },
      });
    }
    classificationResult = buildMinimalClassification(lead, industryDefaults);
  }

  // Get questions for the new stage
  const questions = getInterviewQuestions(
    nextStage,
    classificationResult,
    industryDefaults,
    lead.track
  );

  return {
    stage: nextStage,
    questions,
    classificationResult,
  };
}

// ---------------------------------------------------------------------------
// getNextQuestions — returns questions for current stage
// ---------------------------------------------------------------------------

export async function getNextQuestions(
  leadId: string
): Promise<{ stage: number; questions: InterviewQuestion[] }> {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  let industryDefaults: IndustryDefault | null = null;
  if (lead.industryId) {
    industryDefaults = await prisma.industryDefault.findUnique({
      where: { id: lead.industryId },
    });
  }

  // Reconstruct a minimal classification result for question generation
  const classificationResult = buildMinimalClassification(lead, industryDefaults);

  const questions = getInterviewQuestions(
    lead.currentStage,
    classificationResult,
    industryDefaults,
    lead.track
  );

  return { stage: lead.currentStage, questions };
}

// ---------------------------------------------------------------------------
// completeInterview — validates required fields, marks complete
// ---------------------------------------------------------------------------

export async function completeInterview(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const answers = (lead.rawAnswers as Record<string, unknown>) ?? {};

  // Validate required basics
  const requiredFields = ["business_name", "business_description", "email", "primary_goal", "differentiator"];
  const missing = requiredFields.filter((f) => !answers[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  // Mark as complete
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "INTERVIEW_COMPLETED" },
  });

  return { leadId, status: "INTERVIEW_COMPLETED" as const };
}

// ---------------------------------------------------------------------------
// getInterviewStatus — returns current state + progress
// ---------------------------------------------------------------------------

export async function getInterviewStatus(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const answers = (lead.rawAnswers as Record<string, unknown>) ?? {};

  return {
    leadId: lead.id,
    status: lead.status,
    currentStage: lead.currentStage,
    totalStages: TOTAL_STAGES,
    progress: Math.round((lead.currentStage / TOTAL_STAGES) * 100),
    answeredQuestions: Object.keys(answers).length,
    classificationResult: lead.archetype
      ? {
          industryName: lead.industryName,
          archetype: lead.archetype,
          confidence: lead.confidence,
        }
      : null,
  };
}
