<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * PO Manager.
 * 
 * Handles the creation and status management of Purchase Orders.
 */
class POManager
{

    /**
     * Check if an active PO already exists for this order/supplier pair for the current tenant/store.
     * 
     * @param int $order_id
     * @param int $supplier_id
     * @param string|null $store_connection_id
     * @return int|false PO ID if exists.
     */
    public static function exists_for_order($order_id, $supplier_id, $store_connection_id = null)
    {
        global $wpdb;
        $registry = TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        if (!$store_connection_id) {
            $store_connection_id = $registry->get_store_connection_id();
        }

        $table = $wpdb->prefix . 'gds_purchase_orders';
        return $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE order_id = %d AND supplier_id = %d AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL) AND status != 'cancelled' LIMIT 1",
            $order_id,
            $supplier_id,
            $tenant_id,
            $store_connection_id
        ));
    }

    /**
     * Create a new Purchase Order record with idempotency and policy checks.
     *
     * @param int   $order_id    WooCommerce Order ID.
     * @param int   $supplier_id GDS Supplier ID.
     * @param array $items       List of items in this PO.
     * @param float $total_cost  Calculated total cost.
     * @param string|null $store_connection_id Optional store connection ID.
     * @return int|false PO ID on success.
     */
    public static function create_po($order_id, $supplier_id, $items, $total_cost, $store_connection_id = null)
    {
        global $wpdb;
        $registry = TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        if (!$store_connection_id) {
            $store_connection_id = $registry->get_store_connection_id();
        }

        $table = $wpdb->prefix . 'gds_purchase_orders';

        // 0. Billing Entitlement Check (Global but scoped by tenant)
        if (!\GDS\Core\BillingEngine::instance()->can_perform('order')) {
            \GDS\Core\Logger::log('fulfillment', 'BILLING_LIMIT_REACHED', array('order_id' => $order_id), 'error');
            return false;
        }

        // 1. Idempotency Check
        $existing_id = self::exists_for_order($order_id, $supplier_id, $store_connection_id);
        if ($existing_id) {
            error_log("[GDS POManager] Duplicate PO attempt blocked for Order: $order_id, Supplier: $supplier_id [Store: $store_connection_id]");
            return false;
        }

        // 2. Policy Enforcement: FX Buffer
        $fx_buffer = \GDS\Core\Settings::get('fx_buffer_percent') ?: 0;
        if ($fx_buffer > 0) {
            $total_cost *= (1 + ($fx_buffer / 100));
        }

        // 3. Policy Enforcement: Cancellation Window
        $cancel_window = \GDS\Core\Settings::get('order_cancellation_window') ?: 30;

        $result = $wpdb->insert($table, array(
            'tenant_id' => $tenant_id,
            'store_connection_id' => $store_connection_id,
            'order_id' => $order_id,
            'supplier_id' => $supplier_id,
            'status' => 'pending',
            'items_json' => json_encode($items),
            'total_cost' => $total_cost,
            'cancellation_expiry' => date('Y-m-d H:i:s', time() + ($cancel_window * 60))
        ));

        if ($result) {
            $po_id = $wpdb->insert_id;
            \GDS\Core\BillingEngine::instance()->record_usage('order', 1);
            return $po_id;
        }

        return false;
    }

    /**
     * Update PO status.
     *
     * @param int    $po_id  PO ID.
     * @param string $status New status.
     * @param array  $meta   Optional meta data to update.
     */
    public static function update_po_status($po_id, $status, $meta = array())
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_purchase_orders';

        // Scoped update for security
        $data = array('status' => $status);
        if (isset($meta['supplier_po_ref'])) {
            $data['supplier_po_ref'] = $meta['supplier_po_ref'];
        }
        if (isset($meta['carrier'])) {
            $data['carrier'] = $meta['carrier'];
        }
        if (isset($meta['tracking_number'])) {
            $data['tracking_number'] = $meta['tracking_number'];
        }

        $wpdb->update($table, $data, array('id' => $po_id, 'tenant_id' => $tenant_id));
    }

    /**
     * Cancel a Purchase Order.
     */
    public static function cancel_po($po_id, $reason)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_purchase_orders';

        $wpdb->update($table, array('status' => 'cancelled'), array('id' => $po_id, 'tenant_id' => $tenant_id));

        \GDS\Core\Logger::log('fulfillment', 'PO_CANCELLED', array('reason' => $reason), 'po', $po_id);
    }
}
