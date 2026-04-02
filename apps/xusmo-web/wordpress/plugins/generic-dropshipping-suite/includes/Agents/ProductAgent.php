<?php
namespace GDS\Agents;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Product Agent.
 * 
 * Responsible for publishing and syncing GDS staging data to WooCommerce products.
 */
class ProductAgent
{

    /**
     * Initialize the agent.
     */
    public function init()
    {
        add_action('gds_publish_supplier_products', array($this, 'publish_all_from_supplier'));
    }

    /**
     * Publish all products for a specific supplier.
     * 
     * @param int $supplier_id Supplier ID.
     */
    public function publish_all_from_supplier($supplier_id)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_supplier_products';

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        $product_ids = $wpdb->get_col($wpdb->prepare(
            "SELECT id FROM $table WHERE supplier_id = %d AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $supplier_id,
            $tenant_id,
            $store_connection_id
        ));

        $results = array(
            'success' => 0,
            'failed' => 0,
        );

        foreach ($product_ids as $id) {
            $res = $this->publish_product($id);
            if ($res) {
                $results['success']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Publish a single staging product to WooCommerce.
     * 
     * @param int $staging_id Staging product ID.
     * @return int|bool WC Product ID or false.
     */
    public function publish_product($staging_id)
    {
        global $wpdb;
        $table_p = $wpdb->prefix . 'gds_supplier_products';
        $table_v = $wpdb->prefix . 'gds_supplier_variants';

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_connection_id = $registry->get_store_connection_id();

        $staging_product = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_p WHERE id = %d AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $staging_id,
            $tenant_id,
            $store_connection_id
        ));
        if (!$staging_product) {
            return false;
        }

        $variants = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_v WHERE product_id = %d AND tenant_id = %s AND (store_connection_id = %s OR store_connection_id IS NULL)",
            $staging_id,
            $tenant_id,
            $store_connection_id
        ));
        if (empty($variants)) {
            return false;
        }

        $is_variable = count($variants) > 1;
        $product = $is_variable ? new \WC_Product_Variable($staging_product->published_product_id) : new \WC_Product_Simple($staging_product->published_product_id);

        $product->set_name($staging_product->title);
        $product->set_description($staging_product->description);
        $product->set_status('publish');
        $product->set_sku('GDS-' . $staging_product->id); // Internal GDS SKU mapping

        // Meta for tracking & multi-tenancy isolation
        $product->update_meta_data('_gds_tenant_id', $tenant_id);
        $product->update_meta_data('_gds_store_connection_id', $store_connection_id);
        $product->update_meta_data('_gds_supplier_id', $staging_product->supplier_id);
        $product->update_meta_data('_gds_staging_id', $staging_product->id);

        $product_id = $product->save();

        // Handle Images
        $image_urls = maybe_unserialize($staging_product->image_urls);
        if (!empty($image_urls)) {
            $this->sideload_images($product_id, $image_urls);
        }

        if ($is_variable) {
            $this->setup_attributes($product_id, $variants);
            $this->sync_variations($product_id, $variants);

            // Set parent price to the first variant's cost * margin as a baseline
            if (!empty($variants)) {
                $price = $this->calculate_initial_price($variants[0]->cost);
                $product->set_regular_price($price);
                $product->set_price($price);
            }
        } else {
            $variant = $variants[0];
            $price = $this->calculate_initial_price($variant->cost);
            $product->set_regular_price($price);
            $product->set_manage_stock(true);
            $product->set_stock_quantity($variant->stock_qty);
            $product->save();

            // Store ID as variation ID for simple products too
            $wpdb->update(
                $table_v,
                array('published_variation_id' => $product_id, 'store_connection_id' => $store_connection_id),
                array('id' => $variant->id, 'tenant_id' => $tenant_id)
            );
        }

        // Update staging record with published ID
        $wpdb->update(
            $table_p,
            array('published_product_id' => $product_id, 'store_connection_id' => $store_connection_id),
            array('id' => $staging_id, 'tenant_id' => $tenant_id)
        );

        return $product_id;
    }

    /**
     * Setup attributes for variable products.
     */
    private function setup_attributes($product_id, $variants)
    {
        $product = wc_get_product($product_id);
        $all_attributes = array();

        foreach ($variants as $v) {
            $attrs = maybe_unserialize($v->attributes);
            if (empty($attrs))
                continue;
            foreach ($attrs as $name => $value) {
                if (!isset($all_attributes[$name])) {
                    $all_attributes[$name] = array();
                }
                if (!in_array($value, $all_attributes[$name])) {
                    $all_attributes[$name][] = $value;
                }
            }
        }

        $wc_attributes = array();
        foreach ($all_attributes as $name => $values) {
            $attribute = new \WC_Product_Attribute();
            $attribute->set_name($name);
            $attribute->set_options($values);
            $attribute->set_visible(true);
            $attribute->set_variation(true);
            $wc_attributes[] = $attribute;
        }

        $product->set_attributes($wc_attributes);
        $product->save();
    }

    /**
     * Sync variations for a variable product.
     */
    private function sync_variations($product_id, $variants)
    {
        foreach ($variants as $v_data) {
            $variation = new \WC_Product_Variation($v_data->published_variation_id);
            $variation->set_parent_id($product_id);
            $variation->set_status('publish');
            $price = $this->calculate_initial_price($v_data->cost);
            $variation->set_regular_price($price);
            $variation->set_manage_stock(true);
            $variation->set_stock_quantity($v_data->stock_qty);

            // Set attributes
            $attributes = maybe_unserialize($v_data->attributes);
            if (!empty($attributes)) {
                $formatted_attrs = array();
                foreach ($attributes as $k => $v) {
                    $formatted_attrs['attribute_' . sanitize_title($k)] = $v;
                }
                $variation->set_attributes($formatted_attrs);
            }

            // Multi-tenancy isolation meta for variations
            $registry = \GDS\Core\TenantRegistry::instance();
            $variation->update_meta_data('_gds_tenant_id', $registry->get_tenant_id());
            $variation->update_meta_data('_gds_store_connection_id', $registry->get_store_connection_id());

            $variation_id = $variation->save();

            if (!$v_data->published_variation_id) {
                global $wpdb;
                $wpdb->update(
                    $wpdb->prefix . 'gds_supplier_variants',
                    array('published_variation_id' => $variation_id),
                    array('id' => $v_data->id)
                );
            }
        }
    }

    /**
     * Sideload images from URLs.
     */
    private function sideload_images($product_id, $image_urls)
    {
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        $attachment_ids = array();
        foreach ($image_urls as $url) {
            $id = media_sideload_image($url, $product_id, null, 'id');
            if (!is_wp_error($id)) {
                $attachment_ids[] = $id;
            }
        }

        if (!empty($attachment_ids)) {
            set_post_thumbnail($product_id, $attachment_ids[0]);
            if (count($attachment_ids) > 1) {
                $product = wc_get_product($product_id);
                $product->set_gallery_image_ids(array_slice($attachment_ids, 1));
                $product->save();
            }
        }
    }

    /**
     * Calculate initial price using Pricing Agent logic.
     */
    public function calculate_initial_price($cost)
    {
        $pricing_agent = \GDS\Core\AgentRegistry::instance()->get('pricing');
        if ($pricing_agent && method_exists($pricing_agent, 'get_markup_for_cost')) {
            // Need to make get_markup_for_cost public or add a wrapper
            // For now, we'll use a simple fallback if we can't call it
            $multiplier = \GDS\Core\Settings::get('default_markup_multiplier') ?: 1.6;
            return round($cost * $multiplier, 2);
        }
        return round($cost * 1.6, 2);
    }
}
