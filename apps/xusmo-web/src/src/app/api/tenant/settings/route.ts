// =============================================================================
// Tenant Settings API — GET/PUT settings for the active tenant
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireCapability } from "@/lib/auth/tenant-guard";
import { getTenantSettings, updateTenantSetting, updateTenantSettings } from "@/lib/tenant/settings";

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

  const settings = await getTenantSettings(session.user.activeTenantId);
  return NextResponse.json(settings);
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

  // Support both single update { key, value } and bulk { updates: { key: value, ... } }
  if (body.key && body.value !== undefined) {
    await updateTenantSetting(session.user.activeTenantId, body.key, body.value);
  } else if (body.updates && typeof body.updates === "object") {
    await updateTenantSettings(session.user.activeTenantId, body.updates);
  } else {
    return NextResponse.json({ error: "key/value or updates required" }, { status: 400 });
  }

  const settings = await getTenantSettings(session.user.activeTenantId);
  return NextResponse.json(settings);
}
