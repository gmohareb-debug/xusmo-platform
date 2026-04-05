// POST /api/interview/complete
// Validates all required answers and generates blueprint.
// Body: { leadId }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { completeInterview } from "@/lib/interview/engine";
import { generateBlueprint } from "@/lib/interview/blueprint";
import { startBuildPipeline, startDevBuildPipeline } from "@/lib/queue";
import { demoBlueprintToLead } from "@/lib/demo-store";

const schema = z.object({
  leadId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Require authentication to generate a website
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please create an account to generate your website", requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { leadId } = parsed.data;

    // Demo mode: return a mock blueprint and link it to the lead
    if (leadId.startsWith("demo-")) {
      const demoBuildId = `demo-bp-${crypto.randomUUID()}`;
      demoBlueprintToLead.set(demoBuildId, leadId);
      return NextResponse.json({ buildId: demoBuildId });
    }

    // Verify lead belongs to authenticated user
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { userId: true } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    const sessionUserId = (session.user as Record<string, unknown>).id as string;
    if (lead.userId !== sessionUserId && (session.user as Record<string, unknown>).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate and mark interview complete
    await completeInterview(leadId);

    // Generate blueprint
    const { blueprintId } = await generateBlueprint(leadId);

    // Start the build pipeline
    // In production with workers: use BullMQ queue pipeline
    // In dev: create Build + Site synchronously (no workers to process queued jobs)
    const useQueue = process.env.NODE_ENV === "production" && process.env.BULLMQ_WORKERS === "true";
    const buildResult = useQueue
      ? await startBuildPipeline(blueprintId)
      : await startDevBuildPipeline(blueprintId);

    return NextResponse.json({ buildId: buildResult.buildId, blueprintId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("Missing required fields")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.includes("No Lead found")) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    console.error("[interview/complete]", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}
