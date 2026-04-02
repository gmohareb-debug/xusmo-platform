// GET /api/revisions/[siteId]
// Returns all revisions for a site, ordered by most recent.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    // Verify user owns the site
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const revisions = await prisma.revision.findMany({
      where: { siteId },
      orderBy: { requestedAt: "desc" },
      select: {
        id: true,
        status: true,
        requestType: true,
        description: true,
        changesMade: true,
        pagesAffected: true,
        agentsUsed: true,
        llmCost: true,
        requestedAt: true,
        completedAt: true,
      },
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("[revisions/siteId]", error);
    return NextResponse.json(
      { error: "Failed to load revisions" },
      { status: 500 }
    );
  }
}
