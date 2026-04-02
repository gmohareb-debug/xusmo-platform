// =============================================================================
// Tenant Usage API — Returns metered usage data for the active tenant
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsage } from "@/lib/billing/usage";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.activeTenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.activeTenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      planName: true,
      siteLimit: true,
      storeLimit: true,
      productLimit: true,
      orderMonthlyLimit: true,
      featureFlags: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const [sites, stores, products, orders] = await Promise.all([
    getUsage(tenantId, "sites"),
    getUsage(tenantId, "stores"),
    getUsage(tenantId, "products"),
    getUsage(tenantId, "orders"),
  ]);

  return NextResponse.json({
    planName: tenant.planName,
    metrics: [
      { key: "sites", label: "Sites", used: sites, limit: tenant.siteLimit, icon: "globe" },
      { key: "stores", label: "E-Commerce Stores", used: stores, limit: tenant.storeLimit, icon: "store" },
      { key: "products", label: "Products", used: products, limit: tenant.productLimit, icon: "package" },
      { key: "orders", label: "Monthly Orders", used: orders, limit: tenant.orderMonthlyLimit, icon: "shopping-cart", resetsMonthly: true },
    ],
    featureFlags: tenant.featureFlags ?? {},
  });
}
