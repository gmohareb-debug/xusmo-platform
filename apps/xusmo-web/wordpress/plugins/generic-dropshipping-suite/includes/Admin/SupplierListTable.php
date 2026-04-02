<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Supplier List Table Class.
 */
class SupplierListTable extends \WP_List_Table
{

    public function __construct()
    {
        parent::__construct(array(
            'singular' => __('Supplier', 'gds'),
            'plural' => __('Suppliers', 'gds'),
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'cb' => '<input type="checkbox" />',
            'name' => __('Name', 'gds'),
            'connector_type' => __('Connector', 'gds'),
            'status' => __('Status', 'gds'),
            'last_sync' => __('Last Sync', 'gds'),
            'actions' => __('Actions', 'gds'),
        );
    }

    protected function get_sortable_columns()
    {
        return array(
            'name' => array('name', true),
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'connector_type':
                return strtoupper($item->connector_type);
            case 'status':
                return $item->is_active ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>';
            case 'last_sync':
                return $item->last_sync_at ?: 'Never';
            default:
                return print_r($item, true);
        }
    }

    public function column_name($item)
    {
        $delete_nonce = wp_create_nonce('delete_' . $item->id);
        $page = isset($_REQUEST['page']) ? esc_attr($_REQUEST['page']) : 'gds-suppliers';
        $actions = array(
            'edit' => sprintf('<a href="?page=%s&action=%s&id=%s">%s</a>', $page, 'edit', $item->id, __('Edit', 'gds')),
            'delete' => sprintf('<a href="?page=%s&action=%s&id=%s&_wpnonce=%s">%s</a>', $page, 'delete', $item->id, $delete_nonce, __('Delete', 'gds')),
        );

        return sprintf('<strong>%1$s</strong> %2$s', $item->name, $this->row_actions($actions));
    }

    public function column_actions($item)
    {
        return sprintf(
            '<button class="button gds-test-connection" data-id="%d">%s</button>
			 <button class="button button-primary gds-run-import" data-id="%d">%s</button>
             <button class="button gds-publish-products" data-id="%d">%s</button>',
            $item->id,
            __('Test Connection', 'gds'),
            $item->id,
            __('Run Import', 'gds'),
            $item->id,
            __('Publish to WC', 'gds')
        );
    }

    public function column_cb($item)
    {
        return sprintf('<input type="checkbox" name="suppliers[]" value="%d" />', $item->id);
    }

    public function prepare_items()
    {
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();

        $this->_column_headers = array($columns, $hidden, $sortable);

        $this->items = \GDS\Core\SupplierManager::get_all_suppliers();
    }
}
