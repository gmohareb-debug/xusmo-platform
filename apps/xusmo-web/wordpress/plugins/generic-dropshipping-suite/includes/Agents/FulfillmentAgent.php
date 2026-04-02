<?php
namespace GDS\Agents;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fulfillment Agent.
 * 
 * Responsible for order routing, PO creation, and tracking synchronization.
 */
class FulfillmentAgent
{

    public function init()
    {
        // Hook into status changes to respect the po_submission_trigger policy.
        add_action('woocommerce_order_status_changed', array($this, 'on_order_status_changed'), 10, 3);
    }

    /**
     * Handle order status changes and trigger routing if policy matches.
     */
    public function on_order_status_changed($order_id, $from, $to)
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();

        // Enforce Plan Limits: Monthly Order Count
        global $wpdb;
        $table_pos = $wpdb->prefix . 'gds_purchase_orders';
        $current_month_start = date('Y-m-01 00:00:00');
        $order_count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT order_id) FROM $table_pos WHERE tenant_id = %s AND created_at >= %s",
            $tenant_id,
            $current_month_start
        ));

        if (!$registry->check_entitlement('order_monthly_limit', $order_count)) {
            error_log("[GDS Fulfillment Agent] Plan order limit reached for tenant {$tenant_id}. Fulfillment paused.");
            return;
        }

        $trigger = \GDS\Core\Settings::get('po_submission_trigger') ?: 'processing';

        if ($to === $trigger) {
            $this->route_order($order_id);
        }
    }

    /**
     * Route an order to the appropriate supplier(s).
     * 
     * @param int $order_id WooCommerce Order ID.
     */
    public function route_order($order_id)
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        error_log("[GDS Fulfillment Agent] Routing order: $order_id [Tenant: $tenant_id, Store: $store_connection_id]");

        $order = wc_get_order($order_id);
        if (!$order)
            return;

        // Security check: Ensure order belongs to this tenant context
        $order_tenant_id = $order->get_meta('_gds_tenant_id', true);
        if ($order_tenant_id && $order_tenant_id !== $tenant_id) {
            error_log("[GDS Security] Cross-tenant order routing attempt: Order $order_id belongs to $order_tenant_id, not $tenant_id.");
            return;
        }

        // 1. Policy Check: Split Orders enabled?
        $split_enabled = \GDS\Core\Settings::get('split_orders_enabled');

        $items_by_supplier = array();
        $missing_mappings = array();

        foreach ($order->get_items() as $item_id => $item) {
            $product_id = $item->get_product_id();
            $variation_id = $item->get_variation_id();
            $target_id = $variation_id ?: $product_id;

            $product = $item->get_product();
            $sku = $product ? $product->get_sku() : '';

            // Find the supplier variant in our staging tables
            $supplier_info = $this->get_supplier_info_by_variant($target_id, $store_connection_id);

            if ($supplier_info) {
                $supplier_id = $supplier_info['supplier_id'];
                if (!isset($items_by_supplier[$supplier_id])) {
                    $items_by_supplier[$supplier_id] = array(
                        'items' => array(),
                        'total_cost' => 0
                    );
                }

                $items_by_supplier[$supplier_id]['items'][] = array(
                    'wc_item_id' => $item_id,
                    'sku' => $sku,
                    'qty' => $item->get_quantity(),
                    'cost' => $supplier_info['cost'],
                    'supplier_v_sku' => $supplier_info['supplier_v_sku']
                );

                $items_by_supplier[$supplier_id]['total_cost'] += ($supplier_info['cost'] * $item->get_quantity());
            } else {
                $missing_mappings[] = $item->get_name();
            }
        }

        // 2. Exception Handling: Missing Mappings
        if (!empty($missing_mappings)) {
            $order->add_order_note("GDS Exception: Missing supplier mappings for: " . implode(', ', $missing_mappings));
            $order->update_status('on-hold', 'GDS: Manual intervention required for unmapped items.');
            return;
        }

        // 3. Multi-Supplier Logic
        if (count($items_by_supplier) > 1 && !$split_enabled) {
            $order->add_order_note("GDS Exception: Multi-supplier order detected but splitting is disabled.");
            $order->update_status('on-hold');
            return;
        }

        // 4. Create POs
        foreach ($items_by_supplier as $supplier_id => $data) {
            // Updated POManager needs store_connection_id
            $po_id = \GDS\Core\POManager::create_po($order_id, $supplier_id, $data['items'], $data['total_cost'], $store_connection_id);

            if ($po_id) {
                $order->add_order_note("GDS: Created PO #$po_id for Supplier ID: $supplier_id [Store: $store_connection_id]");
                $this->submit_po_to_supplier($po_id);
            }
        }
    }

    /**
     * Find supplier information based on a published variation/product ID.
     */
    private function get_supplier_info_by_variant($published_id, $store_connection_id = null)
    {
        global $wpdb;
        $table_v = $wpdb->prefix . 'gds_supplier_variants';
        $table_p = $wpdb->prefix . 'gds_supplier_products';

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        if (!$store_connection_id) {
            $store_connection_id = $registry->get_store_connection_id();
        }

        return $wpdb->get_row($wpdb->prepare(
            "SELECT p.supplier_id, v.cost, v.supplier_v_sku 
             FROM $table_v v 
             JOIN $table_p p ON v.product_id = p.id
             WHERE (v.published_variation_id = %d OR p.published_product_id = %d)
             AND v.tenant_id = %s AND p.tenant_id = %s
             AND (v.store_connection_id = %s OR v.store_connection_id IS NULL)",
            $published_id,
            $published_id,
            $tenant_id,
            $tenant_id,
            $store_connection_id
        ), ARRAY_A);
    }

    /**
     * Ingest tracking information for a PO.
     */
    public function ingest_tracking($po_id, $tracking_no, $carrier)
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();

        $po = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gds_purchase_orders WHERE id = %d AND tenant_id = %s",
            $po_id,
            $tenant_id
        ));

        if (!$po) {
            error_log("[GDS Fulfillment] tracking ingestion failed: PO #$po_id not found or access denied for tenant $tenant_id.");
            return;
        }

        // 1. Update PO record
        \GDS\Core\POManager::update_po_status($po_id, 'shipped', array(
            'tracking_number' => $tracking_no,
            'carrier' => $carrier
        ));

        // 2. Update parent WC Order
        $order = wc_get_order($po->order_id);
        if ($order) {
            $order->add_order_note(sprintf(
                "GDS Fulfillment: PO #%d Shipped. Carrier: %s, Tracking: %s [Store: %s]",
                $po_id,
                $carrier,
                $tracking_no,
                $po->store_connection_id
            ));

            $this->check_order_completion($order, $po->store_connection_id);
        }

        \GDS\Core\Logger::log('fulfillment', 'tracking_ingestion', array(
            'po_id' => $po_id,
            'tracking_no' => $tracking_no
        ), 'po', $po_id);
    }

    /**
     * Check if all POs for an order are complete.
     */
    private function check_order_completion($order, $store_connection_id = null)
    {
        global $wpdb;
        $order_id = $order->get_id();
        $table = $wpdb->prefix . 'gds_purchase_orders';

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        if (!$store_connection_id) {
            $store_connection_id = $registry->get_store_connection_id();
        }

        $total_pos = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE order_id = %d AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $order_id,
            $tenant_id,
            $store_connection_id
        ));
        $shipped_pos = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE order_id = %d AND status = 'shipped' AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $order_id,
            $tenant_id,
            $store_connection_id
        ));

        if ($total_pos > 0 && $total_pos == $shipped_pos) {
            $order->update_status('completed', 'GDS: All items in this order have been shipped.');
        }
    }

    /**
     * Submit PO to supplier via their connector.
     */
    private function submit_po_to_supplier($po_id)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $po = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gds_purchase_orders WHERE id = %d AND tenant_id = %s",
            $po_id,
            $tenant_id
        ));

        if (!$po)
            return;

        \GDS\Core\POManager::update_po_status($po_id, 'submitted', array(
            'supplier_po_ref' => 'REF-' . str_replace('.', '', microtime(true))
        ));

        \GDS\Core\Logger::log('fulfillment', 'PO_SUBMISSION', array('supplier_id' => $po->supplier_id, 'store_id' => $po->store_connection_id), 'po', $po_id);
    }
}
