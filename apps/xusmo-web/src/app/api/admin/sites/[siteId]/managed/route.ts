// POST /api/admin/sites/[siteId]/managed — upgrade to managed
// DELETE /api/admin/sites/[siteId]/managed — cancel managed

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await req.json();
    const { plan } = body;

    if (!plan || !["ESSENTIAL", "PREMIUM"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be ESSENTIAL or PREMIUM." },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: {
        managed: true,
        managedPlan: plan,
        managedStartedAt: new Date(),
        managedCanceledAt: null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      managed: updated.managed,
      managedPlan: updated.managedPlan,
      managedStartedAt: updated.managedStartedAt,
    });
  } catch (error) {
    console.error("[admin/sites/[siteId]/managed POST]", error);
    return NextResponse.json(
      { error: "Failed to upgrade to managed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: {
        managed: false,
        managedPlan: null,
        managedCanceledAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updated.id,
      managed: updated.managed,
      managedPlan: updated.managedPlan,
      managedCanceledAt: updated.managedCanceledAt,
    });
  } catch (error) {
    console.error("[admin/sites/[siteId]/managed DELETE]", error);
    return NextResponse.json(
      { error: "Failed to cancel managed service" },
      { status: 500 }
    );
  }
}
