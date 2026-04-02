<?php
/**
 * GDS E2E QA Script
 * 
 * Run this to simulate the entire flow from Import to PO Completion.
 */

// Find wp-load.php robustly
if (file_exists(__DIR__ . '/wp-load.php')) {
    require_once __DIR__ . '/wp-load.php';
} elseif (file_exists('/var/www/html/wp-load.php')) {
    require_once '/var/www/html/wp-load.php';
} else {
    die("Error: wp-load.php not found. Run this from within the WordPress directory.\n");
}

if (php_sapi_name() !== 'cli') {
    die('This script must be run from the CLI.');
}

function gds_qa_run()
{
    echo "--- GDS E2E QA START ---\n";

    global $wpdb;
    \GDS\Core\TenantRegistry::instance()->set_context('primary_tenant');

    // 1. Setup Mock Supplier
    echo "[1/5] Setting up Mock Supplier...\n";
    $supplier_id = \GDS\Core\SupplierManager::create_supplier(array(
        'name' => 'QA Mock Supplier',
        'connector_type' => 'mock',
        'is_active' => 1,
        'config' => array('endpoint' => 'http://qa-mock.local')
    ));
    echo "Done. Supplier ID: $supplier_id\n";

    // 2. Trigger Catalog Import (Synchronous for test consistency)
    echo "[2/5] Running Catalog Import...\n";
    $catalog_agent = \GDS\Core\AgentRegistry::instance()->get('catalog');
    $catalog_agent->process_import(null, $supplier_id);
    echo "Done. Staging tables populated.\n";

    // 3. Publish to WooCommerce
    echo "[3/5] Publishing to WooCommerce...\n";
    $product_agent = \GDS\Core\AgentRegistry::instance()->get('product');
    $res = $product_agent->publish_all_from_supplier($supplier_id);
    echo "Done. Published: {$res['success']}, Failed: {$res['failed']}\n";

    // 4. Simulate a WC Order
    echo "[4/5] Simulating WooCommerce Order...\n";
    // Find a published variation ID
    $v_id = $wpdb->get_var("SELECT v.published_variation_id FROM {$wpdb->prefix}gds_supplier_variants v JOIN {$wpdb->prefix}gds_supplier_products p ON v.product_id = p.id WHERE p.supplier_id = $supplier_id LIMIT 1");

    if (!$v_id) {
        die("Error: No published variations found for order simulation.\n");
    }

    $order = wc_create_order();
    $product = wc_get_product($v_id);
    $order->add_product($product, 1);
    $order->set_address(array('first_name' => 'QA', 'last_name' => 'Tester', 'email' => 'qa@test.com'), 'billing');
    $order->calculate_totals();
    $order->update_status('processing', 'QA Simulation', true);

    $order_id = $order->get_id();
    echo "Done. Created WC Order #$order_id\n";

    // 5. Verify PO Creation
    echo "[5/5] Verifying PO Creation...\n";
    $registry = \GDS\Core\TenantRegistry::instance();
    $tenant_id = $registry->get_tenant_id();
    $store_id = $registry->get_store_connection_id();

    $po_count = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->prefix}gds_purchase_orders WHERE order_id = %d AND tenant_id = %s" . ($store_id ? " AND store_connection_id = %s" : ""),
        ...($store_id ? [$order_id, $tenant_id, $store_id] : [$order_id, $tenant_id])
    ));

    if ($po_count > 0) {
        echo "SUCCESS: $po_count PO(s) created for the order.\n";
    } else {
        echo "FAILURE: No POs found for the order.\n";
    }

    echo "--- GDS E2E QA COMPLETE ---\n";
}

gds_qa_run();
