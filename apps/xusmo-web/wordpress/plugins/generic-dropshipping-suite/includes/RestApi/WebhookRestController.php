<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class WebhookRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/pos/pending', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_pending_pos'),
                // For webhooks we might want specific webhook auth or just use tenant headers for now
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_pending_pos($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        global $wpdb;
        $table = $wpdb->prefix . 'gds_purchase_orders';
        $pos = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %s AND status = %s LIMIT 50",
            $tenant_id,
            'submitted'
        ));

        return rest_ensure_response(array('success' => true, 'tenant_id' => $tenant_id, 'pos' => $pos));
    }
}
