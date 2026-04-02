<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Capabilities Class.
 * 
 * Handles registration of GDS-specific roles and capabilities.
 */
class Capabilities
{

    /**
     * Register GDS roles and capabilities.
     */
    public static function register()
    {
        // 1. Platform Capabilities (Operator / Control Plane)
        $platform_caps = array(
            'gds_platform_access' => true,
            'gds_manage_tenants' => true,
            'gds_manage_plans' => true,
            'gds_manage_marketplace' => true,
            'gds_platform_security' => true,
            'gds_platform_ops' => true,
            'gds_support_impersonate' => true,
        );

        // 2. Tenant Capabilities (Merchant / Store Owner)
        $tenant_caps = array(
            'read' => true,
            'gds_tenant_access' => true,
            'gds_manage_suppliers' => true,
            'gds_manage_imports' => true,
            'gds_publish_catalog' => true,
            'gds_manage_orders' => true,
            'gds_manage_pricing' => true,
            'gds_manage_inventory' => true,
            'gds_manage_rmas' => true,
            'gds_view_analytics' => true,
            'gds_manage_settings' => true,
            'gds_manage_apps' => true,
            // Safe WooCommerce / Core caps
            'edit_products' => true,
            'publish_products' => true,
            'read_products' => true,
            'edit_published_products' => true,
            'view_woocommerce_reports' => true,
            'manage_woocommerce' => true,
            'upload_files' => true,
            'edit_posts' => true,
            'edit_pages' => true,
            'publish_pages' => true,
        );

        // 3. Developer Capabilities
        $dev_caps = array(
            'gds_dev_portal_access' => true,
            'gds_manage_own_apps' => true,
            'gds_access_sandboxes' => true,
        );

        // --- Register Platform Roles ---
        add_role('platform_owner', __('Platform Owner', 'gds'), array_merge(array('read' => true), $platform_caps));
        add_role('platform_ops', __('Platform Operations', 'gds'), array_merge(array('read' => true), array(
            'gds_platform_access' => true,
            'gds_platform_ops' => true,
            'gds_manage_marketplace' => true,
        )));
        add_role('platform_support', __('Platform Support', 'gds'), array(
            'read' => true,
            'gds_platform_access' => true,
            'gds_support_impersonate' => true,
        ));

        // --- Register Tenant Roles ---
        add_role('tenant_owner', __('Tenant Owner', 'gds'), array_merge(array('read' => true), $tenant_caps));
        add_role('tenant_admin', __('Tenant Admin', 'gds'), array_merge(array('read' => true), $tenant_caps));
        add_role('tenant_catalog', __('Tenant Catalog Manager', 'gds'), array(
            'read' => true,
            'gds_tenant_access' => true,
            'gds_manage_suppliers' => true,
            'gds_manage_imports' => true,
            'gds_publish_catalog' => true,
        ));
        add_role('tenant_ops', __('Tenant Operations', 'gds'), array(
            'read' => true,
            'gds_tenant_access' => true,
            'gds_manage_orders' => true,
            'gds_manage_rmas' => true,
            'gds_manage_inventory' => true,
        ));

        // --- Register Developer Roles ---
        add_role('dev_app_owner', __('Developer App Owner', 'gds'), array_merge(array('read' => true), $dev_caps));

        // 4. Add all caps to Administrator for convenience
        $admin = get_role('administrator');
        if ($admin) {
            $all_caps = array_merge($platform_caps, $tenant_caps, $dev_caps);
            foreach ($all_caps as $cap => $grant) {
                $admin->add_cap($cap);
            }
        }
    }

    /**
     * Remove GDS roles on deactivation.
     */
    public static function remove_roles()
    {
        $roles = [
            'platform_owner',
            'platform_ops',
            'platform_support',
            'tenant_owner',
            'tenant_admin',
            'tenant_catalog',
            'tenant_ops',
            'dev_app_owner'
        ];
        foreach ($roles as $role) {
            remove_role($role);
        }
    }
}
