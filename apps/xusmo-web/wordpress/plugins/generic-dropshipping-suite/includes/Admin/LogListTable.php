<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Log List Table Class.
 */
class LogListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Log',
            'plural' => 'Logs',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'created_at' => 'Timestamp',
            'event_type' => 'Event Type',
            'action' => 'Action',
            'object' => 'Object',
            'details' => 'Details',
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'created_at':
                return $item->created_at;
            case 'event_type':
                return sprintf('<span class="gds-badge badge-%s">%s</span>', esc_attr($item->event_type), esc_html($item->event_type));
            case 'action':
                return esc_html($item->action);
            case 'object':
                return $item->object_type ? sprintf('%s #%d', esc_html($item->object_type), intval($item->object_id)) : '-';
            case 'details':
                $details = maybe_unserialize($item->details);
                return '<pre style="max-width: 300px; overflow: auto; background: #f0f0f0; padding: 5px; font-size: 10px;">' . esc_html(print_r($details, true)) . '</pre>';
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
        $table = $wpdb->prefix . 'gds_audit_log';

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
