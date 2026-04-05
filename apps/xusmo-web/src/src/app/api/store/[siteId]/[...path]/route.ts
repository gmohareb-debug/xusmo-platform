// =============================================================================
// Store Proxy API — BFF Bridge to WordPress GDS REST API
// Proxies requests to the WordPress GDS plugin per-site.
// Adds X-GDS-Tenant-ID from StoreConnection.
// Validates tenant access before proxying.
//
// Routes: GET/POST/PUT/DELETE /api/store/:siteId/:path*
// Example: /api/store/abc123/suppliers → WP REST: /wp-json/gds/v1/suppliers
// =============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasCapability, type Capability } from "@/lib/auth/permissions";
import type { TenantRole } from "@prisma/client";

// Map GDS API paths to required capabilities
const PATH_CAPABILITIES: Record<string, Capability> = {
  suppliers: "manage_suppliers",
  imports: "manage_imports",
  products: "publish_catalog",
  pricing: "manage_pricing",
  orders: "manage_orders",
  rma: "manage_rmas",
  inventory: "manage_inventory",
  settings: "manage_settings",
  po: "manage_orders",
};

function getRequiredCapability(pathSegments: string[]): Capability {
  const root = pathSegments[0] ?? "";
  return PATH_CAPABILITIES[root] ?? "tenant_access";
}

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; path: string[] }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId, path } = await params;

  // Check tenant context
  const tenantId = session.user.activeTenantId;
  const role = session.user.activeTenantRole as TenantRole | undefined;
  if (!tenantId || !role) {
    return NextResponse.json(
      { error: "No active tenant" },
      { status: 403 }
    );
  }

  // Check capability for this path
  const requiredCap = getRequiredCapability(path);
  if (!hasCapability(role, requiredCap)) {
    return NextResponse.json(
      { error: `Insufficient permissions. Requires ${requiredCap}.` },
      { status: 403 }
    );
  }

  // Verify store connection exists and belongs to tenant
  const storeConnection = await prisma.storeConnection.findFirst({
    where: {
      siteId,
      tenantId,
      status: "ACTIVE",
    },
    include: {
      site: { select: { wpUrl: true } },
    },
  });

  if (!storeConnection) {
    return NextResponse.json(
      { error: "No active store connection for this site" },
      { status: 404 }
    );
  }

  // Build WordPress REST API URL
  const wpBaseUrl = storeConnection.site.wpUrl || storeConnection.storeUrl;
  const gdsPath = path.join("/");
  const wpUrl = `${wpBaseUrl}/wp-json/gds/v1/${gdsPath}`;

  // Forward query params
  const searchParams = req.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${wpUrl}?${searchParams}` : wpUrl;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-GDS-Tenant-ID": tenantId,
  };

  if (storeConnection.apiKey) {
    headers["X-GDS-API-Key"] = storeConnection.apiKey;
  }

  // Proxy the request
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Forward body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      try {
        const body = await req.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body or invalid JSON — continue without body
      }
    }

    const wpResponse = await fetch(fullUrl, fetchOptions);
    const data = await wpResponse.json();

    return NextResponse.json(data, { status: wpResponse.status });
  } catch (err) {
    console.error(
      `[store-proxy] Proxy error for ${req.method} ${gdsPath}:`,
      err
    );
    return NextResponse.json(
      { error: "Failed to connect to store" },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
