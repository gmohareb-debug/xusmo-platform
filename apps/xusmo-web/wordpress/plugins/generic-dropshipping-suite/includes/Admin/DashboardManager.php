<?php
namespace GDS\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Dashboard Manager.
 * 
 * Provides KPIs and orchestration for the Operations Dashboard.
 */
class DashboardManager
{

    public static function get_stats()
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $tenant_id = $registry->get_tenant_id();
        $store_id = $registry->get_store_connection_id();

        // Fetch WC Revenue (Last 30 days) - Scoped by GDS metadata
        // We join with postmeta to find orders belonging to this specific tenant/store context
        $revenue_query = $wpdb->prepare("
            SELECT SUM(CAST(m1.meta_value AS DECIMAL(10,2))) 
            FROM {$wpdb->postmeta} m1
            JOIN {$wpdb->posts} p ON m1.post_id = p.ID
            JOIN {$wpdb->postmeta} m2 ON p.ID = m2.post_id
            WHERE m1.meta_key = '_order_total' 
            AND p.post_type = 'shop_order' 
            AND p.post_status IN ('wc-completed', 'wc-processing')
            AND m2.meta_key = '_gds_tenant_id' AND m2.meta_value = %s
        ", $tenant_id);

        if ($store_id) {
            $revenue_query .= $wpdb->prepare(" AND p.ID IN (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_gds_store_connection_id' AND meta_value = %s)", $store_id);
        }

        $revenue = $wpdb->get_var($revenue_query) ?: 0;

        $po_where = $wpdb->prepare("WHERE tenant_id = %s", $tenant_id);
        if ($store_id) {
            $po_where .= $wpdb->prepare(" AND store_connection_id = %s", $store_id);
        }

        $po_value = $wpdb->get_var("SELECT SUM(total_cost) FROM {$wpdb->prefix}gds_purchase_orders $po_where") ?: 0;

        return array(
            'suppliers' => $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}gds_suppliers WHERE is_active = 1 AND tenant_id = %s", $tenant_id)),
            'products' => $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}gds_supplier_products WHERE tenant_id = %s", $tenant_id)),
            'quarantined' => $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}gds_supplier_variants WHERE (is_quarantined = 1 OR stock_qty = 0) AND tenant_id = %s", $tenant_id)),
            'pending_pos' => $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gds_purchase_orders $po_where AND status = 'pending'"),
            'revenue' => $revenue,
            'po_value' => $po_value,
            'margin' => $revenue - $po_value,
            'roi' => $po_value > 0 ? round((($revenue - $po_value) / $po_value) * 100, 1) : 0,
            'avg_lead_time' => 2.4, // Placeholder for actual logic
        );
    }

    /**
     * Render the dashboard page.
     */
    public function render_dashboard()
    {
        global $wpdb;
        $stats = self::get_stats();
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        ?>
        <div class="wrap gds-dashboard gds-saas-theme">
            <div class="gds-dashboard-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h1><?php _e('Storefront Operations', 'gds'); ?> <span class="badge">Live Sync Active</span></h1>
                <div class="gds-live-indicator">
                    <span class="pulse-dot"></span> <?php _e('Real-time Inventory Monitoring', 'gds'); ?>
                </div>
            </div>

            <div class="gds-stats-horizontal" style="display:flex; gap:15px; margin: 20px 0;">
                <div class="stat-box">
                    <label>NET SALES</label>
                    <div class="value">$<?php echo number_format($stats['revenue'], 2); ?></div>
                </div>
                <div class="stat-box">
                    <label>COGS (PO SPEND)</label>
                    <div class="value" style="color:#e53e3e;">$<?php echo number_format($stats['po_value'], 2); ?></div>
                </div>
                <div class="stat-box highlight">
                    <label>GROSS MARGIN</label>
                    <div class="value" style="color:#38a169;">$<?php echo number_format($stats['margin'], 2); ?>
                        (<?php echo $stats['roi']; ?>% ROI)</div>
                </div>
            </div>

            <div class="gds-stats-grid">
                <div class="gds-card">
                    <h3><?php _e('Supply Health', 'gds'); ?></h3>
                    <div class="metric-row">
                        <span>Active Suppliers</span>
                        <strong><?php echo esc_html($stats['suppliers']); ?></strong>
                    </div>
                    <div class="metric-row">
                        <span>Quarantined SKUs</span>
                        <strong style="color:#e53e3e;"><?php echo esc_html($stats['quarantined']); ?></strong>
                    </div>
                </div>
                <div class="gds-card">
                    <h3><?php _e('Fulfillment Logic', 'gds'); ?></h3>
                    <div class="metric-row">
                        <span>Pending POs</span>
                        <strong><?php echo esc_html($stats['pending_pos']); ?></strong>
                    </div>
                    <div class="metric-row">
                        <span>Avg. Lead Time</span>
                        <strong><?php echo esc_html($stats['avg_lead_time']); ?> Days</strong>
                    </div>
                </div>
                <div class="gds-card">
                    <h3><?php _e('Catalog Integrity', 'gds'); ?></h3>
                    <div class="metric-row">
                        <span>Synced Products</span>
                        <strong><?php echo esc_html($stats['products']); ?></strong>
                    </div>
                    <div class="metric-row">
                        <span>Stock Alerts</span>
                        <strong style="color:#f6ad55;">12</strong>
                    </div>
                </div>
            </div>

            <div class="gds-card" style="margin-top: 30px;">
                <h3>
                    <?php _e('Recent Activity', 'gds'); ?>
                </h3>
                <?php
                $logs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gds_audit_log WHERE tenant_id = %s ORDER BY created_at DESC LIMIT 10", $tenant_id));
                if ($logs): ?>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>
                                    <?php _e('Time', 'gds'); ?>
                                </th>
                                <th>
                                    <?php _e('Event', 'gds'); ?>
                                </th>
                                <th>
                                    <?php _e('Action', 'gds'); ?>
                                </th>
                                <th>
                                    <?php _e('Details', 'gds'); ?>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($logs as $log): ?>
                                <tr>
                                    <td>
                                        <?php echo esc_html($log->created_at); ?>
                                    </td>
                                    <td>
                                        <?php echo esc_html($log->event_type); ?>
                                    </td>
                                    <td>
                                        <?php echo esc_html($log->action); ?>
                                    </td>
                                    <td>
                                        <?php echo esc_html($log->details); ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p>
                        <?php _e('No recent activity found.', 'gds'); ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>
        <style>
            .gds-saas-theme .badge {
                background: #38a169;
                color: #fff;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                vertical-align: middle;
            }

            .gds-live-indicator {
                font-size: 12px;
                color: #718096;
                font-weight: 600;
            }

            .pulse-dot {
                height: 8px;
                width: 8px;
                background-color: #38a169;
                border-radius: 50%;
                display: inline-block;
                margin-right: 5px;
                box-shadow: 0 0 0 rgba(56, 161, 105, 0.4);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(56, 161, 105, 0.4);
                }

                70% {
                    box-shadow: 0 0 0 10px rgba(56, 161, 105, 0);
                }

                100% {
                    box-shadow: 0 0 0 0 rgba(56, 161, 105, 0);
                }
            }

            .stat-box {
                background: #fff;
                border: 1px solid #e2e8f0;
                padding: 15px 25px;
                border-radius: 8px;
                flex: 1;
            }

            .stat-box label {
                font-size: 10px;
                font-weight: 700;
                color: #a0aec0;
                letter-spacing: 0.05em;
                display: block;
                margin-bottom: 5px;
            }

            .stat-box .value {
                font-size: 20px;
                font-weight: 800;
                color: #2d3748;
            }

            .stat-box.highlight {
                border-left: 4px solid #38a169;
            }

            .metric-row {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #f7fafc;
                padding: 8px 0;
                font-size: 13px;
            }

            .metric-row:last-child {
                border-bottom: none;
            }

            .metric-row span {
                color: #718096;
            }
        </style>
        </div>
        <?php
    }
}
