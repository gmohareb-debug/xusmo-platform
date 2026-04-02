// GET /api/admin/agents/approvals
// Lists pending AgentApproval records ordered by priority.

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

// Priority sort order: CRITICAL > URGENT > NORMAL > LOW
const priorityOrder: Record<string, number> = {
  CRITICAL: 0,
  URGENT: 1,
  NORMAL: 2,
  LOW: 3,
};

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const approvals = await prisma.agentApproval.findMany({
      where: { status: "PENDING" },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      include: {
        agent: {
          select: { name: true, displayName: true },
        },
      },
    });

    // Sort by priority order since Prisma enum ordering may not match our desired order
    const sorted = approvals.sort(
      (a, b) =>
        (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    );

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[admin/agents/approvals]", error);
    return NextResponse.json(
      { error: "Failed to load approvals" },
      { status: 500 }
    );
  }
}
