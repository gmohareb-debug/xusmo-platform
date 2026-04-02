<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * RMA List Table Class.
 */
class RMAListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'RMA',
            'plural' => 'RMAs',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'id' => 'RMA ID',
            'order_id' => 'WC Order',
            'po_id' => 'PO ID',
            'status' => 'Status',
            'reason' => 'Reason',
            'created_at' => 'Created',
            'actions' => 'Actions',
        );
    }

    public function column_actions($item)
    {
        if ($item->status !== 'pending') {
            return '-';
        }

        $approve_url = wp_nonce_url(admin_url('admin.php?page=gds-rma&action=rma_status&status=approved&id=' . $item->id), 'rma_action_' . $item->id);
        $reject_url = wp_nonce_url(admin_url('admin.php?page=gds-rma&action=rma_status&status=rejected&id=' . $item->id), 'rma_action_' . $item->id);

        return sprintf(
            '<a href="%s" class="button button-small button-primary">%s</a> <a href="%s" class="button button-small">%s</a>',
            $approve_url,
            __('Approve', 'gds'),
            $reject_url,
            __('Reject', 'gds')
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'id':
                return '<strong>#' . $item->id . '</strong>';
            case 'order_id':
                return '#' . $item->order_id;
            case 'po_id':
                return '#' . $item->po_id;
            case 'status':
                return sprintf('<span class="gds-badge badge-%s">%s</span>', esc_attr($item->status), esc_html($item->status));
            case 'reason':
                return esc_html($item->reason);
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
        $table = $wpdb->prefix . 'gds_rma_requests';

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

        $sql = "SELECT * FROM $table $where ORDER BY created_at DESC LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;

        $this->items = $wpdb->get_results($wpdb->prepare($sql, $params));

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
        ));
    }
}
