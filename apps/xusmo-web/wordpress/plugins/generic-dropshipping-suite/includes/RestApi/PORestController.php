<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class PORestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/pos', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'check_tenant_permission'),
                'args' => $this->get_collection_params(),
            )
        ));

        register_rest_route($this->namespace, '/pos/(?P<id>[\w\-]+)', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/pos/(?P<id>[\w\-]+)/retry', array(
            array(
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => array($this, 'retry_item'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/pos/(?P<id>[\w\-]+)/tracking', array(
            array(
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_tracking'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_items($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        global $wpdb;
        $table = $wpdb->prefix . 'gds_purchase_orders';
        $per_page = $request->get_param('per_page') ?: 50;
        $page = $request->get_param('page') ?: 1;
        $offset = ($page - 1) * $per_page;

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE tenant_id = %s ORDER BY created_at DESC LIMIT %d OFFSET %d", $tenant_id, $per_page, $offset));
        return rest_ensure_response(array('data' => $results));
    }

    public function get_item($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $po_id = sanitize_text_field($request['id']);
        global $wpdb;
        $table = $wpdb->prefix . 'gds_purchase_orders';
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d AND tenant_id = %s", intval($po_id), $tenant_id));

        if (!$item) {
            return new \WP_Error('not_found', 'PO not found', array('status' => 404));
        }

        return rest_ensure_response($item);
    }

    public function retry_item($request)
    {
        $po_id = sanitize_text_field($request['id']);
        $agent = \GDS\Core\AgentRegistry::instance()->get('fulfillment');
        if (!$agent) {
            return new \WP_Error('agent_unavailable', 'Fulfillment agent is unavailable.', array('status' => 500));
        }

        $result = $agent->submit_po($po_id);
        if (is_wp_error($result)) {
            return $result;
        }

        $this->log_audit_event('po_retried', array('result' => $result), 'po', $po_id);
        return rest_ensure_response(array('success' => true, 'message' => 'PO retry submitted.'));
    }

    public function update_tracking($request)
    {
        $po_id = sanitize_text_field($request['id']);
        $tracking_number = sanitize_text_field($request->get_param('tracking_number'));
        $carrier = sanitize_text_field($request->get_param('carrier'));

        if (empty($tracking_number) || empty($carrier)) {
            return new \WP_Error('missing_params', 'tracking_number and carrier required', array('status' => 400));
        }

        $agent = \GDS\Core\AgentRegistry::instance()->get('fulfillment');
        if (!$agent) {
            return new \WP_Error('agent_unavailable', 'Fulfillment agent is unavailable.', array('status' => 500));
        }

        $result = $agent->ingest_tracking($po_id, $tracking_number, $carrier);
        $this->log_audit_event('po_tracking_updated', array('tracking' => $tracking_number), 'po', $po_id);

        return rest_ensure_response(array('success' => true, 'message' => 'Tracking updated.'));
    }
}
