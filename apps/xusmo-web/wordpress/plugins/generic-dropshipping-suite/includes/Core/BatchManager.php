<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Batch Manager.
 * 
 * Manages import batch records in the database.
 */
class BatchManager
{

    /**
     * Create a new import batch.
     *
     * @param int $supplier_id Supplier ID.
     * @return int|false Batch ID.
     */
    public static function create_batch($supplier_id)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_import_batches';

        $result = $wpdb->insert($table, array(
            'tenant_id' => $tenant_id,
            'supplier_id' => $supplier_id,
            'status' => 'running',
            'started_at' => current_time('mysql'),
        ));

        return $result ? $wpdb->insert_id : false;
    }

    /**
     * Update batch progress.
     *
     * @param int   $batch_id  Batch ID.
     * @param array $data      Data to update (status, items_processed, etc).
     */
    public static function update_batch($batch_id, $data)
    {
        global $wpdb;
        $tenant_id = TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_import_batches';

        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['finished_at'] = current_time('mysql');
        }

        $wpdb->update($table, $data, array('id' => $batch_id, 'tenant_id' => $tenant_id));
    }
}
