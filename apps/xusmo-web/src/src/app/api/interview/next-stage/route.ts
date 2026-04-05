// POST /api/interview/next-stage
// Advances interview to the next stage.
// After Stage 1, triggers classification.
// Body: { leadId }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { advanceStage } from "@/lib/interview/engine";
import { getInterviewQuestions, TOTAL_STAGES } from "@/lib/interview/questions";

const schema = z.object({
  leadId: z.string().min(1),
});

// In-memory stage tracker for demo leads
const demoStages = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { leadId } = parsed.data;

    // Demo mode: advance stage in-memory
    if (leadId.startsWith("demo-")) {
      const currentStage = demoStages.get(leadId) ?? 1;
      const nextStage = currentStage + 1;

      if (nextStage > TOTAL_STAGES) {
        return NextResponse.json({ error: "Interview already at final stage" }, { status: 400 });
      }

      demoStages.set(leadId, nextStage);

      // Simulate classification result after Stage 1
      const classificationResult =
        currentStage === 1
          ? {
              industry: {
                industryId: "demo-industry",
                industryCode: "GENERAL_SERVICE",
                displayName: "General Service Business",
                confidence: 0.85,
                alternatives: [],
              },
              archetype: { type: "SERVICE" as const, confidence: 0.85 },
              features: ["contact_form", "services_page", "about_page", "testimonials"],
              template: {
                templateFamily: "service-starter",
                styleVariant: "clean",
                complexityLevel: "standard" as const,
              },
              visualStyle: {
                primaryColors: ["#1e40af", "#475569", "#dc2626"],
                imageryThemes: ["professional", "team"],
                tone: "professional",
                fontPreference: "modern_sans",
                layoutDensity: "standard",
              },
              requiredSections: ["hero", "services", "contact", "about"],
              regulated: false,
              disclaimers: [],
            }
          : undefined;

      // Demo mode doesn't have track context — default to WEBSITE
      const questions = getInterviewQuestions(nextStage, classificationResult ?? null, null, null);
      return NextResponse.json({ stage: nextStage, questions, classificationResult });
    }

    // Real lead: verify ownership
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { userId: true } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    const sessionUserId = (session.user as Record<string, unknown>).id as string;
    if (lead.userId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await advanceStage(leadId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("No Lead found")) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (message.includes("final stage")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[interview/next-stage]", error);
    return NextResponse.json(
      { error: "Failed to advance stage" },
      { status: 500 }
    );
  }
}
