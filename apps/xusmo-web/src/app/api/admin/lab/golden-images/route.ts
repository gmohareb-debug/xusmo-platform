// GET /api/admin/lab/golden-images — list GoldenImage
// POST /api/admin/lab/golden-images — create new golden image

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

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goldenImages = await prisma.goldenImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goldenImages);
  } catch (error) {
    console.error("[admin/lab/golden-images GET]", error);
    return NextResponse.json(
      { error: "Failed to load golden images" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      version,
      archetype,
      wpVersion,
      themeVersion,
      phpVersion,
      pluginCount,
      patternCount,
      pluginList,
    } = body;

    if (!version || !archetype) {
      return NextResponse.json(
        { error: "version and archetype are required" },
        { status: 400 }
      );
    }

    if (!["SERVICE", "VENUE", "PORTFOLIO", "COMMERCE"].includes(archetype)) {
      return NextResponse.json(
        { error: "Invalid archetype. Must be SERVICE, VENUE, PORTFOLIO, or COMMERCE." },
        { status: 400 }
      );
    }

    // Check for duplicate version
    const existing = await prisma.goldenImage.findUnique({
      where: { version },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Golden image with this version already exists" },
        { status: 409 }
      );
    }

    const goldenImage = await prisma.goldenImage.create({
      data: {
        version,
        archetype,
        wpVersion: wpVersion ?? null,
        themeVersion: themeVersion ?? null,
        phpVersion: phpVersion ?? null,
        pluginCount: pluginCount ?? null,
        patternCount: patternCount ?? null,
        pluginList: pluginList ?? null,
        status: "DRAFT",
      },
    });

    return NextResponse.json(goldenImage, { status: 201 });
  } catch (error) {
    console.error("[admin/lab/golden-images POST]", error);
    return NextResponse.json(
      { error: "Failed to create golden image" },
      { status: 500 }
    );
  }
}
