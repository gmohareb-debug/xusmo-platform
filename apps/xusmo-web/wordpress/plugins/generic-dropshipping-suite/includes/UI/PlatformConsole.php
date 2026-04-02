<?php
namespace GDS\UI;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Platform Console Class.
 * 
 * Handles the Platform Admin (SaaS fleet management) interface.
 */
class PlatformConsole
{
    /**
     * Render the Platform Admin Dashboard.
     */
    public function render()
    {
        if (!current_user_can('gds_platform_access')) {
            wp_die('Access Denied: Platform Console requires SaaS Operator privileges.');
        }

        global $wpdb;
        $tenants_table = $wpdb->prefix . 'gds_tenants';

        // 1. Handle Actions
        if (isset($_POST['gds_platform_action']) && $_POST['gds_platform_action'] === 'add_tenant') {
            check_admin_referer('gds_add_tenant');
            $wpdb->insert($tenants_table, array(
                'tenant_id' => sanitize_key($_POST['tenant_id']),
                'domain' => sanitize_text_field($_POST['domain']),
                'plan_name' => sanitize_text_field($_POST['plan_name']),
                'status' => 'active'
            ));
            echo '<div class="updated"><p>Tenant provisioned successfully.</p></div>';
        }

        if (isset($_GET['action']) && $_GET['action'] === 'delete_tenant') {
            check_admin_referer('delete_tenant_' . $_GET['id']);
            $wpdb->delete($tenants_table, array('id' => intval($_GET['id'])));
            echo '<div class="updated"><p>Tenant removed from fleet.</p></div>';
        }

        // 2. Fetch Data
        $tenants = $wpdb->get_results("SELECT * FROM $tenants_table ORDER BY created_at DESC");
        $active_count = count(array_filter($tenants, function ($t) {
            return $t->status === 'active'; }));

        ?>
        <div class="wrap gds-saas-wrap">
            <h1 class="wp-heading-inline">GDS Control Plane <span class="badge">SaaS v2.0</span></h1>
            <a href="#add_tenant" class="page-title-action" onclick="jQuery('#gds-add-tenant-modal').show();">Provision New
                Storefront</a>

            <div id="gds-add-tenant-modal"
                style="display:none; position:fixed; z-index:9999; top:10%; left:25%; width:50%; background:#fff; padding:30px; border:1px solid #ccc; box-shadow: 0 10px 50px rgba(0,0,0,0.2);">
                <h2>Provision New Tenant</h2>
                <form method="post">
                    <?php wp_nonce_field('gds_add_tenant'); ?>
                    <input type="hidden" name="gds_platform_action" value="add_tenant">
                    <table class="form-table">
                        <tr>
                            <th>Tenant ID (Slug)</th>
                            <td><input name="tenant_id" type="text" placeholder="e.g. store-alpha" class="regular-text"
                                    required></td>
                        </tr>
                        <tr>
                            <th>Domain / Hostname</th>
                            <td><input name="domain" type="text" placeholder="e.g. store-alpha.dropnex.com" class="regular-text"
                                    required></td>
                        </tr>
                        <tr>
                            <th>Plan</th>
                            <td>
                                <select name="plan_name">
                                    <option value="Basic">Basic</option>
                                    <option value="Growth">Growth</option>
                                    <option value="Pro">Pro (Staging Included)</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </td>
                        </tr>
                    </table>
                    <button type="submit" class="button button-primary">Provision Now</button>
                    <button type="button" class="button" onclick="jQuery('#gds-add-tenant-modal').hide();">Cancel</button>
                </form>
            </div>

            <div class="gds-saas-grid"
                style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top:20px;">

                <!-- Fleet Overview -->
                <div class="card"
                    style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding:20px; border-radius:12px; border: 1px solid rgba(0,0,0,0.1);">
                    <h2>Fleet Status</h2>
                    <ul class="fleet-stats">
                        <li><strong>Active Tenants:</strong> <?php echo $active_count; ?></li>
                        <li><strong>Total Managed Nodes:</strong> <?php echo count($tenants); ?></li>
                        <li><strong>System Health:</strong> <span class="status-ok"
                                style="color:#46b450; font-weight:700;">Optimal</span></li>
                    </ul>
                </div>

                <!-- Global Billing/Plans -->
                <div class="card"
                    style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding:20px; border-radius:12px; border: 1px solid rgba(0,0,0,0.1);">
                    <h2>Subscription Engine</h2>
                    <p>Metered billing and dunning policies.</p>
                    <button class="button button-secondary" disabled>Edit Global Limits</button>
                </div>

                <!-- Studio Assets -->
                <div class="card"
                    style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding:20px; border-radius:12px; border: 1px solid rgba(0,0,0,0.1);">
                    <h2>Fleet Templates</h2>
                    <p>Manage blueprints and industry-specific presets.</p>
                    <button class="button button-secondary" disabled>Manage Kits</button>
                </div>

            </div>

            <div class="gds-tenant-list" style="margin-top:40px;">
                <h2>Active Storefronts</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Tenant ID</th>
                            <th>Target Domain</th>
                            <th>Active Plan</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($tenants)): ?>
                            <tr>
                                <td colspan="6">No tenants provisioned yet.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($tenants as $t): ?>
                                <tr>
                                    <td><strong><?php echo esc_html($t->tenant_id); ?></strong></td>
                                    <td><code><?php echo esc_html($t->domain); ?></code></td>
                                    <td><?php echo esc_html($t->plan_name); ?></td>
                                    <td><span class="status-pill active"
                                            style="background:#dff0d8; color:#3c763d; padding:4px 10px; border-radius:99px; font-size:10px; font-weight:700;"><?php echo esc_html($t->status); ?></span>
                                    </td>
                                    <td><?php echo esc_html($t->created_at); ?></td>
                                    <td>
                                        <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=gds-platform&action=delete_tenant&id=' . $t->id), 'delete_tenant_' . $t->id); ?>"
                                            class="button button-small delete"
                                            onclick="return confirm('Suspend and delete this tenant?')">Suspend</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <style>
                .badge {
                    background: #0073aa;
                    color: #fff;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    vertical-align: middle;
                }

                .status-pill {
                    padding: 4px 10px;
                    border-radius: 99px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .status-pill.active {
                    background: #dff0d8;
                    color: #3c763d;
                    border: 1px solid #d6e9c6;
                }

                .status-ok {
                    color: #46b450;
                    font-weight: 600;
                }

                .gds-saas-wrap h2 {
                    margin-top: 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
            </style>
        </div>
        <?php
    }
}
