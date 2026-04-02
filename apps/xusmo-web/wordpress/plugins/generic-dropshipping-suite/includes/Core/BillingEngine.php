<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Billing Engine Class.
 * 
 * Orchestrates subscription lifecycles, metered usage, and plan-based entitlements.
 */
class BillingEngine
{
    /**
     * Main instance of BillingEngine.
     *
     * @var BillingEngine
     */
    protected static $_instance = null;

    /**
     * Main BillingEngine Instance.
     *
     * @return BillingEngine
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Check if a tenant can perform an action based on their metered usage.
     * 
     * @param string $metric The metric to check (e.g., 'orders', 'publishes').
     * @param int $increment The amount to increment by.
     * @return bool True if permitted, false if limit reached.
     */
    public function can_perform($metric, $increment = 1)
    {
        $registry = TenantRegistry::instance();
        $limit = $registry->get_config("{$metric}_monthly_limit");

        // Return true if limit is 0 (unlimited) or -1 (disabled).
        if ($limit <= 0)
            return ($limit === 0);

        $usage = $this->get_usage($metric);

        return ($usage + $increment) <= $limit;
    }

    /**
     * Increment usage for a specific metric.
     */
    public function record_usage($metric, $count = 1)
    {
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $month = date('Y-m');
        $key = "gds_usage_{$tenant_id}_{$metric}_{$month}";

        $current = intval(get_option($key, 0));
        update_option($key, $current + $count);
    }

    /**
     * Get current usage for the current month.
     */
    public function get_usage($metric)
    {
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $month = date('Y-m');
        $key = "gds_usage_{$tenant_id}_{$metric}_{$month}";

        return intval(get_option($key, 0));
    }

    /**
     * Update an entitlement (e.g. from a Stripe webhook)
     */
    public function update_entitlement($tenant_id, $plan_id, $status = 'active')
    {
        // On platform store (9999), we update the central records.
        // For local mock:
        update_option("gds_tenant_plan_{$tenant_id}", $plan_id);
        update_option("gds_tenant_status_{$tenant_id}", $status);

        $this->log_audit_event('entitlement_updated', array('plan' => $plan_id, 'status' => $status), 'billing', $tenant_id);
    }

    /**
     * Get current subscription status
     */
    public function get_subscription_status($tenant_id)
    {
        $plan = get_option("gds_tenant_plan_{$tenant_id}", 'free');
        $status = get_option("gds_tenant_status_{$tenant_id}", 'trial');

        return array('plan' => $plan, 'status' => $status);
    }

    private function log_audit_event($action, $details, $component, $object_id = 0)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_audit_log';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table'") === $table) {
            $wpdb->insert($table, array(
                'tenant_id' => TenantRegistry::instance()->get_tenant_id(),
                'action_type' => $action,
                'component' => $component,
                'object_id' => (string) $object_id,
                'source_ip' => $_SERVER['REMOTE_ADDR'] ?? 'system',
                'details' => maybe_serialize($details),
                'created_at' => current_time('mysql')
            ));
        }
    }
}
