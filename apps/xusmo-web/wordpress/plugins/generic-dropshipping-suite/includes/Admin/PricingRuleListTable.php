<?php
namespace GDS\Admin;

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Pricing Rule List Table Class.
 */
class PricingRuleListTable extends \WP_List_Table
{
    public function __construct()
    {
        parent::__construct(array(
            'singular' => 'Pricing Rule',
            'plural' => 'Pricing Rules',
            'ajax' => false,
        ));
    }

    public function get_columns()
    {
        return array(
            'rule_name' => 'Rule Name',
            'cost_range' => 'Cost Range',
            'markup' => 'Markup',
            'priority' => 'Priority',
            'status' => 'Status',
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'rule_name':
                return '<strong>' . esc_html($item->rule_name) . '</strong>';
            case 'cost_range':
                return sprintf('%s - %s', wc_price($item->min_cost), wc_price($item->max_cost));
            case 'markup':
                return $item->markup_type === 'multiplier' ? sprintf('x %s', $item->markup_value) : sprintf('+ %s', wc_price($item->markup_value));
            case 'priority':
                return intval($item->priority);
            case 'status':
                return $item->is_active ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>';
            default:
                return '-';
        }
    }

    public function prepare_items()
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_pricing_rules';

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = array();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $this->items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %s ORDER BY priority DESC",
            $tenant_id
        ));
    }
}
