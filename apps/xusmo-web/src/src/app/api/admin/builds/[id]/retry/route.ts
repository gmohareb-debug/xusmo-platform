// POST /api/admin/builds/[id]/retry
// Retries a failed build from the failed agent.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contentQueue, buildQueue, seoQueue, assetQueue, qaQueue } from "@/lib/queue";
import type { Queue } from "bullmq";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const build = await prisma.build.findUnique({
      where: { id },
    });

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    if (build.status !== "FAILED" && build.status !== "QA_FAILED") {
      return NextResponse.json(
        { error: `Build is ${build.status}, can only retry FAILED or QA_FAILED builds` },
        { status: 400 }
      );
    }

    // Determine which agent to retry from
    const retryAgent = build.currentAgent ?? "content";
    const queueMap: Record<string, Queue> = {
      content: contentQueue,
      build: buildQueue,
      builder: buildQueue,
      seo: seoQueue,
      asset: assetQueue,
      qa: qaQueue,
    };

    const queue = queueMap[retryAgent] ?? contentQueue;

    // Reset build status
    await prisma.build.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        failureReason: null,
        failedAt: null,
      },
    });

    // Queue the retry
    await queue.add(
      `${retryAgent}-retry`,
      { buildId: id, blueprintId: build.blueprintId },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );

    return NextResponse.json({
      success: true,
      retryAgent,
      message: `Build retry queued from ${retryAgent} agent`,
    });
  } catch (error) {
    console.error("[admin/builds/retry]", error);
    return NextResponse.json(
      { error: "Failed to retry build" },
      { status: 500 }
    );
  }
}
