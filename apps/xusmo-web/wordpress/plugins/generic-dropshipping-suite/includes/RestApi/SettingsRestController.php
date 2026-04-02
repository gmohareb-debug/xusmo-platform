<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class SettingsRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/settings', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_settings'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            ),
            array(
                'methods' => \WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_settings'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/health', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_health'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function get_settings($request)
    {
        $settings = \GDS\Core\Settings::get();
        return rest_ensure_response(array('settings' => $settings));
    }

    public function update_settings($request)
    {
        $params = $request->get_json_params() ?: array();
        if (empty($params)) {
            return new \WP_Error('invalid_param', 'No settings provided', array('status' => 400));
        }

        foreach ($params as $key => $value) {
            \GDS\Core\Settings::update($key, $value);
        }
        $this->log_audit_event('settings_updated', array('keys' => array_keys($params)), 'settings');

        return rest_ensure_response(array('success' => true));
    }

    public function get_health($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        return rest_ensure_response(array(
            'status' => 'ok',
            'tenant_id' => $tenant_id,
            'plugin_version' => GDS_VERSION,
            'time' => time()
        ));
    }
}
