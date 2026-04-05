// =============================================================================
// POST /api/sites/:siteId/ecommerce/enable
// Enables WooCommerce + Dropnex GDS on a site.
// Requires tenant_access + manage_apps capability.
// =============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enableEcommerce } from "@/lib/wordpress/ecommerce";
import { hasCapability } from "@/lib/auth/permissions";
import type { TenantRole } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;

  // Check tenant context
  const tenantId = session.user.activeTenantId;
  const role = session.user.activeTenantRole as TenantRole | undefined;
  if (!tenantId || !role) {
    return NextResponse.json(
      { error: "No active tenant. Please select a tenant." },
      { status: 403 }
    );
  }

  // Require manage_apps capability
  if (!hasCapability(role, "manage_apps")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Requires manage_apps capability." },
      { status: 403 }
    );
  }

  try {
    const result = await enableEcommerce(siteId, tenantId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enable e-commerce";
    const status = message.includes("limit") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
