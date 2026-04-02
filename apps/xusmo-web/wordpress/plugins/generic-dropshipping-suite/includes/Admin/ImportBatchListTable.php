<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Import Batch List Table Class.
 */
class ImportBatchListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Batch',
            'plural' => 'Batches',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'id' => 'ID',
            'supplier' => 'Supplier',
            'status' => 'Status',
            'processed' => 'Processed',
            'failed' => 'Failed',
            'started_at' => 'Started At',
            'finished_at' => 'Finished At',
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'id':
                return $item->id;
            case 'supplier':
                $supplier = \GDS\Core\SupplierManager::get_supplier($item->supplier_id);
                return $supplier ? esc_html($supplier->name) : 'Unknown';
            case 'status':
                return sprintf('<span class="gds-badge badge-%s">%s</span>', esc_attr($item->status), esc_html($item->status));
            case 'processed':
                return intval($item->items_processed);
            case 'failed':
                return intval($item->items_failed);
            case 'started_at':
                return $item->started_at;
            case 'finished_at':
                return $item->finished_at ?: '-';
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
        $table = $wpdb->prefix . 'gds_import_batches';

        $per_page = 20;
        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        $where = "WHERE tenant_id = %s";
        $params = array($tenant_id);

        if ($store_id) {
            $where .= " AND store_connection_id = %s";
            $params[] = $store_id;
        }

        $total_items = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table $where", $params));

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = array();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $sql = "SELECT * FROM $table $where ORDER BY started_at DESC LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;

        $this->items = $wpdb->get_results($wpdb->prepare($sql, $params));

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }
}
