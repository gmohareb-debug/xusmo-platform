// =============================================================================
// Metered Billing Engine (ported from Dropnex BillingEngine)
// Tracks per-tenant usage against plan limits on a monthly basis.
// Usage: import { canPerform, recordUsage } from "@/lib/billing/usage";
// =============================================================================

import { prisma } from "@/lib/db";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Map metric names to Tenant model fields for limit lookup
const LIMIT_FIELDS: Record<string, string> = {
  orders: "orderMonthlyLimit",
  stores: "storeLimit",
  products: "productLimit",
  sites: "siteLimit",
};

/**
 * Check if a tenant can perform an action (pre-billing check).
 * Mirrors Dropnex BillingEngine.can_perform().
 * Returns true if usage + increment <= limit. Limit of 0 = unlimited.
 */
export async function canPerform(
  tenantId: string,
  metric: string,
  increment = 1
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return false;

  // Check numeric limit field
  const limitField = LIMIT_FIELDS[metric];
  if (limitField) {
    const limit = (tenant as Record<string, unknown>)[limitField] as number;
    if (limit <= 0) return true; // 0 = unlimited

    const usage = await getUsage(tenantId, metric);
    return usage + increment <= limit;
  }

  // Check feature flags for non-numeric features
  const flags = (tenant.featureFlags ?? {}) as Record<string, boolean>;
  if (metric in flags) {
    return flags[metric] === true;
  }

  // Unknown metric — allow by default
  return true;
}

/**
 * Record usage increment for a metric in the current month.
 * Mirrors Dropnex BillingEngine.record_usage().
 */
export async function recordUsage(
  tenantId: string,
  metric: string,
  count = 1
): Promise<void> {
  const month = currentMonth();

  await prisma.usageRecord.upsert({
    where: {
      tenantId_metric_month: { tenantId, metric, month },
    },
    create: { tenantId, metric, month, count },
    update: { count: { increment: count } },
  });
}

/**
 * Get current month usage for a metric.
 * Mirrors Dropnex BillingEngine.get_usage().
 */
export async function getUsage(
  tenantId: string,
  metric: string
): Promise<number> {
  const month = currentMonth();

  const record = await prisma.usageRecord.findUnique({
    where: {
      tenantId_metric_month: { tenantId, metric, month },
    },
  });

  return record?.count ?? 0;
}

/**
 * Check entitlement — feature flag or numeric limit.
 * Mirrors Dropnex TenantRegistry.check_entitlement().
 */
export async function checkEntitlement(
  tenantId: string,
  key: string,
  currentCount?: number
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return false;

  // Check feature flags
  const flags = (tenant.featureFlags ?? {}) as Record<string, boolean>;
  if (key in flags) {
    return flags[key] === true;
  }

  // Check numeric limits
  const limitField = LIMIT_FIELDS[key];
  if (limitField && currentCount !== undefined) {
    const limit = (tenant as Record<string, unknown>)[limitField] as number;
    if (limit <= 0) return true; // unlimited
    return currentCount < limit;
  }

  return true;
}
