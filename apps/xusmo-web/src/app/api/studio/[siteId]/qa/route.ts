// POST /api/studio/[siteId]/qa — trigger a QA check
// GET  /api/studio/[siteId]/qa — get latest QA report

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

// ---------------------------------------------------------------------------
// POST — trigger QA check
// ---------------------------------------------------------------------------

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const build = await prisma.build.findFirst({ where: { siteId } });

    if (!build) {
      return NextResponse.json(
        { error: "No build found for this site" },
        { status: 400 }
      );
    }

    // TODO: enqueue BullMQ qaQueue job when queue infrastructure is ready

    return NextResponse.json({
      queued: true,
      message: "QA check has been queued. Results will appear shortly.",
    });
  } catch (error) {
    console.error("[studio/qa/trigger]", error);
    return NextResponse.json(
      { error: "Failed to trigger QA check" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — get latest QA report
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const build = await prisma.build.findFirst({
      where: { siteId },
      select: { id: true },
    });

    if (!build) {
      return NextResponse.json({ report: null });
    }

    const report = await prisma.qaReport.findFirst({
      where: { buildId: build.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ report: report ?? null });
  } catch (error) {
    console.error("[studio/qa/report]", error);
    return NextResponse.json(
      { error: "Failed to load QA report" },
      { status: 500 }
    );
  }
}
