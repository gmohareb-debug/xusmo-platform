// POST /api/builds/trigger
// Internal dev endpoint to trigger a build pipeline.
// Requires X-Api-Key header matching INTERNAL_API_KEY env var.
// Body: { blueprintId }

import { NextRequest, NextResponse } from "next/server";
import { startDevBuildPipeline } from "@/lib/queue";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.INTERNAL_API_KEY || "xusmo-dev-2026";
  if (apiKey !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blueprintId } = await req.json();
    if (!blueprintId) {
      return NextResponse.json({ error: "blueprintId required" }, { status: 400 });
    }

    // Use dev pipeline (inline stages) — NOT the BullMQ queue pipeline.
    // The dev pipeline handles Coolify provisioning, WP content injection, etc.
    const result = await startDevBuildPipeline(blueprintId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[builds/trigger]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
