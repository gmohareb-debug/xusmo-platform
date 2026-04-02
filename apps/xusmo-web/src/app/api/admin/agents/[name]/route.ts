// GET /api/admin/agents/[name] — agent detail with recent runs (last 20)
// PUT /api/admin/agents/[name] — update config (isEnabled, schedule)

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

export async function GET(
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
      include: {
        runs: {
          take: 20,
          orderBy: { startedAt: "desc" },
          include: {
            site: {
              select: { id: true, businessName: true, wpUrl: true },
            },
          },
        },
        approvals: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("[admin/agents/[name] GET]", error);
    return NextResponse.json(
      { error: "Failed to load agent detail" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const body = await req.json();
    const { isEnabled, schedule } = body;

    const agent = await prisma.adminAgent.findUnique({
      where: { name },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isEnabled === "boolean") updateData.isEnabled = isEnabled;
    if (schedule !== undefined) updateData.schedule = schedule;

    const updated = await prisma.adminAgent.update({
      where: { name },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/agents/[name] PUT]", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
