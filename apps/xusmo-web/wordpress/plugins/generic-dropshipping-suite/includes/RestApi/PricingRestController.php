<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class PricingRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/pricing/rules', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_rules'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            ),
            array(
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_rules'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/pricing/simulate', array(
            array(
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => array($this, 'simulate_pricing'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_rules($request)
    {
        $settings = \GDS\Core\Settings::get();
        return rest_ensure_response(array('rules' => $settings['pricing_rules'] ?? []));
    }

    public function update_rules($request)
    {
        $rules = $request->get_param('rules');
        if (!is_array($rules)) {
            return new \WP_Error('invalid_param', 'Rules must be an array', array('status' => 400));
        }

        \GDS\Core\Settings::update('pricing_rules', $rules);

        $this->log_audit_event('pricing_rules_updated', array('rules' => $rules), 'settings');

        return rest_ensure_response(array('success' => true, 'rules' => $rules));
    }

    public function simulate_pricing($request)
    {
        $cost = (float) $request->get_param('cost');
        if ($cost <= 0) {
            return new \WP_Error('invalid_param', 'Cost must be greater than 0', array('status' => 400));
        }

        $agent = \GDS\Core\AgentRegistry::instance()->get('pricing');
        if (!$agent) {
            return new \WP_Error('agent_unavailable', 'Pricing agent is unavailable.', array('status' => 500));
        }

        $simulated_price = $agent->calculate_sell_price($cost);
        return rest_ensure_response(array('cost' => $cost, 'simulated_price' => $simulated_price));
    }
}
