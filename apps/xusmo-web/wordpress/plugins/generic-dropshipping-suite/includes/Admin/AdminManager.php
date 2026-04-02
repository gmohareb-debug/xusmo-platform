<?php
namespace GDS\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Manager Class.
 * 
 * Orchestrates the GDS admin interface with full CRUD and operational logic.
 */
class AdminManager
{
    protected static $_instance = null;

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function init()
    {
        add_action('admin_menu', array($this, 'register_menus'));
        add_action('admin_menu', array($this, 'restrict_tenant_menus'), 999);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets')); // This line was in the original and not explicitly removed by the instruction's snippet.
        add_action('admin_init', array($this, 'handle_admin_requests'));

        // AJAX handlers
        add_action('wp_ajax_gds_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_gds_run_import', array($this, 'ajax_run_import'));
        add_action('wp_ajax_gds_publish_products', array($this, 'ajax_publish_products'));
        add_action('wp_ajax_gds_switch_context', array($this, 'ajax_switch_context'));

        // Ensure capabilities are set for administrator during development
        // if (is_admin() && current_user_can('manage_options')) {
        //     \GDS\Core\Capabilities::register();
        // }

        // Disable WooCommerce redirecting non-admin users if they have gds_tenant_access
        add_filter('woocommerce_prevent_admin_access', function ($prevent_access) {
            if (current_user_can('gds_tenant_access') || current_user_can('gds_platform_access')) {
                return false;
            }
            return $prevent_access;
        });
    }


    /**
     * Handle non-ajax admin requests (Forms, Deletes, Exports).
     */
    public function handle_admin_requests()
    {
        // 1. Supplier Management
        if (isset($_REQUEST['page']) && $_REQUEST['page'] === 'gds-suppliers') {
            if (isset($_POST['gds_action']) && $_POST['gds_action'] === 'save_supplier') {
                check_admin_referer('gds_save_supplier');
                if (!current_user_can('gds_manage_suppliers'))
                    wp_die('Denied');

                $id = !empty($_POST['id']) ? intval($_POST['id']) : 0;
                $data = array(
                    'name' => sanitize_text_field($_POST['name']),
                    'connector_type' => sanitize_key($_POST['connector_type']),
                    'config' => array(), // Logic for sub-config can be expanded
                    'is_active' => isset($_POST['is_active']) ? 1 : 0,
                );

                if ($id > 0) {
                    \GDS\Core\SupplierManager::update_supplier($id, $data);
                } else {
                    \GDS\Core\SupplierManager::create_supplier($data);
                }
                wp_redirect(admin_url('admin.php?page=gds-suppliers&message=saved'));
                exit;
            }

            if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
                check_admin_referer('delete_' . $_GET['id']);
                if (!current_user_can('gds_manage_suppliers'))
                    wp_die('Denied');
                \GDS\Core\SupplierManager::delete_supplier($_GET['id']);
                wp_redirect(admin_url('admin.php?page=gds-suppliers&message=deleted'));
                exit;
            }
        }

        // 2. Pricing Rules Management
        if (isset($_REQUEST['page']) && $_REQUEST['page'] === 'gds-pricing-rules') {
            if (isset($_POST['gds_action']) && $_POST['gds_action'] === 'save_pricing_rule') {
                check_admin_referer('gds_save_pricing_rule');
                if (!current_user_can('manage_options'))
                    wp_die('Denied');

                $id = !empty($_POST['id']) ? intval($_POST['id']) : 0;
                $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
                global $wpdb;
                $table = $wpdb->prefix . 'gds_pricing_rules';
                $data = array(
                    'tenant_id' => $tenant_id,
                    'rule_name' => sanitize_text_field($_POST['rule_name']),
                    'min_cost' => floatval($_POST['min_cost']),
                    'max_cost' => floatval($_POST['max_cost']),
                    'markup_type' => sanitize_text_field($_POST['markup_type']),
                    'markup_value' => floatval($_POST['markup_value']),
                    'priority' => intval($_POST['priority']),
                    'is_active' => 1
                );

                if ($id > 0) {
                    $wpdb->update($table, $data, array('id' => $id, 'tenant_id' => $tenant_id));
                } else {
                    $wpdb->insert($table, $data);
                }
                wp_redirect(admin_url('admin.php?page=gds-pricing-rules&message=saved'));
                exit;
            }
        }

        // 3. Operational Actions (RMA, Export)
        if (isset($_GET['action']) && $_GET['action'] === 'export_csv' && isset($_GET['table'])) {
            $this->handle_export($_GET['table']);
        }

        if (isset($_GET['action']) && $_GET['action'] === 'rma_status' && isset($_GET['id'])) {
            check_admin_referer('rma_action_' . $_GET['id']);
            $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
            global $wpdb;
            $wpdb->update($wpdb->prefix . 'gds_rma_requests', array('status' => sanitize_text_field($_GET['status'])), array('id' => intval($_GET['id']), 'tenant_id' => $tenant_id));
            wp_redirect(admin_url('admin.php?page=gds-rma&message=updated'));
            exit;
        }

        // 4. Settings Management
        if (isset($_POST['gds_action']) && $_POST['gds_action'] === 'save_settings') {
            check_admin_referer('gds_save_settings');
            if (!current_user_can('gds_manage_settings'))
                wp_die('Denied');

            $all_settings = \GDS\Core\Settings::get();
            foreach ($all_settings as $key => $default_value) {
                if (is_bool($default_value)) {
                    $new_val = isset($_POST[$key]) ? true : false;
                    \GDS\Core\Settings::update($key, $new_val);
                } elseif (isset($_POST[$key])) {
                    $new_val = is_array($_POST[$key]) ? array_map('sanitize_text_field', $_POST[$key]) : sanitize_text_field($_POST[$key]);
                    \GDS\Core\Settings::update($key, $new_val);
                }
            }
            if (isset($_POST['webhook_secret'])) {
                \GDS\Core\Settings::update('webhook_secret', sanitize_text_field($_POST['webhook_secret']));
            }

            wp_redirect(admin_url('admin.php?page=gds-settings&message=saved'));
            exit;
        }

        // 5. Support Impersonation
        if (isset($_GET['gds_impersonate']) && current_user_can('gds_support_impersonate')) {
            check_admin_referer('gds_impersonate');
            $target_tenant = sanitize_text_field($_GET['gds_impersonate']);
            $reason = sanitize_text_field($_GET['reason'] ?? 'Support Request');

            \GDS\Core\TenantRegistry::instance()->set_context($target_tenant, null);
            \GDS\Core\Logger::log('security', 'SUPPORT_IMPERSONATION_START', array('tenant' => $target_tenant, 'reason' => $reason), 'audit');

            wp_redirect(admin_url('admin.php?page=gds-dashboard&impersonating=1'));
            exit;
        }
    }

    private function handle_export($table_name)
    {
        global $wpdb;
        $allowed = array('gds_audit_log', 'gds_purchase_orders', 'gds_supplier_variants');
        if (!in_array($table_name, $allowed))
            wp_die('Invalid table');

        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}$table_name WHERE tenant_id = %s", $tenant_id), ARRAY_A);
        if (empty($results))
            wp_die('No data');

        $masking_enabled = \GDS\Core\Settings::get('export_masking_enabled');

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename=' . $table_name . '.csv');
        $out = fopen('php://output', 'w');
        fputcsv($out, array_keys($results[0]));
        foreach ($results as $row) {
            if ($masking_enabled) {
                foreach ($row as $col => &$val) {
                    if (strpos($col, 'email') !== false && !empty($val)) {
                        $parts = explode('@', $val);
                        $val = substr($parts[0], 0, 1) . '***@' . ($parts[1] ?? 'unknown.com');
                    }
                    if (in_array($col, ['customer_name', 'shipping_address', 'billing_address'])) {
                        $val = '*** MASKED ***';
                    }
                }
            }
            fputcsv($out, $row);
        }
        fclose($out);
        exit;
    }

    public function register_menus()
    {
        $current_host = $_SERVER['HTTP_HOST'] ?? '';
        $platform_host = defined('GDS_PLATFORM_HOST') ? GDS_PLATFORM_HOST : 'platform.' . parse_url(home_url(), PHP_URL_HOST);
        $dev_host = defined('GDS_DEV_HOST') ? GDS_DEV_HOST : 'dev.' . parse_url(home_url(), PHP_URL_HOST);

        // --- Local Mode Simulation ---
        // On localhost, we allow switching modes via URL/Session for testing separation
        if (isset($_GET['gds_mode'])) {
            set_transient('gds_ui_mode_' . get_current_user_id(), sanitize_key($_GET['gds_mode']), HOUR_IN_SECONDS);
        }
        $forced_mode = get_transient('gds_ui_mode_' . get_current_user_id());

        // --- 1. Platform Admin Console (Control Plane) ---
        $is_platform_view = ($current_host === $platform_host) || ($forced_mode === 'platform');

        if ($is_platform_view && current_user_can('gds_platform_access')) {
            add_menu_page(__('GDS Control Plane', 'gds'), __('GDS Control Plane', 'gds'), 'gds_platform_access', 'gds-platform', array($this, 'render_platform_console'), 'dashicons-networking', 2);
            add_submenu_page('gds-platform', __('Tenants', 'gds'), __('Tenants', 'gds'), 'gds_manage_tenants', 'gds-platform-tenants', array($this, 'render_platform_tenants'));
            add_submenu_page('gds-platform', __('Plans & Billing', 'gds'), __('Plans & Billing', 'gds'), 'gds_manage_plans', 'gds-platform-plans', array($this, 'render_platform_plans'));
            add_submenu_page('gds-platform', __('Marketplace Review', 'gds'), __('Marketplace', 'gds'), 'gds_manage_marketplace', 'gds-platform-marketplace', array($this, 'render_platform_marketplace'));
            add_submenu_page('gds-platform', __('Fleet Operations', 'gds'), __('Fleet Ops', 'gds'), 'gds_platform_ops', 'gds-platform-ops', array($this, 'render_platform_ops'));
            add_submenu_page('gds-platform', __('Platform Security', 'gds'), __('Security', 'gds'), 'gds_platform_security', 'gds-platform-security', array($this, 'render_platform_security'));

            // On localhost, we don't 'return' if forced, but we do if on actual platform host
            if ($current_host === $platform_host || $forced_mode === 'platform')
                return;
        }

        // --- 2. Developer Portal ---
        $is_dev_view = ($current_host === $dev_host) || ($forced_mode === 'dev');

        if ($is_dev_view && current_user_can('gds_dev_portal_access')) {
            add_menu_page(__('GDS Dev Portal', 'gds'), __('Developer Portal', 'gds'), 'gds_dev_portal_access', 'gds-dev-portal', array($this, 'render_dev_portal'), 'dashicons-welcome-learn-more', 3);
            add_submenu_page('gds-dev-portal', __('My Apps', 'gds'), __('My Apps', 'gds'), 'gds_manage_own_apps', 'gds-dev-apps', array($this, 'render_dev_apps'));
            add_submenu_page('gds-dev-portal', __('Sandboxes', 'gds'), __('Sandboxes', 'gds'), 'gds_access_sandboxes', 'gds-dev-sandboxes', array($this, 'render_dev_sandboxes'));

            if ($current_host === $dev_host || $forced_mode === 'dev')
                return;
        }

        // --- 3. Tenant / Staff Console (Connector Only Interface: S5) ---
        // Only show if NOT in a forced platform/dev view
        if ((!$forced_mode || $forced_mode === 'tenant') && current_user_can('gds_tenant_access')) {
            $root_slug = 'gds-conn';
            add_menu_page(
                __('DropNex Connection', 'gds'),
                __('DropNex Connection', 'gds'),
                'manage_options',
                $root_slug,
                array($this, 'render_settings'),
                'dashicons-admin-links',
                4
            );

            add_submenu_page(
                $root_slug,
                __('Sync Controls', 'gds'),
                __('Sync Controls', 'gds'),
                'manage_options',
                'gds-sync',
                array($this, 'render_sync_controls')
            );
        }
    }

    public function enqueue_assets($hook)
    {
        if (strpos($hook, 'gds-') === false)
            return;
        wp_enqueue_style('gds-admin-premium', GDS_URL . 'assets/css/admin-style.css', array(), GDS_VERSION);
        wp_enqueue_script('gds-admin', GDS_URL . 'assets/js/admin.js', array('jquery'), GDS_VERSION, true);
        wp_localize_script('gds-admin', 'gdsAdmin', array('nonce' => wp_create_nonce('gds_admin_nonce')));
    }

    public function display_tenant_context_bar()
    {
        $screen = get_current_screen();
        if (!$screen || strpos($screen->id, 'gds-') === false)
            return;

        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_id = $registry->get_store_connection_id();

        // Fetch all store connections for this tenant to allow switching
        global $wpdb;
        $stores = $wpdb->get_results($wpdb->prepare(
            "SELECT store_connection_id, store_name FROM {$wpdb->prefix}gds_store_connections WHERE tenant_id = %s AND status = 'connected'",
            $tenant_id
        ));

        ?>
        <div class="gds-context-bar notice notice-info is-dismissible"
            style="display: flex; align-items: center; justify-content: space-between; border-left-color: #00a0d2; background: #fff; padding: 10px 20px; margin: 10px 0;">
            <div class="gds-context-info">
                <strong><?php _e('Tenant:', 'gds'); ?></strong> <span class="tag"><?php echo esc_html($tenant_id); ?></span>
                <strong style="margin-left: 15px;"><?php _e('Active Store:', 'gds'); ?></strong>
                <select id="gds-store-switcher" style="margin-left: 5px;">
                    <option value=""><?php _e('Global Context', 'gds'); ?></option>
                    <?php foreach ($stores as $s): ?>
                        <option value="<?php echo esc_attr($s->store_connection_id); ?>" <?php selected($store_id, $s->store_connection_id); ?>>
                            <?php echo esc_html($s->store_name); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="gds-context-actions">
                <?php if (isset($_GET['impersonating'])): ?>
                    <span class="impersonation-badge"
                        style="background: #d63638; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px;">IMPERSONATING</span>
                    <a href="<?php echo admin_url('admin.php?page=gds-platform'); ?>"
                        class="button button-small"><?php _e('Exit Support Mode', 'gds'); ?></a>
                <?php endif; ?>
            </div>
        </div>
        <script>
            jQuery(document).ready(function ($) {
                $('#gds-store-switcher').on('change', function () {
                    var storeId = $(this).val();
                    $.post(ajaxurl, {
                        action: 'gds_switch_context',
                        store_id: storeId,
                        nonce: gdsAdmin.nonce
                    }, function (res) {
                        if (res.success) window.location.reload();
                    });
                });
            });
        </script>
        <?php
    }

    public function render_dashboard()
    {
        require_once GDS_PATH . 'includes/Admin/DashboardManager.php';
        (new DashboardManager())->render_dashboard();
    }

    /**
     * Render the SaaS Platform Console.
     */
    public function render_platform_console()
    {
        require_once GDS_PATH . 'includes/UI/PlatformConsole.php';
        (new \GDS\UI\PlatformConsole())->render();
    }

    public function render_suppliers()
    {
        $action = $_GET['action'] ?? 'list';
        if ($action === 'add' || $action === 'edit') {
            $this->render_supplier_form($action);
            return;
        }

        require_once GDS_PATH . 'includes/Admin/SupplierListTable.php';
        $table = new SupplierListTable();
        $table->prepare_items();
        echo '<div class="wrap"><h1>' . __('Suppliers', 'gds') . ' <a href="' . admin_url('admin.php?page=gds-suppliers&action=add') . '" class="page-title-action">Add New</a></h1>';
        $table->display();
        echo '</div>';
    }

    private function render_supplier_form($action)
    {
        $id = intval($_GET['id'] ?? 0);
        $s = $id ? \GDS\Core\SupplierManager::get_supplier($id) : null;
        ?>
        <div class="wrap">
            <h1><?php echo $id ? __('Edit Supplier', 'gds') : __('Add New Supplier', 'gds'); ?></h1>
            <form method="post" action="<?php echo admin_url('admin.php?page=gds-suppliers'); ?>">
                <?php wp_nonce_field('gds_save_supplier'); ?>
                <input type="hidden" name="gds_action" value="save_supplier">
                <input type="hidden" name="id" value="<?php echo $id; ?>">
                <table class="form-table">
                    <tr>
                        <th><?php _e('Name', 'gds'); ?></th>
                        <td><input name="name" type="text" value="<?php echo $s ? esc_attr($s->name) : ''; ?>"
                                class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><?php _e('Type', 'gds'); ?></th>
                        <td><select name="connector_type">
                                <option value="mock" <?php selected($s ? $s->connector_type : '', 'mock'); ?>>Mock</option>
                                <option value="aliexpress" <?php selected($s ? $s->connector_type : '', 'aliexpress'); ?>>
                                    AliExpress API</option>
                                <option value="csv_ftp" <?php selected($s ? $s->connector_type : '', 'csv_ftp'); ?>>FTP CSV
                                </option>
                            </select></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function render_pricing_rules()
    {
        $action = $_GET['action'] ?? 'list';
        if ($action === 'add' || $action === 'edit') {
            $this->render_pricing_rule_form();
            return;
        }

        require_once GDS_PATH . 'includes/Admin/PricingRuleListTable.php';
        $table = new PricingRuleListTable();
        $table->prepare_items();
        echo '<div class="wrap"><h1>' . __('Pricing Rules', 'gds') . ' <a href="' . admin_url('admin.php?page=gds-pricing-rules&action=add') . '" class="page-title-action">Add Rule</a></h1>';
        $table->display();
        echo '</div>';
    }

    private function render_pricing_rule_form()
    {
        $id = intval($_GET['id'] ?? 0);
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        global $wpdb;
        $r = $id ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gds_pricing_rules WHERE id = %d AND tenant_id = %s", $id, $tenant_id)) : null;
        ?>
        <div class="wrap">
            <h1><?php echo $id ? __('Edit Rule', 'gds') : __('Add Rule', 'gds'); ?></h1>
            <form method="post">
                <?php wp_nonce_field('gds_save_pricing_rule'); ?>
                <input type="hidden" name="gds_action" value="save_pricing_rule"><input type="hidden" name="id"
                    value="<?php echo $id; ?>">
                <table class="form-table">
                    <tr>
                        <th><?php _e('Name', 'gds'); ?></th>
                        <td><input name="rule_name" type="text" value="<?php echo $r ? esc_attr($r->rule_name) : ''; ?>"
                                class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><?php _e('Brackets (Min-Max Cost)', 'gds'); ?></th>
                        <td><input name="min_cost" type="number" step="0.01" value="<?php echo $r ? $r->min_cost : 0; ?>"> to
                            <input name="max_cost" type="number" step="0.01" value="<?php echo $r ? $r->max_cost : 99999; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php _e('Markup', 'gds'); ?></th>
                        <td>Value: <input name="markup_value" type="number" step="0.01"
                                value="<?php echo $r ? $r->markup_value : 1.6; ?>"> <select name="markup_type">
                                <option value="multiplier" <?php selected($r ? $r->markup_type : '', 'multiplier'); ?>>
                                    Multiplier (x)</option>
                            </select></td>
                    </tr>
                    <tr>
                        <th><?php _e('Priority', 'gds'); ?></th>
                        <td><input name="priority" type="number" value="<?php echo $r ? $r->priority : 10; ?>"></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function render_imports()
    {
        require_once GDS_PATH . 'includes/Admin/ImportBatchListTable.php';
        $t = new ImportBatchListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>Imports</h1>';
        $t->display();
        echo '</div>';
    }
    public function render_catalog_review()
    {
        require_once GDS_PATH . 'includes/Admin/CatalogReviewListTable.php';
        $t = new CatalogReviewListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>Catalog Review</h1>';
        $t->display();
        echo '</div>';
    }
    public function render_inventory()
    {
        require_once GDS_PATH . 'includes/Admin/InventoryHealthListTable.php';
        $t = new InventoryHealthListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>Inventory <a href="' . admin_url('admin.php?action=export_csv&table=gds_supplier_variants') . '" class="page-title-action">Export CSV</a></h1>';
        $t->display();
        echo '</div>';
    }
    public function render_orders()
    {
        require_once GDS_PATH . 'includes/Admin/POListTable.php';
        $t = new POListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>Purchase Orders <a href="' . admin_url('admin.php?action=export_csv&table=gds_purchase_orders') . '" class="page-title-action">Export CSV</a></h1>';
        $t->display();
        echo '</div>';
    }
    public function render_rma()
    {
        require_once GDS_PATH . 'includes/Admin/RMAListTable.php';
        $t = new RMAListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>RMA Queue</h1>';
        $t->display();
        echo '</div>';
    }
    public function render_logs()
    {
        require_once GDS_PATH . 'includes/Admin/LogListTable.php';
        $t = new LogListTable();
        $t->prepare_items();
        echo '<div class="wrap"><h1>System Logs <a href="' . admin_url('admin.php?action=export_csv&table=gds_audit_log') . '" class="page-title-action">Export CSV</a></h1>';
        $t->display();
        echo '</div>';
    }
    public function render_settings()
    {
        $settings = \GDS\Core\Settings::get();
        $webhook_secret = \GDS\Core\Settings::get('webhook_secret') ?: '';
        ?>
        <div class="wrap">
            <h1><?php _e('Dropnex Woo Settings', 'gds'); ?></h1>
            <?php if (isset($_GET['message']) && $_GET['message'] === 'saved'): ?>
                <div class="updated">
                    <p><?php _e('Settings saved successfully.', 'gds'); ?></p>
                </div>
            <?php endif; ?>

            <form method="post" action="">
                <?php wp_nonce_field('gds_save_settings'); ?>
                <input type="hidden" name="gds_action" value="save_settings">

                <h2 class="title"><?php _e('Pricing & Policy', 'gds'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th><label><?php _e('Default Markup Multiplier', 'gds'); ?></label></th>
                        <td><input name="default_markup_multiplier" type="number" step="0.01"
                                value="<?php echo esc_attr($settings['default_markup_multiplier']); ?>" class="small-text"></td>
                    </tr>
                    <tr>
                        <th><label><?php _e('Round Prices to .99', 'gds'); ?></label></th>
                        <td><input name="price_rounding_strategy" type="checkbox" value=".99" <?php checked($settings['price_rounding_strategy'], '.99'); ?>></td>
                    </tr>
                    <tr>
                        <th><label><?php _e('Price Outlier Threshold (%)', 'gds'); ?></label></th>
                        <td><input name="price_outlier_threshold" type="number"
                                value="<?php echo esc_attr($settings['price_outlier_threshold']); ?>" class="small-text"></td>
                    </tr>
                </table>

                <h2 class="title"><?php _e('Fulfillment', 'gds'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th><label><?php _e('Enable Split Orders', 'gds'); ?></label></th>
                        <td><input name="split_orders_enabled" type="checkbox" value="1" <?php checked($settings['split_orders_enabled'], 1); ?>></td>
                    </tr>
                    <tr>
                        <th><label><?php _e('PO Submission Trigger', 'gds'); ?></label></th>
                        <td>
                            <select name="po_submission_trigger">
                                <option value="processing" <?php selected($settings['po_submission_trigger'], 'processing'); ?>>
                                    Processing (Paid)</option>
                                <option value="completed" <?php selected($settings['po_submission_trigger'], 'completed'); ?>>
                                    Completed</option>
                            </select>
                        </td>
                    </tr>
                </table>

                <h2 class="title"><?php _e('Security & API', 'gds'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th><label><?php _e('Webhook Secret (HMAC-SHA256)', 'gds'); ?></label></th>
                        <td>
                            <input name="webhook_secret" type="text" value="<?php echo esc_attr($webhook_secret); ?>"
                                class="regular-text">
                            <p class="description">
                                <?php _e('Used to verify incoming tracking updates from suppliers.', 'gds'); ?>
                            </p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    // AJAX Handlers
    public function ajax_test_connection()
    {
        check_ajax_referer('gds_admin_nonce', 'nonce');
        wp_send_json_success('Connection successful (Mock).');
    }
    public function ajax_run_import()
    {
        check_ajax_referer('gds_admin_nonce', 'nonce');
        do_action('gds_catalog_import_trigger', null, intval($_POST['id']));
        wp_send_json_success('Import started.');
    }
    public function ajax_publish_products()
    {
        check_ajax_referer('gds_admin_nonce', 'nonce');
        $res = \GDS\Core\AgentRegistry::instance()->get('product')->publish_all_from_supplier(intval($_POST['id']));
        wp_send_json_success("Published: {$res['success']}");
    }

    public function ajax_switch_context()
    {
        check_ajax_referer('gds_admin_nonce', 'nonce');
        $store_id = sanitize_text_field($_POST['store_id']);
        // Store in session or transient for the user's session
        set_transient('gds_user_store_context_' . get_current_user_id(), $store_id, HOUR_IN_SECONDS);
        wp_send_json_success();
    }

    // --- Placeholder Renderers for New Interfaces ---
    public function render_platform_tenants()
    {
        echo '<div class="wrap"><h1>Platform: Tenants</h1></div>';
    }
    public function render_platform_plans()
    {
        echo '<div class="wrap"><h1>Platform: Plans & Billing</h1></div>';
    }
    public function render_platform_marketplace()
    {
        echo '<div class="wrap"><h1>Platform: Marketplace Review</h1></div>';
    }
    public function render_platform_ops()
    {
        echo '<div class="wrap"><h1>Platform: Fleet Operations</h1></div>';
    }
    public function render_platform_security()
    {
        echo '<div class="wrap"><h1>Platform: Security</h1></div>';
    }
    public function render_dev_portal()
    {
        echo '<div class="wrap"><h1>Developer Portal</h1></div>';
    }
    public function render_dev_apps()
    {
        echo '<div class="wrap"><h1>Developer Portal: My Apps</h1></div>';
    }
    public function render_dev_sandboxes()
    {
        echo '<div class="wrap"><h1>Developer Portal: Sandboxes</h1></div>';
    }
    public function render_billing()
    {
        echo '<div class="wrap"><h1>Store: Billing & Usage</h1></div>';
    }
    public function render_apps()
    {
        echo '<div class="wrap"><h1>Store: Apps & Integrations</h1></div>';
    }

    /**
     * Restrict Core WordPress menus for Tenants.
     */
    public function restrict_tenant_menus()
    {
        // If the user can manage the platform, don't restrict anything (Operator Mode)
        if (current_user_can('gds_platform_access')) {
            return;
        }

        // Otherwise, hide dangerous/unnecessary core menus
        remove_menu_page('plugins.php');
        remove_menu_page('tools.php');
        remove_menu_page('options-general.php');
        remove_menu_page('themes.php');
        remove_menu_page('edit-comments.php');

        // Hide ACF or other specific plugin menus if they exist
        remove_menu_page('edit.php?post_type=acf-field-group');

        // Remove the 'Updates' submenu from Dashboard
        remove_submenu_page('index.php', 'update-core.php');
    }
}
