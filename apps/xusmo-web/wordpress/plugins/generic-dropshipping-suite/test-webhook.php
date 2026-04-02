<?php
require '/var/www/html/wp-load.php';

echo "--- Webhook Validation Test ---\n";

// 1. Test without signature
$request = new \WP_REST_Request('POST', '/gds/v1/fulfillment/tracking');
$api_manager = new \GDS\Core\RestApiManager();
$result = $api_manager->verify_webhook_signature($request);
echo "No signature result: " . var_export($result, true) . "\n";

// 2. Test with signature but missing secret (simulate missing PO/supplier)
$request->set_header('X-GDS-Signature', 'some_sig');
$request->set_header('X-GDS-Timestamp', time());
$request->set_header('X-GDS-Nonce', 'some_nonce');
$request->set_param('id', 999999); // Non-existent PO

$result = $api_manager->verify_webhook_signature($request);
if (is_wp_error($result)) {
    echo "Error Code: " . $result->get_error_code() . "\n";
    echo "Error Message: " . $result->get_error_message() . "\n";
    echo "Error Status: " . $result->get_error_data()['status'] . "\n";
} else {
    echo "Result: " . var_export($result, true) . "\n";
}
