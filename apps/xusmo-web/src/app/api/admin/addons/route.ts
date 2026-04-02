// GET  /api/admin/addons — Return all add-ons with entitlement count, all bundles with items
// PUT  /api/admin/addons — Update add-on fields (price, description, isActive)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    const addOns = await prisma.addOn.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { entitlements: true } },
      },
    });

    const bundles = await prisma.bundle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { addOn: true },
        },
      },
    });

    return NextResponse.json({ addOns, bundles });
  } catch (error) {
    console.error("[admin/addons] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load add-ons" },
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
    const { id, ...updates } = body as {
      id: string;
      name?: string;
      description?: string;
      priceInCents?: number;
      isActive?: boolean;
      sortOrder?: number;
      category?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Only allow safe fields to be updated
    const allowedFields: Record<string, unknown> = {};
    if (updates.name !== undefined) allowedFields.name = updates.name;
    if (updates.description !== undefined) allowedFields.description = updates.description;
    if (updates.priceInCents !== undefined) allowedFields.priceInCents = updates.priceInCents;
    if (updates.isActive !== undefined) allowedFields.isActive = updates.isActive;
    if (updates.sortOrder !== undefined) allowedFields.sortOrder = updates.sortOrder;
    if (updates.category !== undefined) allowedFields.category = updates.category;

    const updated = await prisma.addOn.update({
      where: { id },
      data: allowedFields,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/addons] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update add-on" },
      { status: 500 }
    );
  }
}
