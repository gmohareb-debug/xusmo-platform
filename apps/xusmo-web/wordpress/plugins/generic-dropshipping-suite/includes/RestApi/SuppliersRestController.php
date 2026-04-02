<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class SuppliersRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/suppliers', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_suppliers'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_suppliers($request)
    {
        return rest_ensure_response(\GDS\Core\SupplierManager::get_all_suppliers());
    }
}
