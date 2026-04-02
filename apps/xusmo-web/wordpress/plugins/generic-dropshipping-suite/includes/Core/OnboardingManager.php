<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Onboarding Manager.
 * 
 * Handles self-provisioning of new tenants and storefronts.
 */
class OnboardingManager
{
    protected static $_instance = null;

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Provision a new tenant and a default storefront.
     * 
     * @param string $tenant_id The unique slug for the tenant.
     * @param string $domain The target domain/hostname.
     * @param string $plan_name The subscription plan.
     * @return array|(\WP_Error) Result of provisioning.
     */
    public function provision_tenant($tenant_id, $domain, $plan_name = 'Growth')
    {
        global $wpdb;
        $tenant_id = sanitize_key($tenant_id);
        $domain = sanitize_text_field($domain);
        $plan_name = sanitize_text_field($plan_name);

        if (empty($tenant_id) || empty($domain)) {
            return new \WP_Error('missing_fields', 'Tenant ID and Domain are required.');
        }

        $table_tenants = $wpdb->prefix . 'gds_tenants';
        $table_conn = $wpdb->prefix . 'gds_store_connections';

        // 1. Check if tenant or domain already exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table_tenants WHERE tenant_id = %s OR domain = %s LIMIT 1",
            $tenant_id,
            $domain
        ));

        if ($exists) {
            return new \WP_Error('duplicate_tenant', 'This Store ID or Domain is already registered.');
        }

        // 2. Insert Tenant
        $wpdb->insert($table_tenants, array(
            'tenant_id' => $tenant_id,
            'domain' => $domain,
            'plan_name' => $plan_name,
            'status' => 'active'
        ));

        $tenant_record_id = $wpdb->insert_id;

        // 3. Auto-provision first Store Connection (The "Primary Store")
        $store_id = $tenant_id . '_primary';
        $wpdb->insert($table_conn, array(
            'store_connection_id' => $store_id,
            'tenant_id' => $tenant_id,
            'platform_type' => 'woocommerce_internal',
            'store_domain' => $domain,
            'status' => 'connected'
        ));

        // 4. Record Audit Event
        Logger::log('onboarding', 'tenant_provisioned', array('domain' => $domain), 'tenant', $tenant_record_id);

        return array(
            'success' => true,
            'tenant_id' => $tenant_id,
            'store_id' => $store_id,
            'admin_url' => admin_url('admin.php?page=gds-dashboard&gds_mode=tenant')
        );
    }
}
