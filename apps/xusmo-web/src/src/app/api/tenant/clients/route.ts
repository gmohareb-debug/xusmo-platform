// =============================================================================
// Tenant Clients API — List and invite client sub-accounts
// Agency white-label: manage client members within a tenant
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireCapability } from "@/lib/auth/tenant-guard";
import { prisma } from "@/lib/db";
import type { TenantRole } from "@prisma/client";

// Roles that can be assigned to client sub-accounts
const CLIENT_ASSIGNABLE_ROLES: TenantRole[] = ["TENANT_ADMIN", "TENANT_CATALOG", "TENANT_OPS"];

// ---------------------------------------------------------------------------
// GET — list client accounts for this tenant
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.activeTenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireCapability(session.user.id, session.user.activeTenantId, "manage_settings");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.tenantMember.findMany({
    where: { tenantId: session.user.activeTenantId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.createdAt,
    }))
  );
}

// ---------------------------------------------------------------------------
// POST — invite a new client sub-account
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.activeTenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireCapability(session.user.id, session.user.activeTenantId, "manage_settings");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, role } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Validate role (default to TENANT_OPS if not specified or invalid)
  const assignedRole: TenantRole = CLIENT_ASSIGNABLE_ROLES.includes(role as TenantRole)
    ? (role as TenantRole)
    : "TENANT_OPS";

  // Find user by email
  const clientUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!clientUser) {
    return NextResponse.json(
      { error: "No user found with this email. The user must register first." },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId: session.user.activeTenantId,
        userId: clientUser.id,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member of this tenant" }, { status: 409 });
  }

  // Add as member
  const member = await prisma.tenantMember.create({
    data: {
      tenantId: session.user.activeTenantId,
      userId: clientUser.id,
      role: assignedRole,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      userId: member.userId,
      role: member.role,
      email: member.user.email,
      name: member.user.name,
    },
  });
}

// ---------------------------------------------------------------------------
// DELETE — remove a client sub-account
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.activeTenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireCapability(session.user.id, session.user.activeTenantId, "manage_settings");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findFirst({
    where: { id: memberId, tenantId: session.user.activeTenantId },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot remove tenant owner
  if (member.role === "TENANT_OWNER") {
    return NextResponse.json({ error: "Cannot remove tenant owner" }, { status: 403 });
  }

  await prisma.tenantMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
