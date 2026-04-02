<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Catalog Review List Table Class.
 */
class CatalogReviewListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Staged Product',
            'plural' => 'Staged Products',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'cb' => '<input type="checkbox" />',
            'image' => 'Image',
            'title' => 'Title',
            'supplier' => 'Supplier',
            'supplier_sku' => 'Supplier SKU',
            'category' => 'Category',
            'published' => 'WC Status',
        );
    }

    public function column_cb($item)
    {
        return sprintf('<input type="checkbox" name="staged_products[]" value="%d" />', $item->id);
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'image':
                $images = maybe_unserialize($item->image_urls);
                $first_image = !empty($images) ? $images[0] : '';
                return $first_image ? sprintf('<img src="%s" style="width: 50px; height: auto;" />', esc_url($first_image)) : '-';
            case 'title':
                return '<strong>' . esc_html($item->title) . '</strong>';
            case 'supplier':
                $supplier = \GDS\Core\SupplierManager::get_supplier($item->supplier_id);
                return $supplier ? esc_html($supplier->name) : 'Unknown';
            case 'supplier_sku':
                return esc_html($item->supplier_sku);
            case 'category':
                return esc_html($item->category);
            case 'published':
                return $item->published_product_id ? '<span class="status-active">Published</span>' : '<span class="status-inactive">Staged</span>';
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
        $table = $wpdb->prefix . 'gds_supplier_products';

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
        $sortable = $this->get_sortable_columns();
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
