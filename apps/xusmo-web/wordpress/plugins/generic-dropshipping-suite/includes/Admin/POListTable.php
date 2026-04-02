<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * PO List Table Class.
 */
class POListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Purchase Order',
            'plural' => 'Purchase Orders',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'id' => 'PO ID',
            'order_id' => 'WC Order',
            'supplier' => 'Supplier',
            'status' => 'Status',
            'tracking' => 'Tracking',
            'total_cost' => 'Total Cost',
            'created_at' => 'Created',
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'id':
                return '<strong>#' . $item->id . '</strong>';
            case 'order_id':
                $order = wc_get_order($item->order_id);
                return $order ? sprintf('<a href="%s">#%s</a>', get_edit_post_link($item->order_id), $order->get_order_number()) : '#' . $item->order_id;
            case 'supplier':
                $supplier = \GDS\Core\SupplierManager::get_supplier($item->supplier_id);
                return $supplier ? esc_html($supplier->name) : 'Unknown';
            case 'status':
                return sprintf('<span class="gds-badge badge-%s">%s</span>', esc_attr($item->status), esc_html($item->status));
            case 'tracking':
                if ($item->tracking_number) {
                    return sprintf('%s (%s)', esc_html($item->tracking_number), esc_html($item->carrier));
                }
                return '-';
            case 'total_cost':
                return wc_price($item->total_cost, array('currency' => $item->currency));
            case 'created_at':
                return $item->created_at;
            default:
                return '-';
        }
    }

    public function prepare_items()
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_id = $registry->get_store_connection_id();
        $table = $wpdb->prefix . 'gds_purchase_orders';

        $per_page = 20;
        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        $where = $wpdb->prepare("WHERE tenant_id = %s", $tenant_id);
        if ($store_id) {
            $where .= $wpdb->prepare(" AND store_connection_id = %s", $store_id);
        }

        $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $table $where");

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $this->items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table $where ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ));

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }
}
