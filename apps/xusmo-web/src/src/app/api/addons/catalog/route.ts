// GET /api/addons/catalog — Public catalog of add-ons
// Query: ?archetype=SERVICE&industry=restaurant

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const archetype = searchParams.get("archetype");
  const industry = searchParams.get("industry");

  const addOns = await prisma.addOn.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Categorize by relevance
  const recommended: typeof addOns = [];
  const available: typeof addOns = [];

  for (const addon of addOns) {
    if (industry && addon.industries.includes(industry)) {
      recommended.push(addon);
    } else if (!archetype || addon.archetypes.includes(archetype)) {
      available.push(addon);
    }
  }

  // Fetch bundles with items
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    include: { items: { include: { addOn: true } } },
  });

  // Calculate savings for each bundle
  const bundlesWithSavings = bundles.map((b) => {
    const totalALaCarte = b.items.reduce((sum, item) => sum + item.addOn.priceInCents, 0);
    const discountedTotal = Math.round(totalALaCarte * (1 - b.discountPct / 100));
    return {
      ...b,
      totalALaCarte,
      discountedTotal,
      savingsInCents: totalALaCarte - discountedTotal,
    };
  });

  return NextResponse.json({ recommended, available, bundles: bundlesWithSavings });
}
