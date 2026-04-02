<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class RMARestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/rmas', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'check_tenant_permission'),
                'args' => $this->get_collection_params(),
            )
        ));

        register_rest_route($this->namespace, '/rmas/(?P<id>[\d]+)/status', array(
            array(
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_status'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_items($request)
    {
        // Placeholder returning empty for now
        return rest_ensure_response(array('data' => []));
    }

    public function update_status($request)
    {
        $id = (int) $request['id'];
        $status = sanitize_text_field($request->get_param('status'));

        $this->log_audit_event('rma_status_updated', array('status' => $status), 'rma', $id);
        return rest_ensure_response(array('success' => true, 'message' => 'Status updated.'));
    }
}
