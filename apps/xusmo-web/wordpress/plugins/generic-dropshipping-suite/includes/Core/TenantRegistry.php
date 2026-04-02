<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Tenant Registry Class.
 * 
 * Manages tenant-specific configurations and feature gates in a SaaS environment.
 */
class TenantRegistry
{
    /**
     * Main instance of TenantRegistry.
     *
     * @var TenantRegistry
     */
    protected static $_instance = null;

    /**
     * Current Tenant ID.
     *
     * @var string|int
     */
    private $current_tenant_id = null;

    /**
     * Current Store Connection ID.
     * 
     * @var string|null
     */
    private $current_store_connection_id = null;

    /**
     * Tenant Configuration Cache.
     *
     * @var array
     */
    private $cache = [];

    /**
     * Main TenantRegistry Instance.
     *
     * @return TenantRegistry
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Initialize the registry and resolve context.
     */
    public function init()
    {
        $this->resolve_context();
        $this->load_config();
    }

    /**
     * Resolve the current tenant and store connection.
     */
    private function resolve_context()
    {
        // 1. WordPress Multisite Support (One site = One Tenant fallback)
        if (is_multisite()) {
            $this->current_tenant_id = 'wp_blog_' . get_current_blog_id();
        }

        $current_host = $_SERVER['HTTP_HOST'] ?? '';

        // 2. Control Plane Check
        if (defined('GDS_PLATFORM_HOST') && $current_host === GDS_PLATFORM_HOST) {
            $this->current_tenant_id = 'platform';
            return;
        }

        // 3. Resolve via Domain (Lookup StoreConnection first, then jump to Tenant)
        global $wpdb;
        $table_conn = $wpdb->prefix . 'gds_store_connections';
        $table_tenants = $wpdb->prefix . 'gds_tenants';

        if ($current_host) {
            $conn_record = $wpdb->get_row($wpdb->prepare(
                "SELECT tenant_id, store_connection_id FROM $table_conn WHERE store_domain = %s AND status = 'connected' LIMIT 1",
                $current_host
            ));

            if ($conn_record) {
                $this->current_tenant_id = $conn_record->tenant_id;
                $this->current_store_connection_id = $conn_record->store_connection_id;
            } else {
                // Fallback: Direct Tenant domain lookup
                $tenant_record = $wpdb->get_row($wpdb->prepare(
                    "SELECT tenant_id FROM $table_tenants WHERE domain = %s AND status = 'active' LIMIT 1",
                    $current_host
                ));

                if ($tenant_record) {
                    $this->current_tenant_id = $tenant_record->tenant_id;
                }
            }
        }

        // 4. Admin Context Override (Store Switcher)
        // If we're in the admin and have a tenant but no store (or want to switch)
        if (is_admin() && $this->current_tenant_id && function_exists('get_current_user_id')) {
            $user_id = get_current_user_id();
            if ($user_id) {
                $switched_store = get_transient('gds_user_store_context_' . $user_id);
                if ($switched_store) {
                    // Safety check: Ensure this user/tenant actually owns this store
                    $exists = $wpdb->get_var($wpdb->prepare(
                        "SELECT 1 FROM $table_conn WHERE tenant_id = %s AND store_connection_id = %s LIMIT 1",
                        $this->current_tenant_id,
                        $switched_store
                    ));
                    if ($exists) {
                        $this->current_store_connection_id = $switched_store;
                    }
                }
            }
        }

        // 5. Default Fallback
        if (!$this->current_tenant_id) {
            $this->current_tenant_id = 'primary_tenant';
        }
    }

    /**
     * Load tenant-specific configuration and limits.
     */
    private function load_config()
    {
        $config = get_option('gds_tenant_config_' . $this->current_tenant_id, []);

        $defaults = [
            'plan_name' => 'Growth',
            'product_limit' => 5000,
            'store_limit' => 3,
            'order_monthly_limit' => 1000,
            'feature_flags' => [
                'ai_pricing' => true,
                'staging_area' => true,
                'channel_sync' => true
            ]
        ];

        $this->cache = array_merge($defaults, $config);
    }

    /**
     * Get the current Tenant ID.
     */
    public function get_tenant_id()
    {
        return $this->current_tenant_id;
    }

    /**
     * Get the current Store Connection ID.
     */
    public function get_store_connection_id()
    {
        return $this->current_store_connection_id;
    }

    /**
     * Set the context manually (For Jobs/Webhooks).
     */
    public function set_context($tenant_id, $store_connection_id = null)
    {
        $this->current_tenant_id = $tenant_id;
        $this->current_store_connection_id = $store_connection_id;
        $this->load_config();
    }

    /**
     * Set the store context manually.
     */
    public function set_store_context($store_connection_id)
    {
        $this->current_store_connection_id = $store_connection_id;
        $this->load_config();
    }

    /**
     * Check if a feature/limit is allowed.
     */
    public function check_entitlement($key, $current_count = null)
    {
        // 1. Feature Flag Check
        if (isset($this->cache['feature_flags'][$key])) {
            return (bool) $this->cache['feature_flags'][$key];
        }

        // 2. Numeric Limit Check
        if ($current_count !== null && isset($this->cache[$key])) {
            return $current_count < (int) $this->cache[$key];
        }

        return false;
    }

    /**
     * Get a config value.
     */
    public function get_config($key)
    {
        return $this->cache[$key] ?? null;
    }

    /**
     * SaaS Guard: Ensure current tenant has access to the provided store connection.
     */
    public function validate_connection_access($store_connection_id)
    {
        if ($this->current_tenant_id === 'platform')
            return true;

        global $wpdb;
        $table = $wpdb->prefix . 'gds_store_connections';
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT 1 FROM $table WHERE tenant_id = %s AND store_connection_id = %s LIMIT 1",
            $this->current_tenant_id,
            $store_connection_id
        ));

        if (!$exists) {
            error_log("[GDS Security] Cross-tenant access attempt by {$this->current_tenant_id} on store {$store_connection_id}");
            return false;
        }

        return true;
    }
}
