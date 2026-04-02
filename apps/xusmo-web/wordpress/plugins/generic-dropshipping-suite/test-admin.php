<?php
require_once __DIR__ . '/../../../wp-load.php';

$user = get_user_by('login', 'tenant1');
wp_set_current_user($user->ID);

$_GET['page'] = 'gds-dashboard';
$_GET['gds_mode'] = 'tenant';

require_once ABSPATH . 'wp-admin/admin.php';
