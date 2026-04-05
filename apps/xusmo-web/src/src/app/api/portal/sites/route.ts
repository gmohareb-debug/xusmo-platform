// GET /api/portal/sites
// Returns all sites for the authenticated user with page details.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sites = await prisma.site.findMany({
      where: {
        OR: [
          { userId: user.id },
          { teamMembers: { some: { inviteeUserId: user.id, status: "ACCEPTED" } } },
        ],
      },
      include: {
        pages: {
          select: {
            id: true,
            slug: true,
            title: true,
            sortOrder: true,
            isRequired: true,
            metaTitle: true,
            metaDesc: true,
            heroHeadline: true,
            heroSubheadline: true,
            ctaLabel: true,
            bodyContent: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        build: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      sites.map((s) => ({
        id: s.id,
        businessName: s.businessName,
        status: s.status,
        wpUrl: s.wpUrl,
        tier: s.tier,
        archetype: s.archetype,
        isEcommerce: s.isEcommerce,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        pages: s.pages,
        buildId: s.build?.id ?? null,
        buildStatus: s.build?.status ?? null,
      }))
    );
  } catch (error) {
    console.error("[portal/sites]", error);
    return NextResponse.json(
      { error: "Failed to load sites" },
      { status: 500 }
    );
  }
}
