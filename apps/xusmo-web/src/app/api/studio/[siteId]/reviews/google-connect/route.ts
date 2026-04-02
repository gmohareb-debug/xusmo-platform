// POST /api/studio/[siteId]/reviews/google-connect — placeholder for Google Reviews import
// TODO: Implement when Google Places API is configured

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

    // Placeholder — will be replaced with actual Google Places API integration
    return NextResponse.json({
      message: "Google Reviews import initiated",
      imported: 0,
    });
  } catch (error) {
    console.error("[studio/reviews/google-connect POST]", error);
    return NextResponse.json(
      { error: "Failed to initiate Google Reviews import" },
      { status: 500 }
    );
  }
}
