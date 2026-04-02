<?php
$html = file_get_contents('http://localhost/?gds_saas_landing=1');
if (strpos($html, 'DropNex SaaS') !== false) {
    echo "SUCCESS: Found Landing Page\n";
} else {
    echo "ERROR: Landing page not found. Length: " . strlen($html) . "\n";
}
