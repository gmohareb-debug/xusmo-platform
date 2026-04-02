// =============================================================================
// Tenant-Scoped Settings (ported from Dropnex Settings.php)
// Each tenant gets isolated settings with sensible defaults.
// Usage: import { getTenantSettings, updateTenantSetting } from "@/lib/tenant/settings";
// =============================================================================

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Exact defaults from Dropnex Settings.php decision register
export const SETTING_DEFAULTS: Record<string, unknown> = {
  // Returns & RMA
  return_window_days: 30,
  non_returnable_categories: [],

  // Inventory
  safety_stock_buffer: 2,
  stale_inventory_threshold: 12, // hours
  stale_behavior: "out_of_stock", // "hide" | "keep_last" | "out_of_stock"
  backorders_enabled: false,
  handling_time_days: 2,
  split_orders_enabled: true,

  // Pricing
  default_markup_multiplier: 1.6,
  price_rounding_strategy: ".99",
  price_outlier_threshold: 40, // percent
  map_enforcement_enabled: true,

  // Order Processing
  po_submission_trigger: "processing",
  order_cancellation_window: 30, // minutes

  // Currency & FX
  store_display_currency: "USD",
  fx_conversion_mode: "manual", // "manual" | "free_api"
  fx_failure_policy: "freeze_last_known",
  fx_buffer_percent: 0,

  // Communications
  shipment_email_mode: "per_shipment", // "per_shipment" | "consolidated"
  guest_tracking_mode: "secure_token_link",
  email_po_fallback: true,

  // Data Retention
  log_retention_days: 60,
  audit_retention_days: 365,
  export_masking_enabled: true,
};

/**
 * Get all settings for a tenant, merged with defaults.
 * Mirrors Dropnex Settings.get() — defaults always apply as fallback.
 */
export async function getTenantSettings(
  tenantId: string
): Promise<Record<string, unknown>> {
  const record = await prisma.tenantSettings.findUnique({
    where: { tenantId },
  });

  const stored = (record?.settings ?? {}) as Record<string, unknown>;
  return { ...SETTING_DEFAULTS, ...stored };
}

/**
 * Get a single setting value for a tenant.
 */
export async function getTenantSetting(
  tenantId: string,
  key: string
): Promise<unknown> {
  const settings = await getTenantSettings(tenantId);
  return settings[key];
}

/**
 * Update a single setting for a tenant.
 * Mirrors Dropnex Settings.update().
 */
export async function updateTenantSetting(
  tenantId: string,
  key: string,
  value: unknown
): Promise<void> {
  const record = await prisma.tenantSettings.findUnique({
    where: { tenantId },
  });

  const current = (record?.settings ?? {}) as Record<string, unknown>;
  current[key] = value;

  await prisma.tenantSettings.upsert({
    where: { tenantId },
    create: { tenantId, settings: current as Prisma.InputJsonValue },
    update: { settings: current as Prisma.InputJsonValue },
  });
}

/**
 * Update multiple settings at once.
 */
export async function updateTenantSettings(
  tenantId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const record = await prisma.tenantSettings.findUnique({
    where: { tenantId },
  });

  const current = (record?.settings ?? {}) as Record<string, unknown>;
  const merged = { ...current, ...updates };

  await prisma.tenantSettings.upsert({
    where: { tenantId },
    create: { tenantId, settings: merged as Prisma.InputJsonValue },
    update: { settings: merged as Prisma.InputJsonValue },
  });
}
