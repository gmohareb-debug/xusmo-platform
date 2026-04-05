// POST /api/interview/answer
// Stores a single answer for a lead.
// Body: { leadId, questionId, answer }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { submitAnswer } from "@/lib/interview/engine";
import { demoAnswers } from "@/lib/demo-store";

const schema = z.object({
  leadId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.unknown(),
});

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

    const { leadId, questionId, answer } = parsed.data;

    // Demo mode: store in memory and acknowledge
    if (leadId.startsWith("demo-")) {
      const existing = demoAnswers.get(leadId) ?? {};
      existing[questionId] = answer;
      demoAnswers.set(leadId, existing);
      return NextResponse.json({ success: true, stageComplete: false });
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

    const result = await submitAnswer(leadId, questionId, answer);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("No Lead found")) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    console.error("[interview/answer]", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
