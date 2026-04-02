<?php
require_once __DIR__ . '/../../../wp-load.php';

// Render form to generate nonce
$html = \GDS\Core\Shortcodes::render_signup_form([]);
preg_match('/name="_wpnonce" value="([^"]+)"/', $html, $matches);
$nonce = $matches[1] ?? 'missing';
echo "Found Nonce: $nonce\n";

if ($nonce === 'missing')
    die("Fail.");

$_POST['gds_do_onboarding'] = 1;
$_POST['tenant_id'] = 'test-live-1';
$_POST['domain'] = 'live1.com';
$_POST['plan_name'] = 'Basic';
$_REQUEST['_wpnonce'] = $nonce;

try {
    \GDS\Core\Shortcodes::handle_signup_submission();
    echo "NO DIE.";
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage();
} catch (Error $e) {
    echo "ERROR: " . $e->getMessage();
}
