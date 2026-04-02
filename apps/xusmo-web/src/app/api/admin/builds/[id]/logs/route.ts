// GET /api/admin/builds/[id]/logs
// Returns all AgentLog entries for a build.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
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

    const logs = await prisma.agentLog.findMany({
      where: { buildId: id },
      orderBy: { startedAt: "asc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[admin/builds/logs]", error);
    return NextResponse.json(
      { error: "Failed to load logs" },
      { status: 500 }
    );
  }
}
