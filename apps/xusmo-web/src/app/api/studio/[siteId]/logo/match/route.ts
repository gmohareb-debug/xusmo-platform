// =============================================================================
// Logo Color — Theme Match API
// GET /api/studio/[siteId]/logo/match
// Returns theme pool entries ranked by color similarity to the site's logo.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { matchThemeToColors } from "@/lib/logo/color-match";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const logo = await prisma.siteLogo.findUnique({ where: { siteId } });

    if (!logo?.dominantColors) {
      return NextResponse.json({
        matches: [],
        message: "No logo colors found",
      });
    }

    const matches = await matchThemeToColors(
      logo.dominantColors as { hex: string; population: number }[]
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[studio/logo/match]", error);
    return NextResponse.json(
      { error: "Failed to match themes" },
      { status: 500 }
    );
  }
}
