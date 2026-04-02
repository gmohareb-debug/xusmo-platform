<?php
namespace GDS\Agents;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Catalog Agent.
 * 
 * Responsible for data ingestion, normalization, and content enrichment.
 */
class CatalogAgent
{

    /**
     * Initialize the agent and register its callbacks.
     */
    public function init()
    {
        // Handled by JobOrchestrator to prevent duplicate execution.
    }

    /**
     * Process a supplier catalog import.
     * 
     * @param int|null $batch_id    Optional batch ID if already created.
     * @param int|null $supplier_id Optional supplier ID to process only one.
     */
    public function process_import($batch_id = null, $supplier_id = null)
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        if ($supplier_id) {
            $suppliers = array(\GDS\Core\SupplierManager::get_supplier($supplier_id));
        } else {
            $suppliers = \GDS\Core\SupplierManager::get_active_suppliers();
        }

        foreach ($suppliers as $supplier) {
            if (!$supplier)
                continue;

            // Enforce Plan Limits: Product Count
            global $wpdb;
            $table_products = $wpdb->prefix . 'gds_supplier_products';
            $current_product_count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM $table_products WHERE tenant_id = %s",
                $tenant_id
            ));

            if (!$registry->check_entitlement('product_limit', $current_product_count)) {
                error_log("[GDS Catalog Agent] Plan limit reached for tenant {$tenant_id}. Import aborted.");
                continue;
            }

            // Create a batch record if not provided.
            $current_batch_id = $batch_id ?: \GDS\Core\BatchManager::create_batch($supplier->id);

            error_log("[GDS Catalog Agent] Starting import for supplier: {$supplier->name} (Batch: $current_batch_id) [Store: {$store_connection_id}]");

            $connector = \GDS\Connectors\ConnectorFactory::make($supplier->connector_type, $supplier->config);

            if (!$connector) {
                \GDS\Core\BatchManager::update_batch($current_batch_id, array('status' => 'failed'));
                continue;
            }

            $catalog_data = $connector->fetch_catalog();
            $processed_count = 0;
            $failed_count = 0;

            foreach ($catalog_data as $item) {
                try {
                    $product_id = $this->upsert_product($supplier->id, $item, $current_batch_id, $store_connection_id);

                    if (!empty($item['variants'])) {
                        foreach ($item['variants'] as $variant) {
                            $this->upsert_variant($product_id, $variant, $store_connection_id);
                        }
                    }
                    $processed_count++;
                } catch (\Exception $e) {
                    error_log("[GDS Catalog Agent Error] " . $e->getMessage());
                    $failed_count++;
                }
            }

            // Update batch status.
            \GDS\Core\BatchManager::update_batch($current_batch_id, array(
                'status' => 'completed',
                'items_processed' => $processed_count,
                'items_failed' => $failed_count,
            ));

            // Trigger Pricing Agent to evaluate new/updated costs.
            do_action('gds_pricing_update_trigger', array());
        }
    }

    /**
     * Upsert a supplier product into orchestration staging.
     */
    private function upsert_product($supplier_id, $data, $batch_id, $store_connection_id)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_supplier_products';

        $is_private = isset($data['is_private']) ? (int) $data['is_private'] : 0;

        // --- PLATFORM-WIDE DEDUPLICATION PATTERN ---
        // Check if this supplier product exists *anywhere* in the Smart Engine 
        $global_existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, tenant_id FROM $table WHERE supplier_id = %d AND supplier_sku = %s",
            $supplier_id,
            $data['supplier_sku']
        ));

        if ($global_existing && $global_existing->tenant_id !== $tenant_id) {
            // Deduplication logic: If the user is trying to add this product as "Private"
            // but we already have it in the platform DB under another tenant...
            if ($is_private === 1) {
                throw new \Exception("Deduplication Alert: Product source ({$data['supplier_sku']}) already exists in the Smart Portal registry. Cannot import as strictly private.");
            }
        }

        // Now check if it exists for THIS specific tenant
        $existing_id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL) AND supplier_id = %d AND supplier_sku = %s",
            $tenant_id,
            $store_connection_id,
            $supplier_id,
            $data['supplier_sku']
        ));

        $db_data = array(
            'tenant_id' => $tenant_id,
            'store_connection_id' => $store_connection_id,
            'supplier_id' => $supplier_id,
            'supplier_sku' => $data['supplier_sku'],
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'category' => $data['category'] ?? '',
            'brand' => $data['brand'] ?? '',
            'image_urls' => maybe_serialize($data['image_urls'] ?? array()),
            'is_private' => $is_private,
            'last_import_batch_id' => $batch_id,
        );

        if ($existing_id) {
            $wpdb->update($table, $db_data, array('id' => $existing_id, 'tenant_id' => $tenant_id));
            return $existing_id;
        } else {
            $wpdb->insert($table, $db_data);
            return $wpdb->insert_id;
        }
    }

    /**
     * Upsert a supplier variant into orchestration staging.
     */
    private function upsert_variant($product_id, $data, $store_connection_id)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_supplier_variants';

        $existing_id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL) AND product_id = %d AND supplier_v_sku = %s",
            $tenant_id,
            $store_connection_id,
            $product_id,
            $data['supplier_v_sku']
        ));

        $db_data = array(
            'tenant_id' => $tenant_id,
            'store_connection_id' => $store_connection_id,
            'product_id' => $product_id,
            'supplier_v_sku' => $data['supplier_v_sku'],
            'cost' => $data['cost'],
            'stock_qty' => $data['stock_qty'],
            'currency' => $data['currency'] ?? 'USD',
            'supplier_origin' => $data['supplier_origin'] ?? null,
            'attributes' => maybe_serialize($data['attributes'] ?? array()),
        );

        if ($existing_id) {
            $wpdb->update($table, $db_data, array('id' => $existing_id, 'tenant_id' => $tenant_id));
        } else {
            $wpdb->insert($table, $db_data);
        }
    }
}
