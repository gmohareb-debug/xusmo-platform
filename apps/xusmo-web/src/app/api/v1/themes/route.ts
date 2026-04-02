import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// =============================================================================
// GET /api/v1/themes — List available themes from pool (public, no auth)
// =============================================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Optional filters
  const archetype = searchParams.get("archetype"); // SERVICE, VENUE, PORTFOLIO, COMMERCE
  const tag = searchParams.get("tag"); // Industry tag filter
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0"), 0);
  const sort = searchParams.get("sort") ?? "popular"; // popular, newest, rating

  try {
    // Build query
    const where: Record<string, unknown> = { status: "active" };
    if (archetype) {
      const validArchetypes = ["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE"];
      if (!validArchetypes.includes(archetype)) {
        return NextResponse.json(
          { error: `Invalid archetype. Must be one of: ${validArchetypes.join(", ")}` },
          { status: 400 }
        );
      }
      where.archetype = archetype;
    }

    // Determine sort order
    let orderBy: Record<string, string>[];
    switch (sort) {
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;
      case "rating":
        orderBy = [{ rating: "desc" }, { usageCount: "desc" }];
        break;
      case "popular":
      default:
        orderBy = [{ usageCount: "desc" }, { rating: "desc" }];
        break;
    }

    const themes = await prisma.themePoolEntry.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
        archetype: true,
        industryTags: true,
        colors: true,
        fonts: true,
        borderRadius: true,
        buttonStyle: true,
        sectionPadding: true,
        contentSize: true,
        wideSize: true,
        headingSizes: true,
        previewUrl: true,
        thumbnailUrl: true,
        usageCount: true,
        rating: true,
        isSystem: true,
        createdAt: true,
        // Exclude: createdBy, status, updatedAt (internal fields)
      },
    });

    // Post-filter by tag if provided (JSON field search)
    let filteredThemes = themes;
    if (tag) {
      const t = tag.toLowerCase();
      filteredThemes = themes.filter((theme) => {
        const tags = theme.industryTags as string[] | null;
        return tags?.some((tagItem) => tagItem.toLowerCase().includes(t));
      });
    }

    // Get total count for pagination
    const total = await prisma.themePoolEntry.count({ where });

    return NextResponse.json({
      themes: filteredThemes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        archetype: t.archetype,
        industryTags: t.industryTags,
        colors: t.colors,
        fonts: t.fonts,
        borderRadius: t.borderRadius,
        buttonStyle: t.buttonStyle,
        sectionPadding: t.sectionPadding,
        contentSize: t.contentSize,
        wideSize: t.wideSize,
        headingSizes: t.headingSizes,
        previewUrl: t.previewUrl,
        thumbnailUrl: t.thumbnailUrl,
        usageCount: t.usageCount,
        rating: t.rating,
        isSystem: t.isSystem,
        createdAt: t.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error("[api/v1/themes] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
