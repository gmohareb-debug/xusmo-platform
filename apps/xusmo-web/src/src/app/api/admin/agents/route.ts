// GET /api/admin/agents
// Lists all AdminAgent records with last AgentRun status.

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

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await prisma.adminAgent.findMany({
      orderBy: { name: "asc" },
      include: {
        runs: {
          take: 1,
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            sitesChecked: true,
            issuesFound: true,
            autoFixed: true,
            escalated: true,
          },
        },
        _count: { select: { approvals: { where: { status: "PENDING" } } } },
      },
    });

    return NextResponse.json(
      agents.map((a) => ({
        id: a.id,
        name: a.name,
        displayName: a.displayName,
        description: a.description,
        schedule: a.schedule,
        isEnabled: a.isEnabled,
        managedOnly: a.managedOnly,
        targetPlans: a.targetPlans,
        lastRun: a.runs[0] ?? null,
        pendingApprovals: a._count.approvals,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }))
    );
  } catch (error) {
    console.error("[admin/agents]", error);
    return NextResponse.json(
      { error: "Failed to load agents" },
      { status: 500 }
    );
  }
}
