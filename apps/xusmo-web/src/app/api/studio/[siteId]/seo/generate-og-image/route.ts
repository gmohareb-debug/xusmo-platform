// POST /api/studio/[siteId]/seo/generate-og-image — placeholder for OG image generation

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      imageUrl: null,
      message:
        "OG image generation will be available when Flux/Imagen API is configured",
    });
  } catch (error) {
    console.error("[studio/seo/generate-og-image POST]", error);
    return NextResponse.json(
      { error: "Failed to generate OG image" },
      { status: 500 }
    );
  }
}
