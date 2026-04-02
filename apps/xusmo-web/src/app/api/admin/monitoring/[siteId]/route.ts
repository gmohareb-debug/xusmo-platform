// GET /api/admin/monitoring/[siteId]
// Returns latest health report for a site.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkSiteHealth } from "@/lib/monitoring/checker";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
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

    const { siteId } = await params;
    const report = await checkSiteHealth(siteId);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[admin/monitoring/siteId]", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
