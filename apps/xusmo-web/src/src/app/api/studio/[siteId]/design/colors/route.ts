// POST /api/studio/[siteId]/design/colors — save custom color overrides

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { syncDesignToWordPress } from "@/lib/wordpress/sync";

// Valid hex color pattern
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

// All 8 theme color keys
const REQUIRED_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "textMuted",
  "border",
];

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
    const { colors } = body;

    if (!colors || typeof colors !== "object") {
      return NextResponse.json(
        { error: "colors object is required" },
        { status: 400 }
      );
    }

    // Validate all color values are valid hex codes
    for (const key of REQUIRED_KEYS) {
      const val = colors[key];
      if (!val || typeof val !== "string") {
        return NextResponse.json(
          { error: `Missing color value for "${key}"` },
          { status: 400 }
        );
      }
      if (!HEX_PATTERN.test(val)) {
        return NextResponse.json(
          { error: `Invalid hex color for "${key}": ${val}. Expected format: #RRGGBB` },
          { status: 400 }
        );
      }
    }

    // Build the sanitized color object (only the 8 known keys)
    const sanitizedColors: Record<string, string> = {};
    for (const key of REQUIRED_KEYS) {
      sanitizedColors[key] = colors[key];
    }

    // Find the site and its current themePoolEntry
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        themePoolEntryId: true,
        themePoolEntry: true,
        archetype: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Map our color keys to the ThemePoolEntry JSON format
    // ThemePoolEntry uses: primary, secondary, accent, bg, surface, text, textMuted, border
    const themeColors = {
      primary: sanitizedColors.primary,
      secondary: sanitizedColors.secondary,
      accent: sanitizedColors.accent,
      bg: sanitizedColors.background,
      surface: sanitizedColors.surface,
      text: sanitizedColors.text,
      textMuted: sanitizedColors.textMuted,
      border: sanitizedColors.border,
    };

    if (site.themePoolEntryId && site.themePoolEntry) {
      // Update colors on the existing ThemePoolEntry
      await prisma.themePoolEntry.update({
        where: { id: site.themePoolEntryId },
        data: { colors: themeColors },
      });
    } else {
      // No themePoolEntry — create a custom one for this site
      const entry = await prisma.themePoolEntry.create({
        data: {
          name: `Custom Colors - ${siteId.slice(0, 8)}`,
          slug: `custom-colors-${siteId.slice(0, 8)}-${Date.now()}`,
          archetype: site.archetype,
          colors: themeColors,
          fonts: {
            heading: "Inter",
            body: "Inter",
            headingWeight: "700",
            bodyWeight: "400",
            googleFontsUrl:
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
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

    // Clear any quick-style preset since user is now using custom colors
    await prisma.site.update({
      where: { id: siteId },
      data: { activePreset: null },
    });

    // Await sync so the preview can refresh with confidence
    try {
      await syncDesignToWordPress(siteId);
    } catch (err) {
      console.error("[studio/design/colors] WP sync failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[studio/design/colors POST]", error);
    return NextResponse.json(
      { error: "Failed to save colors" },
      { status: 500 }
    );
  }
}
