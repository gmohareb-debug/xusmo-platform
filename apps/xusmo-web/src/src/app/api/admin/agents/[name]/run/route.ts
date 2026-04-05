// POST /api/admin/agents/[name]/run
// Triggers a manual agent run.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Check admin auth
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;

    const agent = await prisma.adminAgent.findUnique({
      where: { name },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.isEnabled) {
      return NextResponse.json(
        { error: "Agent is disabled. Enable it before running." },
        { status: 400 }
      );
    }

    // Create a new AgentRun record
    const run = await prisma.agentRun.create({
      data: {
        agentId: agent.id,
        status: "STARTED",
        startedAt: new Date(),
      },
    });

    // In a production system, this would dispatch the actual agent job
    // to a queue (BullMQ, etc.) and return the run ID for polling.
    // For now, we create the run record and return it.

    return NextResponse.json({
      runId: run.id,
      agentName: agent.name,
      status: run.status,
      startedAt: run.startedAt,
      message: `Agent "${agent.displayName}" run triggered successfully.`,
    });
  } catch (error) {
    console.error("[admin/agents/[name]/run]", error);
    return NextResponse.json(
      { error: "Failed to trigger agent run" },
      { status: 500 }
    );
  }
}
