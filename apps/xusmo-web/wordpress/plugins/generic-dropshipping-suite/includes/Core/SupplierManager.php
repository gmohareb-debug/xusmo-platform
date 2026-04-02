<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

use GDS\Models\Supplier;

/**
 * Supplier Manager Class.
 */
class SupplierManager
{

    /**
     * Get a supplier by ID.
     *
     * @param int $id Supplier ID.
     * @return Supplier|null
     */
    public static function get_supplier($id)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d AND tenant_id = %s",
            $id,
            $tenant_id
        ), ARRAY_A);

        return $row ? new Supplier($row) : null;
    }

    /**
     * Get a supplier by slug.
     *
     * @param string $slug Supplier slug.
     * @return Supplier|null
     */
    public static function get_supplier_by_slug($slug)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE slug = %s AND tenant_id = %s",
            $slug,
            $tenant_id
        ), ARRAY_A);

        return $row ? new Supplier($row) : null;
    }

    /**
     * Get all active suppliers for the current tenant.
     *
     * @return Supplier[]
     */
    public static function get_active_suppliers()
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE is_active = 1 AND tenant_id = %s",
            $tenant_id
        ), ARRAY_A);

        return array_map(function ($row) {
            return new Supplier($row);
        }, $rows);
    }

    /**
     * Get all suppliers for the current tenant.
     *
     * @return Supplier[]
     */
    public static function get_all_suppliers()
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %s ORDER BY name ASC",
            $tenant_id
        ), ARRAY_A);

        return array_map(function ($row) {
            return new Supplier($row);
        }, $rows);
    }

    /**
     * Create a new supplier for the current tenant.
     *
     * @param array $data Supplier data.
     * @return int|false
     */
    public static function create_supplier($data)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';

        $slug = sanitize_title($data['name']);
        error_log("[GDS Debug] create_supplier: tenant=$tenant_id, slug=$slug");

        // Check for existing supplier with the same slug for this tenant
        $existing_id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE tenant_id = %s AND slug = %s LIMIT 1",
            $tenant_id,
            $slug
        ));
        error_log("[GDS Debug] existing_id result: " . var_export($existing_id, true));

        if ($existing_id) {
            return (int) $existing_id;
        }

        $result = $wpdb->insert($table, array(
            'tenant_id' => $tenant_id,
            'name' => sanitize_text_field($data['name']),
            'slug' => $slug,
            'connector_type' => sanitize_key($data['connector_type']),
            'config' => maybe_serialize($data['config']),
            'is_active' => isset($data['is_active']) ? intval($data['is_active']) : 1,
        ));

        error_log("[GDS Debug] insert result: " . var_export($result, true) . ", insert_id: " . $wpdb->insert_id);
        if (!$result && $wpdb->last_error) {
            error_log("[GDS Debug] insert error: " . $wpdb->last_error);
        }

        return $result ? $wpdb->insert_id : false;
    }

    /**
     * Update an existing supplier.
     *
     * @param int   $id   Supplier ID.
     * @param array $data Supplier data.
     * @return bool
     */
    public static function update_supplier($id, $data)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';

        $update_data = array(
            'name' => sanitize_text_field($data['name']),
            'slug' => sanitize_title($data['name']),
            'connector_type' => sanitize_key($data['connector_type']),
            'config' => maybe_serialize($data['config']),
            'is_active' => isset($data['is_active']) ? intval($data['is_active']) : 1,
        );

        $result = $wpdb->update(
            $table,
            $update_data,
            array('id' => intval($id), 'tenant_id' => $tenant_id),
            null,
            array('%d', '%s')
        );

        return $result !== false;
    }

    /**
     * Delete a supplier.
     *
     * @param int $id Supplier ID.
     * @return bool
     */
    public static function delete_supplier($id)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_suppliers';
        return (bool) $wpdb->delete($table, array('id' => intval($id), 'tenant_id' => $tenant_id), array('%d', '%s'));
    }
}
