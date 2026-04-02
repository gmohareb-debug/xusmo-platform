<?php
/**
 * AliExpress Real-World Scenario Test
 */

if (file_exists(__DIR__ . '/wp-load.php')) {
    require_once __DIR__ . '/wp-load.php';
} elseif (file_exists('/var/www/html/wp-load.php')) {
    require_once '/var/www/html/wp-load.php';
} else {
    die("Error: wp-load.php not found.\n");
}

if (php_sapi_name() !== 'cli') {
    die('This script must be run from the CLI.');
}

function run_aliexpress_scenario()
{
    global $wpdb;
    \GDS\Core\TenantRegistry::instance()->set_context('primary_tenant');
    echo "--- ALI EXPRESS REAL SCENARIO START ---\n";

    // 1. Setup AliExpress Supplier
    echo "[1/6] Registering AliExpress Supplier...\n";
    $supplier_id = \GDS\Core\SupplierManager::create_supplier(array(
        'name' => 'AliExpress Official Store',
        'connector_type' => 'aliexpress',
        'is_active' => 1,
        'config' => array('api_key' => 'ali_verified_key_123')
    ));
    echo "Done. Supplier ID: $supplier_id\n";

    // 2. Import Products
    echo "[2/6] Importing AliExpress Catalog...\n";
    $catalog_agent = \GDS\Core\AgentRegistry::instance()->get('catalog');
    $catalog_agent->process_import(null, $supplier_id);

    $product_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gds_supplier_products WHERE supplier_id = $supplier_id");
    $variant_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gds_supplier_variants v JOIN {$wpdb->prefix}gds_supplier_products p ON v.product_id = p.id WHERE p.supplier_id = $supplier_id");
    echo "Done. Imported $product_count product with $variant_count variants to staging.\n";

    // 3. Publish to WooCommerce
    echo "[3/6] Publishing variable product to WooCommerce...\n";
    $product_agent = \GDS\Core\AgentRegistry::instance()->get('product');
    $res = $product_agent->publish_all_from_supplier($supplier_id);
    echo "Done. Published successfully.\n";

    // 4. Verify Pricing Protection
    echo "[4/6] Verifying Pricing Rules...\n";
    // Add a specific rule: Multiplier 2.0 for items > $10
    $wpdb->insert($wpdb->prefix . 'gds_pricing_rules', array(
        'rule_name' => 'Electronics Premium',
        'min_cost' => 10,
        'max_cost' => 100,
        'markup_type' => 'multiplier',
        'markup_value' => 2.0,
        'priority' => 10,
        'is_active' => 1
    ));

    $pricing_agent = \GDS\Core\AgentRegistry::instance()->get('pricing');
    $pricing_agent->evaluate_prices();

    // Check one variant price
    $v_price = $wpdb->get_var("SELECT price FROM {$wpdb->prefix}gds_supplier_variants v JOIN {$wpdb->prefix}gds_supplier_products p ON v.product_id = p.id WHERE p.supplier_id = $supplier_id AND v.supplier_v_sku = 'ALI-EARBUDS-WP1-BLK'");
    echo "Black Variant Cost: $12.50 | Target Price (Markup x2.0): $$v_price\n";

    // 5. Simulate Order
    echo "[5/6] Simulating Customer Order for Sky Blue variant...\n";
    $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
    $v_id = $wpdb->get_var($wpdb->prepare(
        "SELECT v.published_variation_id 
         FROM {$wpdb->prefix}gds_supplier_variants v
         JOIN {$wpdb->prefix}gds_supplier_products p ON v.product_id = p.id
         WHERE v.supplier_v_sku = %s AND v.tenant_id = %s AND p.supplier_id = %d",
        'ALI-EARBUDS-WP1-BLU',
        $tenant_id,
        $supplier_id
    ));

    $order = wc_create_order();
    $product = wc_get_product($v_id); // This is a variation ID
    $order->add_product($product, 2); // Customer buys 2
    $order->set_address(array(
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'address_1' => '123 Tech Lane',
        'city' => 'San Francisco',
        'state' => 'CA',
        'postcode' => '94105',
        'country' => 'US'
    ), 'shipping');
    $order->calculate_totals();
    $order->update_status('processing', 'Real scenario test', true);
    $order_id = $order->get_id();
    echo "Done. Created WC Order #$order_id (Total: " . $order->get_total() . ")\n";

    // 6. Verify Fulfillment PO
    echo "[6/6] Verifying PO routed to AliExpress...\n";
    $registry = \GDS\Core\TenantRegistry::instance();
    $tenant_id = $registry->get_tenant_id();
    $store_id = $registry->get_store_connection_id();

    $sql = "SELECT * FROM {$wpdb->prefix}gds_purchase_orders WHERE order_id = %d AND tenant_id = %s";
    $params = [$order_id, $tenant_id];

    if ($store_id) {
        $sql .= " AND store_connection_id = %s";
        $params[] = $store_id;
    }

    $po = $wpdb->get_row($wpdb->prepare($sql, ...$params));

    if ($po) {
        echo "SUCCESS: PO #{$po->id} created for order #$order_id.\n";
        echo "Supplier Ref: {$po->supplier_po_ref}\n";
        echo "Items JSON: {$po->items_json}\n";
        echo "Total Cost for PO: {$po->total_cost} {$po->currency}\n";
    } else {
        echo "FAILURE: Fulfillment Agent did not create a PO.\n";
    }

    echo "--- ALI EXPRESS SCENARIO COMPLETE ---\n";
}

run_aliexpress_scenario();
