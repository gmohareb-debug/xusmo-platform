<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class OrdersRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/orders', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_orders'),
                'permission_callback' => array($this, 'check_tenant_permission'),
                'args' => $this->get_collection_params(),
            )
        ));
    }

    public function get_orders($request)
    {
        // Require WooCommerce
        if (!function_exists('wc_get_orders')) {
            return new \WP_Error('wc_missing', 'WooCommerce is required to fetch orders.', array('status' => 500));
        }

        $per_page = $request->get_param('per_page') ?: 50;
        $page = $request->get_param('page') ?: 1;

        // Fetch WooCommerce regular orders
        $orders = wc_get_orders(array(
            'limit' => $per_page,
            'paged' => $page,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'ids',
        ));

        // Format
        $data = array();
        foreach ($orders as $order_id) {
            $order = wc_get_order($order_id);
            if ($order) {
                // Return dropnex specific lines if possible, or all
                $data[] = array(
                    'id' => $order->get_id(),
                    'status' => $order->get_status(),
                    'total' => $order->get_total(),
                    'date_created' => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i:s') : null,
                    'billing' => $order->get_billing_address_1() ? array('first_name' => $order->get_billing_first_name(), 'last_name' => $order->get_billing_last_name()) : array()
                );
            }
        }

        return rest_ensure_response(array('data' => $data));
    }
}
