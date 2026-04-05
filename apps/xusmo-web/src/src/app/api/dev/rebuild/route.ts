// =============================================================================
// Admin Rebuild — Trigger a fresh dev build from an existing blueprint
// POST /api/admin/rebuild { blueprintId: "..." }
// Dev-only utility — no auth required in development
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startDevBuildPipeline } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const { blueprintId } = await req.json();
    if (!blueprintId) {
      return NextResponse.json({ error: "blueprintId required" }, { status: 400 });
    }

    // Verify blueprint exists
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: blueprintId },
    });
    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    const result = await startDevBuildPipeline(blueprintId);

    return NextResponse.json({
      message: "Rebuild started",
      buildId: result.buildId,
      status: result.status,
    });
  } catch (err) {
    console.error("[admin/rebuild] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rebuild failed" },
      { status: 500 }
    );
  }
}
