<?php
require '/var/www/html/wp-load.php';
$order_id = 59;
$order = wc_get_order($order_id);
if (!$order) {
    die("Order $order_id not found\n");
}
foreach ($order->get_items() as $item_id => $item) {
    echo "Item ID: $item_id, Name: " . $item->get_name() . ", Product ID: " . $item->get_product_id() . ", Variation ID: " . $item->get_variation_id() . "\n";
    $target_id = $item->get_variation_id() ?: $item->get_product_id();
    
    global $wpdb;
    $table_v = $wpdb->prefix . 'gds_supplier_variants';
    $table_p = $wpdb->prefix . 'gds_supplier_products';
    $tenant_id = 'primary_tenant';
    
    $row = $wpdb->get_row($wpdb->prepare(
            "SELECT p.supplier_id, v.cost, v.supplier_v_sku 
             FROM $table_v v 
             JOIN $table_p p ON v.product_id = p.id
             WHERE (v.published_variation_id = %d OR p.published_product_id = %d)
             AND v.tenant_id = %s AND p.tenant_id = %s",
            $target_id, $target_id, $tenant_id, $tenant_id
    ));
    echo "Query Result: " . var_export($row, true) . "\n";
}
