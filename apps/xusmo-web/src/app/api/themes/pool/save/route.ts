import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractAndSaveTheme } from "@/lib/flywheel/enrich";

// POST /api/themes/pool/save — Save a theme configuration to the pool
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    siteId,
    archetype,
    industryTags,
    colors,
    fonts,
    borderRadius,
    buttonStyle,
    sectionPadding,
    contentSize,
    wideSize,
    headingSizes,
  } = body;

  // Validate required fields
  if (!name || !archetype || !colors || !fonts || !borderRadius || !buttonStyle) {
    return NextResponse.json(
      {
        error: "Missing required fields: name, archetype, colors, fonts, borderRadius, buttonStyle",
      },
      { status: 400 }
    );
  }

  // Validate archetype
  const validArchetypes = ["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE"];
  if (!validArchetypes.includes(archetype)) {
    return NextResponse.json(
      { error: `Invalid archetype. Must be one of: ${validArchetypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If siteId provided, verify ownership and extract industry tags from site
  let finalIndustryTags = industryTags ?? [];
  if (siteId) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: user.id },
      select: { industryId: true, archetype: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Use site's industry as a tag if not already provided
    if (finalIndustryTags.length === 0 && site.industryId) {
      finalIndustryTags = [site.industryId];
    }
  }

  // Attempt to save the theme (with uniqueness check)
  const result = await extractAndSaveTheme({
    name,
    archetype,
    industryTags: finalIndustryTags,
    colors,
    fonts,
    borderRadius,
    buttonStyle,
    sectionPadding,
    contentSize,
    wideSize,
    headingSizes,
    createdBy: user.id,
  });

  if (!result.saved) {
    return NextResponse.json(
      { error: result.reason, saved: false },
      { status: 409 }
    );
  }

  // If siteId was provided, link the new theme to the site
  if (siteId && result.themeId) {
    await prisma.site.update({
      where: { id: siteId },
      data: { themePoolEntryId: result.themeId },
    });
  }

  return NextResponse.json({
    saved: true,
    themeId: result.themeId,
  });
}
