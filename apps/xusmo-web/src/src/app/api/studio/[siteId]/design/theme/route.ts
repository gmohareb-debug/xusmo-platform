// PATCH /api/studio/[siteId]/design/theme — updates designDocument.theme

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

export async function PATCH(
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
    const { colors, fonts, radius } = body;

    if (!colors && !fonts && radius === undefined) {
      return NextResponse.json(
        { error: "At least one of colors, fonts, or radius is required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { designDocument: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const doc = (site.designDocument as Record<string, unknown>) || {};
    const currentTheme = (doc.theme as Record<string, unknown>) || {};

    const updatedTheme: Record<string, unknown> = { ...currentTheme };

    if (colors && typeof colors === "object") {
      const currentColors = (currentTheme.colors as Record<string, string>) || {};
      updatedTheme.colors = { ...currentColors, ...colors };
    }

    if (fonts && typeof fonts === "object") {
      const currentFonts = (currentTheme.fonts as Record<string, string>) || {};
      updatedTheme.fonts = { ...currentFonts, ...fonts };
    }

    if (radius !== undefined) {
      updatedTheme.radius = String(radius);
    }

    await prisma.site.update({
      where: { id: siteId },
      data: {
        designDocument: { ...doc, theme: updatedTheme },
      },
    });

    return NextResponse.json({ ok: true, theme: updatedTheme });
  } catch (error) {
    console.error("[studio/design/theme PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}
