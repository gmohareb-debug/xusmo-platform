// =============================================================================
// Tenant Branding API — GET/PUT white-label branding for the active tenant
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireCapability } from "@/lib/auth/tenant-guard";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET — fetch tenant branding
// ---------------------------------------------------------------------------

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

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.activeTenantId },
    select: { id: true, slug: true, domain: true, settings: true },
  });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Branding lives inside TenantSettings.settings JSON under the "branding" key
  const tenantSettings = await prisma.tenantSettings.findUnique({
    where: { tenantId: tenant.id },
  });

  const settings = (tenantSettings?.settings as Record<string, unknown>) ?? {};
  const branding = (settings.branding as Record<string, unknown>) ?? {};

  return NextResponse.json({
    tenantId: tenant.id,
    slug: tenant.slug,
    branding: {
      logoUrl: branding.logoUrl ?? null,
      primaryColor: branding.primaryColor ?? "#6366f1",
      companyName: branding.companyName ?? tenant.slug,
      supportEmail: branding.supportEmail ?? null,
      customDomain: tenant.domain ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// PUT — update tenant branding
// ---------------------------------------------------------------------------

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
  const { logoUrl, primaryColor, companyName, supportEmail, customDomain } = body;

  const tenantId = session.user.activeTenantId;

  // Read current settings
  const existing = await prisma.tenantSettings.findUnique({
    where: { tenantId },
  });

  const currentSettings = (existing?.settings as Record<string, unknown>) ?? {};
  const currentBranding = (currentSettings.branding as Record<string, unknown>) ?? {};

  // Merge branding updates (only update provided fields)
  const updatedBranding = {
    ...currentBranding,
    ...(logoUrl !== undefined ? { logoUrl } : {}),
    ...(primaryColor !== undefined ? { primaryColor } : {}),
    ...(companyName !== undefined ? { companyName } : {}),
    ...(supportEmail !== undefined ? { supportEmail } : {}),
    ...(customDomain !== undefined ? { customDomain } : {}),
  };

  const updatedSettings = {
    ...currentSettings,
    branding: updatedBranding,
  };

  await prisma.tenantSettings.upsert({
    where: { tenantId },
    create: {
      tenantId,
      settings: updatedSettings as Prisma.InputJsonValue,
    },
    update: {
      settings: updatedSettings as Prisma.InputJsonValue,
    },
  });

  // If customDomain is being updated, also update the Tenant.domain field
  if (customDomain !== undefined) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { domain: customDomain || null },
    });
  }

  return NextResponse.json({
    success: true,
    branding: updatedBranding,
  });
}
