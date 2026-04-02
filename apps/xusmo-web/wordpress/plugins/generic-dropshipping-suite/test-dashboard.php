<?php
require_once __DIR__ . '/../../../wp-load.php';

echo "Setting user...\n";
$user = get_user_by('login', 'tenant1');
wp_set_current_user($user->ID);

try {
    echo "Loading admin files...\n";
    require_once ABSPATH . 'wp-admin/includes/admin.php';

    $_GET['page'] = 'gds-dashboard';
    $_GET['gds_mode'] = 'tenant';

    echo "Invoking AdminManager instance...\n";
    $admin = \GDS\Admin\AdminManager::instance();

    echo "Rendering dashboard...\n";
    ob_start();
    $admin->render_dashboard();
    ob_end_clean();
    echo "DONE.\n";
} catch (Throwable $e) {
    echo "Caught Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
}
