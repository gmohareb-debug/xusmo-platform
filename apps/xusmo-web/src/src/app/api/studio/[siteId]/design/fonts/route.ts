// POST /api/studio/[siteId]/design/fonts — save custom font pair

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncDesignToWordPress } from "@/lib/wordpress/sync";

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
    const { heading, headingWeight, body: bodyFont, bodyWeight, googleFontsUrl } = body;

    // Validate required fields
    if (!heading || typeof heading !== "string") {
      return NextResponse.json(
        { error: "heading font is required" },
        { status: 400 }
      );
    }
    if (!bodyFont || typeof bodyFont !== "string") {
      return NextResponse.json(
        { error: "body font is required" },
        { status: 400 }
      );
    }

    // Find the site and its current themePoolEntry
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        themePoolEntryId: true,
        themePoolEntry: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (site.themePoolEntryId && site.themePoolEntry) {
      // Update the fonts in the existing ThemePoolEntry
      // First, read current fonts JSON and update it
      const currentFonts = site.themePoolEntry.fonts as Record<string, unknown>;
      const updatedFonts = {
        ...currentFonts,
        heading: heading,
        body: bodyFont,
        headingWeight: headingWeight || "700",
        bodyWeight: bodyWeight || "400",
        googleFontsUrl: googleFontsUrl || "",
      };

      await prisma.themePoolEntry.update({
        where: { id: site.themePoolEntryId },
        data: { fonts: updatedFonts },
      });
    } else {
      // No themePoolEntry — create a custom one for this site
      const entry = await prisma.themePoolEntry.create({
        data: {
          name: `Custom Fonts - ${siteId.slice(0, 8)}`,
          slug: `custom-fonts-${siteId.slice(0, 8)}-${Date.now()}`,
          archetype: "SERVICE",
          colors: {
            primary: "#1e40af",
            secondary: "#475569",
            accent: "#dc2626",
            background: "#ffffff",
            surface: "#f8fafc",
            text: "#0f172a",
            textMuted: "#64748b",
            border: "#e2e8f0",
          },
          fonts: {
            heading,
            body: bodyFont,
            headingWeight: headingWeight || "700",
            bodyWeight: bodyWeight || "400",
            googleFontsUrl: googleFontsUrl || "",
          },
          borderRadius: {
            small: "4px",
            medium: "6px",
            large: "12px",
            pill: "9999px",
          },
          buttonStyle: {
            borderRadius: "6px",
            paddingVertical: "0.75rem",
            paddingHorizontal: "1.75rem",
            fontSize: "0.9375rem",
            fontWeight: "600",
            textTransform: "none",
            letterSpacing: "0",
          },
          status: "active",
          isSystem: false,
        },
      });

      await prisma.site.update({
        where: { id: siteId },
        data: { themePoolEntryId: entry.id },
      });
    }

    // Await sync so the preview can refresh with confidence
    try {
      await syncDesignToWordPress(siteId);
    } catch (err) {
      console.error("[studio/design/fonts] WP sync failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[studio/design/fonts POST]", error);
    return NextResponse.json(
      { error: "Failed to save fonts" },
      { status: 500 }
    );
  }
}
