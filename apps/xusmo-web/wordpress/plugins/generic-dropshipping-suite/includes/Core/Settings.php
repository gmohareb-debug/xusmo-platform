<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Settings Manager (Decision Register).
 * 
 * Implements the policy defaults and environment configuration from the Codex Inputs Pack.
 */
class Settings
{

    const OPTION_NAME = 'gds_settings';

    /**
     * Default settings based on Codex Inputs Pack v1.1.
     */
    private static function get_defaults()
    {
        return array(
            // Core Policy Defaults
            'return_window_days' => 30,
            'non_returnable_categories' => array(),
            'safety_stock_buffer' => 2,
            'stale_inventory_threshold' => 12, // Hours
            'stale_behavior' => 'out_of_stock', // hide | keep_last | out_of_stock
            'backorders_enabled' => false,
            'handling_time_days' => 2,
            'split_orders_enabled' => true,
            'po_submission_trigger' => 'processing', // on paid/processing

            // Pricing & FX
            'default_markup_multiplier' => 1.6,
            'price_rounding_strategy' => '.99',
            'price_outlier_threshold' => 40, // % change
            'map_enforcement_enabled' => true,
            'store_display_currency' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD',
            'fx_conversion_mode' => 'manual', // manual | free_api
            'fx_failure_policy' => 'freeze_last_known',
            'fx_buffer_percent' => 0,

            // Fulfillment & Security
            'order_cancellation_window' => 30, // Minutes
            'shipment_email_mode' => 'per_shipment', // per_shipment | consolidated
            'guest_tracking_mode' => 'secure_token_link', // secure_token_link | id_email
            'email_po_fallback' => true,

            // Retention
            'log_retention_days' => 60,
            'audit_retention_days' => 365,
            'export_masking_enabled' => true,
        );
    }

    /**
     * Get a specific setting or all settings.
     */
    public static function get($key = null)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $option_name = self::OPTION_NAME . '_' . $tenant_id;
        $settings = get_option($option_name, array());
        $defaults = self::get_defaults();
        $merged = wp_parse_args($settings, $defaults);

        if ($key) {
            return isset($merged[$key]) ? $merged[$key] : null;
        }

        return $merged;
    }

    /**
     * Update a specific setting.
     */
    public static function update($key, $value)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $option_name = self::OPTION_NAME . '_' . $tenant_id;
        $settings = get_option($option_name, array());
        $settings[$key] = $value;
        return update_option($option_name, $settings);
    }
}
