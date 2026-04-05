// POST /api/builds/[id]/approve
// Approves a build that's in PREVIEW_READY status and queues the Publishing Agent.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishQueue } from "@/lib/queue";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode
    if (id.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        status: "APPROVED",
        message: "Build approved! Redirecting to go-live.",
        siteUrl: "demo-preview",
      });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        site: true,
        blueprint: { select: { id: true, leadId: true, lead: { select: { userId: true } } } },
      },
    });

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    // Verify ownership (admin can approve any build)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const isAdmin = user?.role === "ADMIN";
    const ownerId = build.site?.userId ?? build.blueprint?.lead?.userId;
    if (!isAdmin && ownerId && ownerId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (build.status !== "PREVIEW_READY") {
      return NextResponse.json(
        { error: `Build is in ${build.status} status, not PREVIEW_READY` },
        { status: 400 }
      );
    }

    // Approve the build
    await prisma.build.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // Update lead status
    if (build.blueprint) {
      await prisma.lead.update({
        where: { id: build.blueprint.leadId },
        data: { status: "APPROVED" },
      });
    }

    // In production with workers: queue the Publishing Agent
    // In dev: mark site as LIVE directly (no workers to process the queue)
    const useQueue = process.env.NODE_ENV === "production" && process.env.BULLMQ_WORKERS === "true";
    if (useQueue) {
      await publishQueue.add(
        "publish-job",
        { buildId: id, blueprintId: build.blueprintId },
        {
          attempts: 2,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        }
      );
    } else if (build.siteId) {
      // Dev mode: mark site LIVE and build PUBLISHED (no workers to process)
      await prisma.site.update({
        where: { id: build.siteId },
        data: { status: "LIVE" },
      });
      await prisma.build.update({
        where: { id },
        data: { status: "PUBLISHED", completedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      message: "Build approved.",
      siteId: build.siteId,
      siteUrl: build.site?.wpUrl ?? null,
    });
  } catch (error) {
    console.error("[builds/approve]", error);
    return NextResponse.json(
      { error: "Failed to approve build" },
      { status: 500 }
    );
  }
}
