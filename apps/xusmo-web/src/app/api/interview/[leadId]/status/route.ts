// GET /api/interview/[leadId]/status
// Returns current interview state, stage, and progress percentage.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getInterviewStatus } from "@/lib/interview/engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    // Demo leads don't require auth
    if (!leadId.startsWith("demo-")) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { userId: true } });
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      const sessionUserId = (session.user as Record<string, unknown>).id as string;
      if (lead.userId !== sessionUserId && (session.user as Record<string, unknown>).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const status = await getInterviewStatus(leadId);
    return NextResponse.json(status);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("No Lead found")) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    console.error("[interview/status]", error);
    return NextResponse.json(
      { error: "Failed to get interview status" },
      { status: 500 }
    );
  }
}
