import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const build = await prisma.build.findUnique({
    where: { id },
    select: { archetype: true, industryId: true },
  });

  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  // Get industry info for tag matching
  const industry = build.industryId
    ? await prisma.industryDefault.findUnique({
        where: { id: build.industryId },
        select: { industryCode: true },
      })
    : null;

  // Find top 3 matching themes from the pool
  const themes = await prisma.themePoolEntry.findMany({
    where: {
      archetype: build.archetype ?? "SERVICE",
      status: "active",
    },
    orderBy: [{ usageCount: "desc" }, { rating: "desc" }],
    take: 3,
  });

  // If less than 3 themes for this archetype, pad with other archetypes
  if (themes.length < 3) {
    const more = await prisma.themePoolEntry.findMany({
      where: {
        status: "active",
        id: { notIn: themes.map((t) => t.id) },
      },
      orderBy: { usageCount: "desc" },
      take: 3 - themes.length,
    });
    themes.push(...more);
  }

  return NextResponse.json({
    variations: themes.map((t) => ({
      id: t.id,
      name: t.name,
      colors: t.colors,
      fonts: t.fonts,
      industryTags: t.industryTags,
      usageCount: t.usageCount,
    })),
  });
}
