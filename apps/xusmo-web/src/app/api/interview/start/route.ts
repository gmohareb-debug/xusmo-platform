// POST /api/interview/start
// Creates a new lead and returns Stage 1 questions.
// Falls back to demo mode if the database is unavailable.
// Body (optional): { track: "WEBSITE" | "ECOMMERCE" }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startInterview } from "@/lib/interview/engine";
import { getInterviewQuestions } from "@/lib/interview/questions";
import type { SiteTrack } from "@prisma/client";

export async function POST(req: NextRequest) {
  let track: SiteTrack | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body.track === "ECOMMERCE" || body.track === "WEBSITE") {
      track = body.track;
    }
  } catch {
    // No body — default track
  }

  try {
    const session = await getServerSession(authOptions);
    // userId must be a real User.id (CUID), not an email — Lead has FK to User
    const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    const result = await startInterview(userId, track);
    return NextResponse.json(result);
  } catch {
    // Fallback: demo mode — return questions without DB
    const demoLeadId = `demo-${crypto.randomUUID()}`;
    const questions = getInterviewQuestions(1, null, null, track);
    return NextResponse.json({
      leadId: demoLeadId,
      currentStage: 1,
      track: track ?? "WEBSITE",
      questions,
    });
  }
}
