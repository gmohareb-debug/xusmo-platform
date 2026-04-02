<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Return Manager.
 * 
 * Logic for RMA requests and linking to WooCommerce refunds.
 */
class ReturnManager
{

    /**
     * Create an RMA request.
     *
     * @param int    $po_id   PO ID.
     * @param string $reason  Reason for return.
     * @param array  $items   Items being returned.
     * @return int|false RMA ID on success.
     */
    public static function create_rma($po_id, $reason, $items = array())
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_rma_requests';
        $po_table = $wpdb->prefix . 'gds_purchase_orders';

        $po = $wpdb->get_row($wpdb->prepare("SELECT order_id FROM $po_table WHERE id = %d AND tenant_id = %s", $po_id, $tenant_id));
        if (!$po)
            return false;

        $wpdb->insert($table, array(
            'tenant_id' => $tenant_id,
            'po_id' => $po_id,
            'order_id' => $po->order_id,
            'status' => 'pending',
            'reason' => $reason,
            'items_json' => maybe_serialize($items),
        ));

        $rma_id = $wpdb->insert_id;

        Logger::log('fulfillment', 'RMA_CREATED', array('reason' => $reason), 'rma', $rma_id);

        return $rma_id;
    }

    /**
     * Link an RMA to a WooCommerce refund.
     *
     * @param int $rma_id       RMA ID.
     * @param int $wc_refund_id WC Refund ID.
     */
    public static function link_refund($rma_id, $wc_refund_id)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_rma_requests';

        $wpdb->update($table, array(
            'wc_refund_id' => $wc_refund_id,
            'status' => 'refunded'
        ), array('id' => $rma_id, 'tenant_id' => $tenant_id));

        Logger::log('fulfillment', 'RMA_REFUNDED', array('wc_refund_id' => $wc_refund_id), 'rma', $rma_id);
    }
}
