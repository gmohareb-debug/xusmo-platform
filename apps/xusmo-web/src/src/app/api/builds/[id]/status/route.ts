// GET /api/builds/[id]/status
// Returns build status, progress, currentAgent, timestamps.
// Demo builds simulate a progressive build pipeline.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDemoAnswersForBuild, demoBuildStartTimes } from "@/lib/demo-store";

// ---------------------------------------------------------------------------
// Demo mode — simulate build progress in-memory
// ---------------------------------------------------------------------------

function getDemoBuildStatus(buildId: string) {
  if (!demoBuildStartTimes.has(buildId)) {
    demoBuildStartTimes.set(buildId, Date.now());
  }

  const answers = getDemoAnswersForBuild(buildId);

  const startTime = demoBuildStartTimes.get(buildId)!;
  const elapsed = (Date.now() - startTime) / 1000; // seconds

  const pipeline = [
    { name: "content", duration: 3 },
    { name: "build", duration: 4 },
    { name: "seo", duration: 2 },
    { name: "asset", duration: 3 },
    { name: "qa", duration: 2 },
  ];

  const agents = [];
  let totalDuration = 0;
  let currentAgent: string | null = null;
  let progress = 0;

  for (const step of pipeline) {
    const stepStart = totalDuration;
    const stepEnd = totalDuration + step.duration;

    if (elapsed >= stepEnd) {
      // Completed
      agents.push({
        agentName: step.name,
        status: "COMPLETED",
        durationMs: step.duration * 1000,
        startedAt: new Date(startTime + stepStart * 1000).toISOString(),
        completedAt: new Date(startTime + stepEnd * 1000).toISOString(),
      });
    } else if (elapsed >= stepStart) {
      // Running
      currentAgent = step.name;
      agents.push({
        agentName: step.name,
        status: "IN_PROGRESS",
        durationMs: null,
        startedAt: new Date(startTime + stepStart * 1000).toISOString(),
        completedAt: null,
      });
    } else {
      // Pending
      agents.push({
        agentName: step.name,
        status: "PENDING",
        durationMs: null,
        startedAt: null,
        completedAt: null,
      });
    }

    totalDuration += step.duration;
  }

  const totalPipelineTime = pipeline.reduce((s, p) => s + p.duration, 0);
  const isDone = elapsed >= totalPipelineTime;
  progress = isDone ? 100 : Math.min(99, Math.round((elapsed / totalPipelineTime) * 100));

  const businessName =
    (answers?.business_name as string) || "Your Business";

  return {
    buildId,
    status: isDone ? "PREVIEW_READY" : "BUILDING",
    progress,
    currentAgent: isDone ? null : currentAgent,
    startedAt: new Date(startTime).toISOString(),
    completedAt: isDone ? new Date(startTime + totalPipelineTime * 1000).toISOString() : null,
    failureReason: null,
    siteUrl: isDone ? "demo-preview" : null,
    businessName,
    agents,
    qaReport: isDone ? { passed: true, notes: "All checks passed. Demo site ready for preview." } : null,
    // Include interview answers for demo preview rendering
    demoAnswers: answers ?? null,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode
    if (id.startsWith("demo-")) {
      return NextResponse.json(getDemoBuildStatus(id));
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        agentLogs: {
          orderBy: { startedAt: "asc" },
          select: {
            agentName: true,
            status: true,
            durationMs: true,
            startedAt: true,
            completedAt: true,
          },
        },
        qaReports: {
          select: { passed: true, notes: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        site: {
          select: { id: true, wpUrl: true, businessName: true, userId: true },
        },
        blueprint: {
          select: {
            businessInfo: true,
            services: true,
            contactPrefs: true,
            goals: true,
            lead: { select: { rawAnswers: true, userId: true } },
          },
        },
      },
    });

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    // Verify ownership (admin can access any build)
    let sessionUserId = (session.user as Record<string, unknown>).id as string;
    const isAdmin = (session.user as Record<string, unknown>).role === "ADMIN";

    // Resolve local- fallback IDs to real DB user
    if (sessionUserId.startsWith("local-") && session.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) sessionUserId = dbUser.id;
    }

    const ownerId = build.site?.userId ?? build.blueprint?.lead?.userId;
    if (!isAdmin && ownerId && ownerId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build demoAnswers-compatible object from blueprint for preview rendering
    const answers = (build.blueprint?.lead?.rawAnswers as Record<string, unknown>) ?? null;

    // -----------------------------------------------------------------------
    // Dev-build simulation — no agentLogs means dev pipeline (no workers).
    // Simulate progress like demo mode using elapsed time from startedAt.
    // -----------------------------------------------------------------------
    if (
      build.status === "IN_PROGRESS" &&
      build.agentLogs.length === 0 &&
      build.startedAt
    ) {
      const startMs = new Date(build.startedAt).getTime();
      const elapsed = (Date.now() - startMs) / 1000;

      const pipeline = [
        { name: "content", duration: 3 },
        { name: "build", duration: 4 },
        { name: "seo", duration: 2 },
        { name: "asset", duration: 3 },
        { name: "qa", duration: 2 },
      ];

      const simAgents = [];
      let totalDuration = 0;
      let simCurrentAgent: string | null = null;

      for (const step of pipeline) {
        const stepStart = totalDuration;
        const stepEnd = totalDuration + step.duration;

        if (elapsed >= stepEnd) {
          simAgents.push({
            agentName: step.name,
            status: "COMPLETED",
            durationMs: step.duration * 1000,
            startedAt: new Date(startMs + stepStart * 1000).toISOString(),
            completedAt: new Date(startMs + stepEnd * 1000).toISOString(),
          });
        } else if (elapsed >= stepStart) {
          simCurrentAgent = step.name;
          simAgents.push({
            agentName: step.name,
            status: "IN_PROGRESS",
            durationMs: null,
            startedAt: new Date(startMs + stepStart * 1000).toISOString(),
            completedAt: null,
          });
        } else {
          simAgents.push({
            agentName: step.name,
            status: "PENDING",
            durationMs: null,
            startedAt: null,
            completedAt: null,
          });
        }

        totalDuration += step.duration;
      }

      const totalPipelineTime = pipeline.reduce((s, p) => s + p.duration, 0);
      const isDone = elapsed >= totalPipelineTime;
      const simProgress = isDone
        ? 100
        : Math.min(99, Math.round((elapsed / totalPipelineTime) * 100));

      // When simulation completes, persist PREVIEW_READY to DB
      if (isDone) {
        await prisma.build.update({
          where: { id },
          data: {
            status: "PREVIEW_READY",
            progress: 100,
            currentAgent: null,
            completedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        buildId: build.id,
        siteId: build.site?.id ?? null,
        status: isDone ? "PREVIEW_READY" : "BUILDING",
        progress: simProgress,
        currentAgent: isDone ? null : simCurrentAgent,
        startedAt: build.startedAt,
        completedAt: isDone ? new Date().toISOString() : null,
        failureReason: null,
        siteUrl: build.site?.wpUrl ?? null,
        businessName: build.site?.businessName ?? null,
        agents: simAgents,
        qaReport: isDone
          ? { passed: true, notes: "All checks passed. Site ready for preview." }
          : null,
        demoAnswers: answers,
      });
    }

    return NextResponse.json({
      buildId: build.id,
      siteId: build.site?.id ?? null,
      status: build.status,
      progress: build.progress,
      currentAgent: build.currentAgent,
      generatorType: (build as Record<string, unknown>).generatorType ?? "gutenberg",
      startedAt: build.startedAt,
      completedAt: build.completedAt,
      failureReason: build.failureReason,
      siteUrl: build.site?.wpUrl,
      businessName: build.site?.businessName,
      agents: build.agentLogs,
      qaReport: build.qaReports[0] ?? null,
      demoAnswers: answers,
    });
  } catch (error) {
    console.error("[builds/status]", error);
    return NextResponse.json(
      { error: "Failed to get build status" },
      { status: 500 }
    );
  }
}
