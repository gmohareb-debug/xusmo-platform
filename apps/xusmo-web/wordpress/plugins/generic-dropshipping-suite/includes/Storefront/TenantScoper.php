<?php
namespace GDS\Storefront;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Tenant Scoper Class.
 * 
 * Enforces data isolation on the storefront (WooCommerce) using tenant-based metadata filtering.
 */
class TenantScoper
{
    /**
     * Initialize the scoper.
     */
    public static function init()
    {
        // 1. Filter WooCommerce Product Queries
        add_action('pre_get_posts', array(__CLASS__, 'filter_product_queries'));

        // 2. Filter WooCommerce API / Ajax queries
        add_filter('woocommerce_product_query_meta_query', array(__CLASS__, 'add_tenant_meta_query'));
    }

    /**
     * Filter the main product query and search results.
     * 
     * @param \WP_Query $query
     */
    public static function filter_product_queries($query)
    {
        if (is_admin() || !$query->is_main_query()) {
            return;
        }

        // Only filter post types managed by GDS + WooCommerce
        $post_types = (array) $query->get('post_type');
        if (!in_array('product', $post_types)) {
            return;
        }

        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();

        // If we are on the platform or an unknown tenant, we might show everything (or nothing).
        // For SaaS, we restrict to the resolved tenant.
        if ($tenant_id === 'platform') {
            return; // Platform host can see all (or use for global discovery)
        }

        $meta_query = $query->get('meta_query') ?: array();
        $meta_query[] = array(
            'key' => '_gds_tenant_id',
            'value' => $tenant_id,
            'compare' => '='
        );

        $query->set('meta_query', $meta_query);
    }

    /**
     * Filter WooCommerce-specific product queries (like shortcodes).
     */
    public static function add_tenant_meta_query($meta_query)
    {
        if (is_admin()) {
            return $meta_query;
        }

        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        if ($tenant_id === 'platform') {
            return $meta_query;
        }

        $meta_query[] = array(
            'key' => '_gds_tenant_id',
            'value' => $tenant_id,
            'compare' => '='
        );

        return $meta_query;
    }
}
