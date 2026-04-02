<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcodes Class.
 */
class Shortcodes
{
    /**
     * Initialize shortcodes.
     */
    public static function init()
    {
        add_shortcode('gds_tracking_page', array(__CLASS__, 'render_tracking_page'));
        add_shortcode('gds_rma_request', array(__CLASS__, 'render_rma_request'));
        add_shortcode('gds_signup_form', array(__CLASS__, 'render_signup_form'));

        add_action('template_redirect', array(__CLASS__, 'handle_rma_submission'));
        add_action('template_redirect', array(__CLASS__, 'handle_signup_submission'));
    }

    /**
     * Handle RMA form submission.
     */
    public static function handle_rma_submission()
    {
        if (!isset($_POST['gds_submit_rma'])) {
            return;
        }

        check_admin_referer('gds_submit_rma');

        if (!is_user_logged_in()) {
            return;
        }

        $order_id = intval($_POST['order_id']);
        $reason = sanitize_textarea_field($_POST['reason']);
        $user_id = get_current_user_id();

        // Verification: Ensure the order belongs to the person submitting the RMA
        $order = wc_get_order($order_id);
        if (!$order || (int) $order->get_customer_id() !== $user_id) {
            wp_die(__('Security Error: You are not authorized to request an RMA for this order.', 'gds'));
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gds_rma_requests';

        // Get associated PO (simplification: pick first PO for order)
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $po_id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gds_purchase_orders WHERE order_id = %d AND tenant_id = %s LIMIT 1",
            $order_id,
            $tenant_id
        ));

        $wpdb->insert($table, array(
            'tenant_id' => $tenant_id,
            'order_id' => $order_id,
            'po_id' => $po_id,
            'status' => 'pending',
            'reason' => $reason,
            'created_at' => current_time('mysql'),
        ));

        wp_redirect(add_query_arg('rma_success', '1'));
        exit;
    }

    /**
     * Render the order tracking page.
     */
    public static function render_tracking_page($atts)
    {
        $order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;
        $email = isset($_GET['email']) ? sanitize_email($_GET['email']) : '';
        $token = isset($_GET['token']) ? sanitize_text_field($_GET['token']) : '';

        // Retrieve policy from settings
        $mode = \GDS\Core\Settings::get('guest_tracking_mode');

        ob_start();
        ?>
        <div class="gds-tracking-wrap">
            <?php if (!$order_id || (!$email && !$token)): ?>
                <form method="get" class="gds-tracking-form">
                    <p>
                        <label>
                            <?php _e('Order ID', 'gds'); ?>
                        </label>
                        <input type="text" name="order_id" required />
                    </p>
                    <p>
                        <label>
                            <?php _e('Billing Email', 'gds'); ?>
                        </label>
                        <input type="email" name="email" required />
                    </p>
                    <button type="submit" class="button">
                        <?php _e('Track Order', 'gds'); ?>
                    </button>
                    <?php if ($mode === 'secure_token_link'): ?>
                        <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 1rem;">
                            <?php _e('Note: Secure token mode is active. Please use the link provided in your shipment email for direct access.', 'gds'); ?>
                        </p>
                    <?php endif; ?>
                </form>
            <?php else: ?>
                <?php
                $order = wc_get_order($order_id);
                $authorized = false;

                if ($order) {
                    if ($mode === 'secure_token_link') {
                        $stored_token = $order->get_meta('_gds_tracking_token');
                        $expiry = $order->get_meta('_gds_tracking_token_expiry');

                        // Lazy generation for secure token mode
                        if (!$stored_token) {
                            $stored_token = wp_generate_password(32, false);
                            $order->update_meta_data('_gds_tracking_token', $stored_token);
                            $order->update_meta_data('_gds_tracking_token_expiry', time() + (7 * DAY_IN_SECONDS));
                            $order->save();
                            $expiry = time() + (7 * DAY_IN_SECONDS);
                        }

                        if ($token && hash_equals($stored_token, $token)) {
                            if (!$expiry || time() < (int) $expiry) {
                                $authorized = true;
                            } else {
                                echo '<p class="woocommerce-error">' . __('Tracking link has expired.', 'gds') . '</p>';
                                $expiry_shown = true;
                            }
                        }
                    } else {
                        if ($email && strtolower($order->get_billing_email()) === strtolower($email)) {
                            $authorized = true;
                        }
                    }
                }

                if (!$authorized && !isset($expiry_shown)) {
                    echo '<p class="woocommerce-error">' . __('Invalid tracking credentials or unauthorized access.', 'gds') . '</p>';
                } elseif ($authorized) {
                    self::display_tracking_results($order);
                }
                ?>
                <p><a href="<?php echo esc_url(remove_query_arg(array('order_id', 'email', 'token'))); ?>">&larr;
                        <?php _e('Back', 'gds'); ?>
                    </a></p>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Display tracking results for an order.
     */
    private static function display_tracking_results($order)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_purchase_orders';
        $pos = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE order_id = %d AND tenant_id = %s", $order->get_id(), $tenant_id));

        echo '<h3>' . sprintf(__('Order #%s Status', 'gds'), $order->get_order_number()) . '</h3>';

        if (empty($pos)) {
            echo '<p>' . __('Your order is being processed.', 'gds') . '</p>';
            return;
        }

        foreach ($pos as $po) {
            echo '<div class="gds-shipment-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px;">';
            echo '<p><strong>' . __('Status:', 'gds') . '</strong> ' . esc_html($po->status) . '</p>';
            if ($po->tracking_number) {
                echo '<p><strong>' . __('Carrier:', 'gds') . '</strong> ' . esc_html($po->carrier) . '</p>';
                echo '<p><strong>' . __('Tracking Number:', 'gds') . '</strong> ' . esc_html($po->tracking_number) . '</p>';
                // Logic for tracking URL could be added here
            } else {
                echo '<p>' . __('Packaging and shipment in progress.', 'gds') . '</p>';
            }
            echo '</div>';
        }
    }

    /**
     * Render the RMA request form.
     */
    public static function render_rma_request($atts)
    {
        if (!is_user_logged_in()) {
            return '<p>' . __('Please log in to request a return.', 'gds') . '</p>';
        }

        ob_start();
        // Simplified RMA form logic
        ?>
        <div class="gds-rma-wrap">
            <h3>
                <?php _e('Request a Return', 'gds'); ?>
            </h3>
            <form method="post" action="">
                <?php wp_nonce_field('gds_submit_rma'); ?>
                <p>
                    <label>
                        <?php _e('Select Order', 'gds'); ?>
                    </label>
                    <select name="order_id" required>
                        <option value="">
                            <?php _e('Choose an order...', 'gds'); ?>
                        </option>
                        <?php
                        $customer_orders = wc_get_orders(array(
                            'customer' => get_current_user_id(),
                            'status' => array('wc-completed', 'wc-processing'),
                        ));
                        foreach ($customer_orders as $order) {
                            echo '<option value="' . $order->get_id() . '">#' . $order->get_order_number() . '</option>';
                        }
                        ?>
                    </select>
                </p>
                <p>
                    <label>
                        <?php _e('Reason for Return', 'gds'); ?>
                    </label>
                    <textarea name="reason" required></textarea>
                </p>
                <button type="submit" name="gds_submit_rma" class="button">
                    <?php _e('Submit Request', 'gds'); ?>
                </button>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render the SaaS signup form.
     */
    public static function render_signup_form($atts)
    {
        ob_start();
        $error = isset($_GET['gds_error']) ? sanitize_text_field($_GET['gds_error']) : '';
        $success = isset($_GET['gds_success']) ? 1 : 0;
        ?>
        <div class="gds-onboarding-wrap glass p-10 rounded-3xl"
            style="max-width: 600px; margin: 0 auto; border: 1px solid var(--surface-border);">
            <h2 class="gradient-text font-black italic mb-8" style="font-size: 2.5rem;"><?php _e('Build Your Empire', 'gds'); ?>
            </h2>
            <p class="text-white-50 mb-10"><?php _e('Provision your autonomous storefront ecosystem in seconds.', 'gds'); ?></p>

            <?php if ($error): ?>
                <div class="gds-error-msg"
                    style="color: #ff4b2b; background: rgba(255,75,43,0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; font-weight: 600;">
                    <?php echo esc_html($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="gds-success-msg"
                    style="color: #00f2ff; background: rgba(0,242,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <h4 class="font-bold mb-2"><?php _e('Nexus Initialized!', 'gds'); ?></h4>
                    <p><?php _e('Your storefront is being provisioned. You can now access your manager console.', 'gds'); ?></p>
                    <a href="<?php echo admin_url('admin.php?page=gds-dashboard&gds_mode=tenant'); ?>" class="btn-primary mt-6"
                        style="display:inline-block;"><?php _e('Access Control Center', 'gds'); ?></a>
                </div>
            <?php else: ?>
                <form method="post" class="gds-signup-form">
                    <?php wp_nonce_field('gds_self_signup'); ?>
                    <div class="mb-6">
                        <label class="text-white-50 block mb-2 font-bold uppercase tracking-widest"
                            style="font-size: 0.7rem;"><?php _e('Store Identity (Slug)', 'gds'); ?></label>
                        <input type="text" name="tenant_id" placeholder="e.g. cyber-dynamics" required
                            style="width:100%; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); padding: 15px; border-radius: 12px; color: #fff;">
                    </div>
                    <div class="mb-6">
                        <label class="text-white-50 block mb-2 font-bold uppercase tracking-widest"
                            style="font-size: 0.7rem;"><?php _e('Access Domain', 'gds'); ?></label>
                        <input type="text" name="domain" placeholder="e.g. store.dropnex.cloud" required
                            style="width:100%; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); padding: 15px; border-radius: 12px; color: #fff;">
                    </div>
                    <div class="mb-8">
                        <label class="text-white-50 block mb-2 font-bold uppercase tracking-widest"
                            style="font-size: 0.7rem;"><?php _e('Ecosystem Tier', 'gds'); ?></label>
                        <select name="plan_name"
                            style="width:100%; background: #08080a; border: 1px solid var(--surface-border); padding: 15px; border-radius: 12px; color: #fff;">
                            <option value="Basic"><?php _e('Basic Tier (Free - 1 Supplier)', 'gds'); ?></option>
                            <option value="Growth" selected><?php _e('Growth Tier (5 Suppliers)', 'gds'); ?></option>
                            <option value="Pro"><?php _e('Pro Tier (Unlimited Agents)', 'gds'); ?></option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <label class="text-white-50 block mb-2 font-bold uppercase tracking-widest"
                            style="font-size: 0.7rem;"><?php _e('Admin Email', 'gds'); ?></label>
                        <input type="email" name="user_email" placeholder="e.g. boss@cyber-dynamics.com" required
                            style="width:100%; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); padding: 15px; border-radius: 12px; color: #fff;">
                    </div>
                    <div class="mb-8">
                        <label class="text-white-50 block mb-2 font-bold uppercase tracking-widest"
                            style="font-size: 0.7rem;"><?php _e('Secure Password', 'gds'); ?></label>
                        <input type="password" name="user_pass" placeholder="••••••••" required
                            style="width:100%; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); padding: 15px; border-radius: 12px; color: #fff;">
                    </div>
                    <button type="submit" name="gds_do_onboarding" class="btn-primary w-full"
                        style="padding: 18px; font-size: 1rem;"><?php _e('Initialize Storefront', 'gds'); ?></button>
                </form>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Handle signup submission.
     */
    public static function handle_signup_submission()
    {
        if (!isset($_POST['gds_do_onboarding'])) {
            return;
        }

        check_admin_referer('gds_self_signup');

        $tenant_id = sanitize_key($_POST['tenant_id']);
        $domain = sanitize_text_field($_POST['domain']);
        $plan = sanitize_text_field($_POST['plan_name']);
        $email = sanitize_email($_POST['user_email']);
        $pass = $_POST['user_pass'];

        if (username_exists($tenant_id) || email_exists($email)) {
            wp_redirect(add_query_arg('gds_error', urlencode(__('Username or Email already exists.', 'gds'))));
            exit;
        }

        $res = \GDS\Core\OnboardingManager::instance()->provision_tenant($tenant_id, $domain, $plan);

        if (is_wp_error($res)) {
            wp_redirect(add_query_arg('gds_error', urlencode($res->get_error_message())));
            exit;
        }

        // Create User
        $user_id = wp_create_user($tenant_id, $pass, $email);
        if (is_wp_error($user_id)) {
            wp_redirect(add_query_arg('gds_error', urlencode($user_id->get_error_message())));
            exit;
        }

        $user = new \WP_User($user_id);
        $user->set_role('tenant_owner');
        update_user_meta($user_id, 'gds_tenant_id', $tenant_id);

        // Auto-login
        wp_set_current_user($user_id);
        wp_set_auth_cookie($user_id, true);

        wp_redirect(add_query_arg('gds_success', '1'));
        exit;
    }
}
