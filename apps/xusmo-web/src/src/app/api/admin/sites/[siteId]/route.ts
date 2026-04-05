// GET /api/admin/sites/[siteId]
// Full site detail including sitePlugins, healthChecks (last 10),
// wpCredential (exists boolean only), agentRuns (last 10).

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
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        domain: true,
        subscription: true,
        build: {
          select: {
            id: true,
            status: true,
            archetype: true,
            progress: true,
            currentAgent: true,
            totalLlmCost: true,
            totalBuildTime: true,
            createdAt: true,
            completedAt: true,
          },
        },
        sitePlugins: {
          orderBy: { installedAt: "desc" },
        },
        healthChecks: {
          take: 10,
          orderBy: { checkedAt: "desc" },
        },
        agentRuns: {
          take: 10,
          orderBy: { startedAt: "desc" },
          include: {
            agent: { select: { name: true, displayName: true } },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check if WP credentials exist without exposing them
    const wpCredentialExists = await prisma.wpCredential.findUnique({
      where: { siteId },
      select: { id: true },
    });

    return NextResponse.json({
      ...site,
      wpCredential: { exists: !!wpCredentialExists },
    });
  } catch (error) {
    console.error("[admin/sites/[siteId]]", error);
    return NextResponse.json(
      { error: "Failed to load site detail" },
      { status: 500 }
    );
  }
}
