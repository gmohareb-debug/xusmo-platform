// =============================================================================
// Tenant Team API — List, invite, update, remove tenant members
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireCapability } from "@/lib/auth/tenant-guard";
import { prisma } from "@/lib/db";
import type { TenantRole } from "@prisma/client";

const ASSIGNABLE_ROLES: TenantRole[] = ["TENANT_ADMIN", "TENANT_CATALOG", "TENANT_OPS"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.activeTenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireCapability(session.user.id, session.user.activeTenantId, "tenant_access");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.tenantMember.findMany({
    where: { tenantId: session.user.activeTenantId },
    include: {
      user: { select: { id: true, email: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      email: m.user.email,
      name: m.user.name,
      image: m.user.image,
    }))
  );
}

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
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${ASSIGNABLE_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: session.user.activeTenantId, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member of this tenant" }, { status: 409 });
  }

  const member = await prisma.tenantMember.create({
    data: {
      tenantId: session.user.activeTenantId,
      userId: user.id,
      role: role as TenantRole,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json({
    id: member.id,
    userId: member.userId,
    role: member.role,
    email: member.user.email,
    name: member.user.name,
  });
}

export async function PUT(req: NextRequest) {
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
  const { memberId, role } = body;

  if (!memberId || !role) {
    return NextResponse.json({ error: "memberId and role required" }, { status: 400 });
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findFirst({
    where: { id: memberId, tenantId: session.user.activeTenantId },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot change TENANT_OWNER role
  if (member.role === "TENANT_OWNER") {
    return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 });
  }

  await prisma.tenantMember.update({
    where: { id: memberId },
    data: { role: role as TenantRole },
  });

  return NextResponse.json({ success: true });
}

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

  if (member.role === "TENANT_OWNER") {
    return NextResponse.json({ error: "Cannot remove tenant owner" }, { status: 403 });
  }

  await prisma.tenantMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
