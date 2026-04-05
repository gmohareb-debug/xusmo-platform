// GET /api/admin/lab/plugins — list PluginCatalog
// POST /api/admin/lab/plugins — create new plugin catalog entry
// PUT /api/admin/lab/plugins — update plugin status

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

    const plugins = await prisma.pluginCatalog.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { sitePlugins: true } },
      },
    });

    return NextResponse.json(
      plugins.map((p) => ({
        ...p,
        installedSites: p._count.sitePlugins,
      }))
    );
  } catch (error) {
    console.error("[admin/lab/plugins GET]", error);
    return NextResponse.json(
      { error: "Failed to load plugin catalog" },
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
    const { slug, name, category, riskLevel, isRequired, testedVersion, testNotes } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "slug and name are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.pluginCatalog.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Plugin with this slug already exists" },
        { status: 409 }
      );
    }

    const plugin = await prisma.pluginCatalog.create({
      data: {
        slug,
        name,
        category: category ?? null,
        riskLevel: riskLevel ?? "LOW",
        isRequired: isRequired ?? false,
        testedVersion: testedVersion ?? null,
        testNotes: testNotes ?? null,
        status: "EVALUATING",
      },
    });

    return NextResponse.json(plugin, { status: 201 });
  } catch (error) {
    console.error("[admin/lab/plugins POST]", error);
    return NextResponse.json(
      { error: "Failed to create plugin catalog entry" },
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
    const { id, status, riskLevel, testedVersion, testResult, testNotes, isBanned, latestVersion } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Plugin id is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.pluginCatalog.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
    if (testedVersion !== undefined) {
      updateData.testedVersion = testedVersion;
      updateData.lastTestedAt = new Date();
    }
    if (testResult !== undefined) updateData.testResult = testResult;
    if (testNotes !== undefined) updateData.testNotes = testNotes;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (latestVersion !== undefined) updateData.latestVersion = latestVersion;

    const updated = await prisma.pluginCatalog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/lab/plugins PUT]", error);
    return NextResponse.json(
      { error: "Failed to update plugin catalog" },
      { status: 500 }
    );
  }
}
