// POST /api/studio/[siteId]/design/apply-preset — apply a design preset

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncDesignToWordPress } from "@/lib/wordpress/sync";

const PRESETS: Record<string, { primary: string; accent: string; font: string; radius: string }> = {
  professional: { primary: "#1e3a8a", accent: "#3b82f6", font: "Inter", radius: "8px" },
  bold: { primary: "#09090b", accent: "#dc2626", font: "Oswald", radius: "0px" },
  elegant: { primary: "#7c2d12", accent: "#b45309", font: "Playfair Display", radius: "4px" },
  minimal: { primary: "#18181b", accent: "#3b82f6", font: "Syne", radius: "0px" },
  warm: { primary: "#78350f", accent: "#d97706", font: "Nunito", radius: "16px" },
};

const VALID_PRESETS = Object.keys(PRESETS);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const session = await getServerSession(authOptions);
    const auth = await getStudioAuth(session?.user?.email, siteId, "edit");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preset } = body;

    if (!preset || !VALID_PRESETS.includes(preset)) {
      return NextResponse.json(
        { error: `Invalid preset. Must be one of: ${VALID_PRESETS.join(", ")}` },
        { status: 400 }
      );
    }

    const tokens = PRESETS[preset];

    await prisma.site.update({
      where: { id: siteId },
      data: { activePreset: preset },
    });

    // Await sync so the client can show accurate feedback
    let syncWarning: string | null = null;
    try {
      await syncDesignToWordPress(siteId);
    } catch (err) {
      console.error("[studio/design/apply-preset] WP sync failed:", err);
      syncWarning = err instanceof Error ? err.message : "Sync failed";
    }

    return NextResponse.json({
      ok: true,
      preset,
      tokens,
      ...(syncWarning ? { syncWarning } : {}),
    });
  } catch (error) {
    console.error("[studio/design/apply-preset POST]", error);
    return NextResponse.json(
      { error: "Failed to apply preset" },
      { status: 500 }
    );
  }
}
