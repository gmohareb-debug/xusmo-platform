import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api/auth";

// =============================================================================
// GET /api/v1/sites/{siteId} — Get site details (API key auth)
// =============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  // Authenticate via API key
  const authHeader = req.headers.get("authorization");
  const user = await authenticateApiRequest(authHeader);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid API key via Authorization: Bearer {apiKey}" },
      { status: 401 }
    );
  }

  try {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
      include: {
        pages: {
          select: {
            id: true,
            slug: true,
            title: true,
            metaTitle: true,
            metaDesc: true,
            sortOrder: true,
            isRequired: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        themePoolEntry: {
          select: {
            id: true,
            name: true,
            slug: true,
            archetype: true,
            colors: true,
            fonts: true,
          },
        },
        domain: {
          select: {
            domainName: true,
            status: true,
            sslActive: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      site: {
        id: site.id,
        businessName: site.businessName,
        wpUrl: site.wpUrl,
        status: site.status,
        archetype: site.archetype,
        tier: site.tier,
        track: site.track,
        isEcommerce: site.isEcommerce,
        lighthouseScore: site.lighthouseScore,
        sslActive: site.sslActive,
        createdAt: site.createdAt.toISOString(),
        updatedAt: site.updatedAt.toISOString(),
        publishedAt: site.publishedAt?.toISOString() ?? null,
        pages: site.pages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          metaTitle: p.metaTitle,
          metaDesc: p.metaDesc,
          sortOrder: p.sortOrder,
          isRequired: p.isRequired,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        theme: site.themePoolEntry
          ? {
              id: site.themePoolEntry.id,
              name: site.themePoolEntry.name,
              slug: site.themePoolEntry.slug,
              archetype: site.themePoolEntry.archetype,
              colors: site.themePoolEntry.colors,
              fonts: site.themePoolEntry.fonts,
            }
          : null,
        domain: site.domain
          ? {
              domainName: site.domain.domainName,
              status: site.domain.status,
              sslActive: site.domain.sslActive,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[api/v1/sites/detail] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/v1/sites/{siteId} — Update site (limited fields, API key auth)
// =============================================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  // Authenticate via API key
  const authHeader = req.headers.get("authorization");
  const user = await authenticateApiRequest(authHeader);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid API key via Authorization: Bearer {apiKey}" },
      { status: 401 }
    );
  }

  try {
    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const body = await req.json();

    // Only allow updating a limited set of fields via public API
    const allowedFields: Record<string, boolean> = {
      businessName: true,
      customCss: true,
    };

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields[key]) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: `No valid fields to update. Allowed fields: ${Object.keys(allowedFields).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: updateData,
      select: {
        id: true,
        businessName: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      site: {
        id: updated.id,
        businessName: updated.businessName,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/v1/sites/detail] PUT Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
