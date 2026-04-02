<?php
namespace GDS\Storefront;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Studio Manager Class.
 * 
 * Manages the Storefront Studio (Visual Section Editor) logic and industry kits.
 */
class StudioManager
{
    /**
     * Main instance of StudioManager.
     *
     * @var StudioManager
     */
    protected static $_instance = null;

    /**
     * Main StudioManager Instance.
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Get available theme kits for the tenant.
     */
    public function get_kits()
    {
        return [
            'dropnex-premium' => [
                'name' => 'Dropnex Premium',
                'version' => '2.2.1',
                'description' => 'High-density dark mode optimized for conversion.'
            ],
            'industrial' => [
                'name' => 'Industrial Default',
                'version' => '1.0.0',
                'description' => 'Clean, flat design for dropshipping storefronts.'
            ]
        ];
    }

    /**
     * Get section library for the current theme.
     */
    public function get_section_library()
    {
        return [
            'hero' => 'High-impact above the fold content.',
            'collection_grid' => 'Multi-column product categorization.',
            'testimonials' => 'Social proof and trust badges.',
            'faq' => 'Conversion-focused query resolution.'
        ];
    }

    /**
     * Build a staging snapshot of the storefront layout.
     */
    public function create_staging_snapshot($layout_json)
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $table = $wpdb->prefix . 'gds_studio_staging';

        return $wpdb->insert($table, array(
            'tenant_id' => $registry->get_tenant_id(),
            'store_connection_id' => $registry->get_store_connection_id(),
            'layout_json' => is_string($layout_json) ? $layout_json : json_encode($layout_json),
            'created_at' => current_time('mysql')
        ));
    }

    /**
     * Publish staging layout to live site.
     */
    public function publish_layout()
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $table = $wpdb->prefix . 'gds_studio_staging';

        $latest = $wpdb->get_var($wpdb->prepare(
            "SELECT layout_json FROM $table WHERE tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL) ORDER BY id DESC LIMIT 1",
            $registry->get_tenant_id(),
            $registry->get_store_connection_id()
        ));

        if ($latest) {
            $context_key = 'gds_studio_live_layout_' . $registry->get_tenant_id() . '_' . ($registry->get_store_connection_id() ?? 'global');
            update_option($context_key, $latest);
            return true;
        }
        return false;
    }
}
