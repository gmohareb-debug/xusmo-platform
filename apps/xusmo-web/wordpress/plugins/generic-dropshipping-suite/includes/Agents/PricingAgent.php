<?php
namespace GDS\Agents;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Pricing Agent.
 * 
 * Responsible for margin protection and rule-based pricing optimization.
 */
class PricingAgent
{

    /**
     * Initialize the agent and register its callbacks.
     */
    public function init()
    {
        // Hook into pricing update events.
        add_action('gds_pricing_update_trigger', array($this, 'evaluate_prices'));

        // Hook for stale inventory cleanup (can be scheduled via WP-Cron)
        add_action('gds_cleanup_stale_inventory', array($this, 'handle_stale_inventory'));
    }

    /**
     * Evaluate and update product prices based on rules.
     * 
     * @param array $product_ids Optional list of product IDs to evaluate.
     */
    public function evaluate_prices($product_ids = array())
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_variants';

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        $query = $wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $tenant_id,
            $store_connection_id
        );

        if (!empty($product_ids)) {
            $ids = implode(',', array_map('intval', $product_ids));
            $query .= " AND product_id IN ($ids)";
        }

        $variants = $wpdb->get_results($query, ARRAY_A);

        $outlier_threshold = \GDS\Core\Settings::get('price_outlier_threshold');

        error_log("[GDS Pricing Agent] Evaluating prices for " . count($variants) . " variants [Store: $store_connection_id].");

        foreach ($variants as $variant) {
            $cost = floatval($variant['cost']);
            $current_price = floatval($variant['price']);

            // 1. Calculate new target price using bracketed rules
            $markup = $this->get_markup_for_cost($cost, $store_connection_id);
            $target_price = $cost * $markup;
            $final_price = $this->apply_rounding($target_price);

            // 2. Outlier Detection
            if ($current_price > 0) {
                $change_pct = abs(($final_price - $current_price) / $current_price) * 100;
                if ($change_pct > $outlier_threshold) {
                    $this->quarantine_variant($variant['id'], "Price change of " . round($change_pct, 2) . "% exceeds threshold.");
                    continue;
                }
            }

            // 3. Update Record
            $wpdb->update(
                $table,
                array(
                    'price' => $final_price,
                    'is_quarantined' => 0
                ),
                array('id' => $variant['id'], 'tenant_id' => $tenant_id)
            );

            // 4. Trigger actual WC price update if published
            if ($variant['published_variation_id']) {
                $this->sync_to_woocommerce($variant['published_variation_id'], $final_price);
            }
        }
    }

    /**
     * Handle stale inventory based on policy.
     */
    public function handle_stale_inventory()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_variants';
        $threshold_hours = \GDS\Core\Settings::get('stale_inventory_threshold');
        $behavior = \GDS\Core\Settings::get('stale_behavior');

        $stale_time = date('Y-m-d H:i:s', strtotime("-$threshold_hours hours"));

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        // Find variants not updated within threshold
        $stale_variants = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE updated_at < %s AND stock_qty > 0 AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $stale_time,
            $tenant_id,
            $store_connection_id
        ));

        foreach ($stale_variants as $variant) {
            if ($behavior === 'out_of_stock') {
                $wpdb->update($table, array('stock_qty' => 0), array('id' => $variant->id, 'tenant_id' => $tenant_id));

                if ($variant->published_variation_id) {
                    $wc_variation = wc_get_product($variant->published_variation_id);
                    if ($wc_variation) {
                        $wc_variation->set_stock_quantity(0);
                        $wc_variation->save();
                    }
                }
                error_log("[GDS Pricing Agent] Stale inventory protection: SKU {$variant->supplier_v_sku} marked Out of Stock [Store: $store_connection_id].");
            }
        }
    }

    /**
     * Quarantine a variant for manual review.
     */
    private function quarantine_variant($id, $reason)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $wpdb->update($wpdb->prefix . 'gds_supplier_variants', array('is_quarantined' => 1), array('id' => $id, 'tenant_id' => $tenant_id));

        \GDS\Core\Logger::log('quarantine', 'product_quarantined', array('reason' => $reason), 'variant', $id);
        error_log("[GDS Pricing Agent] QUARANTINE: ID $id - $reason");
    }

    /**
     * Update price in WooCommerce.
     */
    private function sync_to_woocommerce($wc_id, $price)
    {
        $product = wc_get_product($wc_id);
        if ($product) {
            $product->set_regular_price($price);
            $product->save();
        }
    }

    /**
     * Calculate sell price based on cost
     */
    public function calculate_sell_price($cost, $store_connection_id = null)
    {
        $markup = $this->get_markup_for_cost($cost, $store_connection_id);
        $target_price = $cost * $markup;
        return $this->apply_rounding($target_price);
    }

    /**
     * Get the markup multiplier based on cost brackets.
     */
    public function get_markup_for_cost($cost, $store_connection_id = null)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_pricing_rules';

        if ($store_connection_id === null) {
            $store_connection_id = \GDS\Core\TenantRegistry::instance()->get_store_connection_id();
        }

        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();

        // Scoped Rule Selection: Try store-specific rules first, then fallback to tenant-wide
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL) AND is_active = 1 AND %f >= min_cost AND %f <= max_cost ORDER BY store_connection_id DESC, priority DESC",
            $tenant_id,
            $store_connection_id,
            $cost,
            $cost
        ));

        if (!empty($rules)) {
            $rule = $rules[0];
            if ($rule->markup_type === 'multiplier') {
                return floatval($rule->markup_value);
            } else {
                return ($cost + floatval($rule->markup_value)) / ($cost ?: 1);
            }
        }

        return \GDS\Core\Settings::get('default_markup_multiplier') ?: 1.6;
    }

    /**
     * Apply psychological rounding (.99).
     */
    private function apply_rounding($price)
    {
        $strategy = \GDS\Core\Settings::get('price_rounding_strategy');
        if ($strategy === '.99') {
            return ceil($price) - 0.01;
        }
        return round($price, 2);
    }
}
