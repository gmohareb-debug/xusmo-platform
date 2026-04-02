// =============================================================================
// Admin Tenants API — List and manage all tenants (platform admin only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasCapability } from "@/lib/auth/permissions";
import type { TenantRole } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeTenantRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasCapability(session.user.activeTenantRole as TenantRole, "manage_tenants")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: { select: { members: true, sites: true, stores: true } },
      members: {
        where: { role: { in: ["TENANT_OWNER", "PLATFORM_OWNER"] } },
        include: { user: { select: { email: true, name: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = tenants.map((t) => ({
    id: t.id,
    slug: t.slug,
    domain: t.domain,
    planName: t.planName,
    status: t.status,
    createdAt: t.createdAt,
    siteLimit: t.siteLimit,
    storeLimit: t.storeLimit,
    productLimit: t.productLimit,
    orderMonthlyLimit: t.orderMonthlyLimit,
    memberCount: t._count.members,
    siteCount: t._count.sites,
    storeCount: t._count.stores,
    ownerEmail: t.members[0]?.user?.email ?? null,
    ownerName: t.members[0]?.user?.name ?? null,
  }));

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeTenantRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasCapability(session.user.activeTenantRole as TenantRole, "manage_tenants")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { tenantId, updates } = body;

  if (!tenantId || !updates) {
    return NextResponse.json({ error: "tenantId and updates required" }, { status: 400 });
  }

  const allowedFields = ["planName", "status", "siteLimit", "storeLimit", "productLimit", "orderMonthlyLimit"];
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      data[key] = updates[key];
    }
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data,
  });

  return NextResponse.json(tenant);
}
