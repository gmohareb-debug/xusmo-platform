// POST /api/auth/ensure-tenant
// Auto-provisions a tenant for authenticated users who don't have one.
// Called by Studio layout when session has no tenant context.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { autoProvisionForUser } from "@/lib/tenant/onboarding";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the real user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a tenant
    const existing = await prisma.tenantMember.findFirst({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json({ ok: true, message: "Tenant already exists" });
    }

    // Auto-provision
    const tenant = await autoProvisionForUser(user.id, session.user.email);
    if (!tenant) {
      return NextResponse.json(
        { error: "Failed to provision tenant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, tenantId: tenant.id });
  } catch (error) {
    console.error("[ensure-tenant]", error);
    return NextResponse.json(
      { error: "Failed to ensure tenant" },
      { status: 500 }
    );
  }
}
