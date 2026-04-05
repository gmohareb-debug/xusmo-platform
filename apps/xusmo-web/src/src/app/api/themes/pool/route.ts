import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/themes/pool — List themes with optional filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const archetype = searchParams.get("archetype"); // SERVICE, VENUE, etc.
  const search = searchParams.get("search");

  const where: any = { status: "active" };
  if (archetype) where.archetype = archetype;

  const themes = await prisma.themePoolEntry.findMany({
    where,
    orderBy: [{ usageCount: "desc" }, { rating: "desc" }],
  });

  // Filter by search term if provided (search name and industryTags)
  let filtered = themes;
  if (search) {
    const s = search.toLowerCase();
    filtered = themes.filter((t) =>
      t.name.toLowerCase().includes(s) ||
      (t.industryTags as string[] ?? []).some((tag: string) => tag.includes(s))
    );
  }

  return NextResponse.json(filtered);
}
