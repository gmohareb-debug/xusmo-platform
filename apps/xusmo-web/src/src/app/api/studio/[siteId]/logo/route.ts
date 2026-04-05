// =============================================================================
// Logo Upload & Retrieval API
// POST /api/studio/[siteId]/logo — Upload a logo image (multipart/form-data)
// GET  /api/studio/[siteId]/logo — Return the current logo for a site
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { extractColorsFromImage } from "@/lib/logo/color-extract";

// ---------------------------------------------------------------------------
// POST — upload logo
// ---------------------------------------------------------------------------

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

    const formData = await req.formData();
    const file = formData.get("logo") as File;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Save file to disk
    const ext = file.name.split(".").pop() || "png";
    const filename = `logo-${Date.now()}.${ext}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "logos",
      siteId
    );
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/logos/${siteId}/${filename}`;

    // Extract colors (skip for SVG)
    let dominantColors: Array<{ hex: string; population: number }> | null = null;
    if (file.type !== "image/svg+xml") {
      try {
        dominantColors = await extractColorsFromImage(buffer);
      } catch (e) {
        console.warn("[logo] Color extraction failed:", e);
      }
    }

    // Cast for Prisma JSON field
    const colorsJson = dominantColors
      ? (JSON.parse(JSON.stringify(dominantColors)) as Parameters<typeof prisma.siteLogo.create>[0]["data"]["dominantColors"])
      : undefined;

    // Upsert SiteLogo record
    await prisma.siteLogo.upsert({
      where: { siteId },
      create: {
        siteId,
        type: "uploaded",
        url,
        dominantColors: colorsJson,
        width: null,
        height: null,
      },
      update: { type: "uploaded", url, dominantColors: colorsJson },
    });

    return NextResponse.json({ success: true, url, dominantColors });
  } catch (error) {
    console.error("[studio/logo/upload]", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — return current logo
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const logo = await prisma.siteLogo.findUnique({ where: { siteId } });
    return NextResponse.json(logo);
  } catch (error) {
    console.error("[studio/logo/get]", error);
    return NextResponse.json(
      { error: "Failed to load logo" },
      { status: 500 }
    );
  }
}
