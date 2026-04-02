<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class ProductsRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/products', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'check_tenant_permission'),
                'args' => $this->get_collection_params(),
            )
        ));

        register_rest_route($this->namespace, '/products/(?P<id>[\d]+)', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            ),
            array(
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_item'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/products/(?P<id>[\d]+)/publish', array(
            array(
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => array($this, 'publish_item'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_items($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_products';

        $per_page = $request->get_param('per_page') ?: 50;
        $page = $request->get_param('page') ?: 1;
        $offset = ($page - 1) * $per_page;
        $status = $request->get_param('status');

        $query = "SELECT * FROM $table WHERE tenant_id = %s";
        $args = [$tenant_id];

        if (!empty($status)) {
            $query .= " AND status = %s";
            $args[] = $status;
        }

        $query .= " ORDER BY created_at DESC LIMIT %d OFFSET %d";
        $args[] = $per_page;
        $args[] = $offset;

        $results = $wpdb->get_results($wpdb->prepare($query, ...$args));

        return rest_ensure_response(array('data' => $results));
    }

    public function get_item($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $id = (int) $request['id'];

        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_products';
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d AND tenant_id = %s", $id, $tenant_id));

        if (!$item) {
            return new \WP_Error('not_found', 'Product not found', array('status' => 404));
        }

        // Fetch variants
        $variants_table = $wpdb->prefix . 'gds_supplier_variants';
        $variants = $wpdb->get_results($wpdb->prepare("SELECT * FROM $variants_table WHERE product_id = %d AND tenant_id = %s", $id, $tenant_id));
        $item->variants = $variants;

        return rest_ensure_response($item);
    }

    public function update_item($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $id = (int) $request['id'];

        $title = sanitize_text_field($request->get_param('title'));
        $description = wp_kses_post($request->get_param('description'));

        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_products';

        $item = $wpdb->get_row($wpdb->prepare("SELECT id FROM $table WHERE id = %d AND tenant_id = %s", $id, $tenant_id));
        if (!$item) {
            return new \WP_Error('not_found', 'Product not found', array('status' => 404));
        }

        $update_data = array();
        if ($title)
            $update_data['title'] = $title;
        if ($description)
            $update_data['description'] = $description;

        if (!empty($update_data)) {
            $wpdb->update($table, $update_data, array('id' => $id, 'tenant_id' => $tenant_id));
            $this->log_audit_event('product_updated', $update_data, 'product', $id);
        }

        return rest_ensure_response(array('success' => true));
    }

    public function publish_item($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $id = (int) $request['id'];

        // Delegate to ProductAgent for the actual push to WooCommerce
        $agent = \GDS\Core\AgentRegistry::instance()->get('product');
        if (!$agent) {
            return new \WP_Error('agent_unavailable', 'Publishing agent is unavailable.', array('status' => 500));
        }

        $wc_product_id = $agent->publish_product($id);

        if (is_wp_error($wc_product_id)) {
            return $wc_product_id;
        }

        $this->log_audit_event('product_published', array('wc_id' => $wc_product_id), 'product', $id);

        return rest_ensure_response(array('success' => true, 'wc_product_id' => $wc_product_id));
    }
}
