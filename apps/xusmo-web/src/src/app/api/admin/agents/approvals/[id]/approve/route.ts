// POST /api/admin/agents/approvals/[id]/approve
// Approves a pending AgentApproval.

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const approval = await prisma.agentApproval.findUnique({
      where: { id },
    });
    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: `Approval is already ${approval.status}` },
        { status: 400 }
      );
    }

    const resolvedBy =
      (session.user as any).email ?? (session.user as any).id ?? "admin";

    const updated = await prisma.agentApproval.update({
      where: { id },
      data: {
        status: "APPROVED",
        resolvedBy,
        resolvedAt: new Date(),
      },
      include: {
        agent: { select: { name: true, displayName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/agents/approvals/[id]/approve]", error);
    return NextResponse.json(
      { error: "Failed to approve" },
      { status: 500 }
    );
  }
}
