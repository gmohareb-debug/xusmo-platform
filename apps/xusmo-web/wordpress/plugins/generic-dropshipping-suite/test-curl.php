<?php
$ch = curl_init('http://localhost/?view=signup');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$html = curl_exec($ch);

preg_match('/name="_wpnonce" value="([^"]+)"/', $html, $matches);
$nonce = $matches[1] ?? 'missing';
echo "Found Nonce: $nonce\n";

$ch2 = curl_init('http://localhost/?view=signup');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, [
    'gds_do_onboarding' => '1',
    '_wpnonce' => $nonce,
    'tenant_id' => 'test-live-' . time(),
    'domain' => time() . 'live.com',
    'plan_name' => 'Basic'
]);
$html2 = curl_exec($ch2);
echo "RESPONSE:\n";
echo substr(strip_tags($html2), 0, 1000);
