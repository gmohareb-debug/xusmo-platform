// POST /api/builds/create
// Starts the build pipeline for a blueprint.
// Body: { blueprintId }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startBuildPipeline } from "@/lib/queue";

const schema = z.object({
  blueprintId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Verify blueprint exists and belongs to user
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: parsed.data.blueprintId },
      include: { lead: { select: { userId: true } } },
    });

    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const isAdmin = user?.role === "ADMIN";
    if (!isAdmin && blueprint.lead.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Start pipeline
    const result = await startBuildPipeline(parsed.data.blueprintId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[builds/create]", error);
    return NextResponse.json(
      { error: "Failed to start build" },
      { status: 500 }
    );
  }
}
