// POST /api/interview/classify
// Runs 4-layer classification on business description.
// Body: { leadId, description }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { classifyBusiness } from "@/lib/classification/classify";
import { prisma } from "@/lib/db";

const schema = z.object({
  leadId: z.string().min(1),
  description: z.string().min(3),
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

    const { leadId, description } = parsed.data;

    // Verify lead exists and belongs to user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, userId: true } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    const sessionUserId = (session.user as Record<string, unknown>).id as string;
    if (lead.userId !== sessionUserId && (session.user as Record<string, unknown>).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const classification = await classifyBusiness(description);

    if (classification) {
      // Persist classification to lead
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          industryId: classification.industry.industryId,
          industryName: classification.industry.displayName,
          archetype: classification.archetype.type,
          confidence: classification.industry.confidence,
          alternatives: classification.industry.alternatives,
          features: classification.features,
          styleVariant: classification.template.styleVariant,
          complexityLevel: classification.template.complexityLevel,
        },
      });
    }

    return NextResponse.json({ classification });
  } catch (error) {
    console.error("[interview/classify]", error);
    return NextResponse.json(
      { error: "Classification failed" },
      { status: 500 }
    );
  }
}
