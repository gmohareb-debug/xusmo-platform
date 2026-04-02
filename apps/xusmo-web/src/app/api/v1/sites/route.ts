import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api/auth";

// =============================================================================
// GET /api/v1/sites — List user's sites (API key auth)
// =============================================================================

export async function GET(req: NextRequest) {
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
    const sites = await prisma.site.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        businessName: true,
        wpUrl: true,
        status: true,
        archetype: true,
        tier: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      sites: sites.map((s) => ({
        id: s.id,
        businessName: s.businessName,
        wpUrl: s.wpUrl,
        status: s.status,
        archetype: s.archetype,
        tier: s.tier,
        createdAt: s.createdAt.toISOString(),
        publishedAt: s.publishedAt?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    console.error("[api/v1/sites] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
