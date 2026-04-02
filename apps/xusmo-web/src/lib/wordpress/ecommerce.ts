// =============================================================================
// E-Commerce Provisioning
// Enables WooCommerce + Dropnex GDS plugin on a site.
// This is an optional add-on — not auto-installed.
// Usage: import { enableEcommerce } from "@/lib/wordpress/ecommerce";
// =============================================================================

import { prisma } from "@/lib/db";
import { canPerform, recordUsage } from "@/lib/billing/usage";
import { getExecutor } from "@/lib/wordpress/ssh";

// ---------------------------------------------------------------------------
// Enable e-commerce on a site
// ---------------------------------------------------------------------------

export async function enableEcommerce(
  siteId: string,
  tenantId: string
): Promise<{ storeConnectionId: string; success: boolean }> {
  // 1. Check entitlement: can tenant add another store?
  const allowed = await canPerform(tenantId, "stores");
  if (!allowed) {
    throw new Error(
      "Store limit reached for your plan. Upgrade to add more stores."
    );
  }

  // 2. Verify site belongs to this tenant
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
  });

  if (site.tenantId !== tenantId) {
    throw new Error("Site does not belong to this tenant.");
  }

  if (site.isEcommerce) {
    throw new Error("E-commerce is already enabled on this site.");
  }

  const wp = getExecutor(siteId);

  // 3. Install & activate WooCommerce
  try {
    await wp.execute("plugin install woocommerce --activate", 120_000);
    console.log(`[ecommerce] WooCommerce installed and activated for site ${siteId}`);
  } catch (err) {
    // May already be installed — try just activating
    try {
      await wp.execute("plugin activate woocommerce");
    } catch {
      throw new Error(
        `Failed to install WooCommerce: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  }

  // 4. Activate Dropnex GDS plugin
  try {
    await wp.execute("plugin activate generic-dropshipping-suite");
    console.log(`[ecommerce] GDS plugin activated for site ${siteId}`);
  } catch (err) {
    console.error("[ecommerce] GDS activation error:", err);
    throw new Error(
      `Failed to activate GDS plugin: ${err instanceof Error ? err.message : "unknown"}`
    );
  }

  // 5. Configure default GDS settings for tenant
  const gdsConfig = JSON.stringify({
    tenant_id: tenantId,
    site_id: siteId,
    default_markup_multiplier: 1.6,
    price_rounding_strategy: ".99",
    safety_stock_buffer: 2,
    auto_publish: false,
  });

  await wp.execute(
    `option update gds_tenant_config '${gdsConfig.replace(/'/g, "'\\''")}' --format=json`
  );

  // 6. Run GDS schema creation (the plugin creates its own tables on activation)
  // This happens automatically via the plugin's activation hook, but we can trigger it
  try {
    await wp.execute(
      "eval 'do_action(\"gds_ensure_schema\");'"
    );
  } catch {
    // Schema hook may not exist — tables created on activation
    console.log("[ecommerce] GDS schema action not found — tables created on activation");
  }

  // 7. Create StoreConnection record
  const siteUrl = site.wpUrl || "";
  const storeConnection = await prisma.storeConnection.create({
    data: {
      siteId,
      tenantId,
      storeUrl: siteUrl,
      status: "ACTIVE",
      plan: "starter",
    },
  });

  // 8. Mark site as e-commerce
  await prisma.site.update({
    where: { id: siteId },
    data: { isEcommerce: true },
  });

  // 9. Record usage
  await recordUsage(tenantId, "stores");

  // 10. Audit log
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "ecommerce_enabled",
      component: "ecommerce",
      objectType: "site",
      objectId: siteId,
      details: {
        storeConnectionId: storeConnection.id,
        siteUrl,
      },
    },
  });

  console.log(
    `[ecommerce] E-commerce enabled for site ${siteId}, store connection ${storeConnection.id}`
  );

  return {
    storeConnectionId: storeConnection.id,
    success: true,
  };
}

// ---------------------------------------------------------------------------
// Disable e-commerce on a site
// ---------------------------------------------------------------------------

export async function disableEcommerce(
  siteId: string,
  tenantId: string
): Promise<void> {
  // Verify ownership
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
  });

  if (site.tenantId !== tenantId) {
    throw new Error("Site does not belong to this tenant.");
  }

  // Deactivate plugins (don't uninstall — preserves data)
  const wp = getExecutor(siteId);
  try {
    await wp.execute("plugin deactivate generic-dropshipping-suite");
    await wp.execute("plugin deactivate woocommerce");
  } catch {
    // Non-fatal
  }

  // Update store connections
  await prisma.storeConnection.updateMany({
    where: { siteId, tenantId },
    data: { status: "ARCHIVED" },
  });

  // Mark site
  await prisma.site.update({
    where: { id: siteId },
    data: { isEcommerce: false },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "ecommerce_disabled",
      component: "ecommerce",
      objectType: "site",
      objectId: siteId,
    },
  });
}
