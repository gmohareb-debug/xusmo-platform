<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Inventory Health List Table Class.
 */
class InventoryHealthListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Stock Status',
            'plural' => 'Stock Statuses',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'sku' => 'Supplier SKU',
            'supplier' => 'Supplier',
            'stock_qty' => 'Stock Qty',
            'status' => 'Status',
            'last_sync' => 'Last Sync',
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'sku':
                return esc_html($item->supplier_v_sku);
            case 'supplier':
                $supplier = \GDS\Core\SupplierManager::get_supplier($item->supplier_id);
                return $supplier ? esc_html($supplier->name) : 'Unknown';
            case 'stock_qty':
                return intval($item->stock_qty);
            case 'status':
                $buffer = \GDS\Core\Settings::get('safety_stock_buffer') ?: 2;
                if ($item->stock_qty <= 0) {
                    return '<span class="status-inactive">Out of Stock</span>';
                } elseif ($item->stock_qty <= $buffer) {
                    return '<span class="status-warning" style="color: #d69e2e;">Low Stock</span>';
                }
                return '<span class="status-active">Healthy</span>';
            case 'last_sync':
                return $item->updated_at;
            default:
                return '-';
        }
    }

    public function prepare_items()
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table_v = $wpdb->prefix . 'gds_supplier_variants';
        $table_p = $wpdb->prefix . 'gds_supplier_products';

        $per_page = 20;
        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        $total_items = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_v WHERE tenant_id = %s", $tenant_id));

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = array();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $this->items = $wpdb->get_results($wpdb->prepare(
            "SELECT v.*, p.supplier_id 
             FROM $table_v v 
             JOIN $table_p p ON v.product_id = p.id 
             WHERE v.tenant_id = %s 
             ORDER BY v.updated_at DESC LIMIT %d OFFSET %d",
            $tenant_id,
            $per_page,
            $offset
        ));

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }
}
