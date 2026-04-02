<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Base Controller for all S2B REST APIs.
 * Enforces Tenant boundaries by intercepting requests and setting TenantRegistry context.
 */
abstract class AbstractRestController extends \WP_REST_Controller
{
    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'gds/v1';

    /**
     * Helper to verify authentication and set the Tenant context.
     * This acts as the proxy/BFF authentication layer.
     * 
     * @param \WP_REST_Request $request
     * @return true|\WP_Error
     */
    public function check_tenant_permission($request)
    {
        // For development/transition: check if logged in as capability OR check headers
        $tenant_id = $request->get_header('X-GDS-Tenant-ID');

        if (empty($tenant_id)) {
            // Fallback for cookie auth (Admin WP users testing locally)
            if (current_user_can('manage_options') || current_user_can('tenant_owner')) {
                $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
            } else {
                return new \WP_Error('missing_tenant_id', 'X-GDS-Tenant-ID header is required for Server-to-Server calls.', array('status' => 401));
            }
        }

        // Validate API Key / Signature here in production.
        // For now, we manually lock the TenantRegistry to this tenant ID.
        try {
            \GDS\Core\TenantRegistry::instance()->set_context($tenant_id);
        } catch (\Exception $e) {
            return new \WP_Error('invalid_tenant', 'The requested Tenant ID is invalid.', array('status' => 403));
        }

        // Apply Store Context if provided
        $store_id = $request->get_header('X-GDS-Store-ID');
        if (!empty($store_id)) {
            \GDS\Core\TenantRegistry::instance()->set_store_context($store_id);
        }

        return true;
    }

    /**
     * Helper to log audit events for mutations.
     */
    protected function log_audit_event($action, $details = array(), $entity_type = '', $entity_id = 0)
    {
        \GDS\Core\Logger::log('api_audit', $action, $details, $entity_type, $entity_id);
    }
}
