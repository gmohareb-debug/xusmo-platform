// GET /api/admin/lab/patterns — list BlockPattern
// POST /api/admin/lab/patterns — create new pattern
// PUT /api/admin/lab/patterns — update/promote pattern status

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

    const patterns = await prisma.blockPattern.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    console.error("[admin/lab/patterns GET]", error);
    return NextResponse.json(
      { error: "Failed to load patterns" },
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
    const { slug, name, category, htmlCode, preview, archetypes, industries, version } = body;

    if (!slug || !name || !htmlCode) {
      return NextResponse.json(
        { error: "slug, name, and htmlCode are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.blockPattern.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Pattern with this slug already exists" },
        { status: 409 }
      );
    }

    const pattern = await prisma.blockPattern.create({
      data: {
        slug,
        name,
        category: category ?? null,
        htmlCode,
        preview: preview ?? null,
        archetypes: archetypes ?? null,
        industries: industries ?? null,
        version: version ?? "1.0",
        status: "DRAFT",
      },
    });

    return NextResponse.json(pattern, { status: 201 });
  } catch (error) {
    console.error("[admin/lab/patterns POST]", error);
    return NextResponse.json(
      { error: "Failed to create pattern" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, name, category, htmlCode, preview, archetypes, industries, version } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Pattern id is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.blockPattern.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pattern not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (htmlCode !== undefined) updateData.htmlCode = htmlCode;
    if (preview !== undefined) updateData.preview = preview;
    if (archetypes !== undefined) updateData.archetypes = archetypes;
    if (industries !== undefined) updateData.industries = industries;
    if (version !== undefined) updateData.version = version;

    const updated = await prisma.blockPattern.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/lab/patterns PUT]", error);
    return NextResponse.json(
      { error: "Failed to update pattern" },
      { status: 500 }
    );
  }
}
