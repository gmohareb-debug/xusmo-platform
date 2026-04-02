<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class ImportsRestController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/imports/run', array(
            array(
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => array($this, 'trigger_import'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));

        register_rest_route($this->namespace, '/imports/(?P<id>[\w\-]+)', array(
            array(
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'get_import_status'),
                'permission_callback' => array($this, 'check_tenant_permission'),
            )
        ));
    }

    public function trigger_import($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();

        $supplier_slug = sanitize_text_field($request->get_param('supplier'));
        $strategy = sanitize_text_field($request->get_param('strategy') ?: 'async');

        if (empty($supplier_slug)) {
            return new \WP_Error('missing_params', 'Supplier slug is required.', array('status' => 400));
        }

        $supplier = is_numeric($supplier_slug)
            ? \GDS\Core\SupplierManager::get_supplier(intval($supplier_slug))
            : \GDS\Core\SupplierManager::get_supplier_by_slug($supplier_slug);

        if (!$supplier) {
            return new \WP_Error('invalid_supplier', 'Supplier not found or connected.', array('status' => 404));
        }

        $this->log_audit_event('import_triggered', array('supplier' => $supplier->id, 'strategy' => $strategy), 'supplier', $supplier->id);

        if ($strategy === 'async') {
            do_action('gds_catalog_import_trigger', null, $supplier->id);
            return rest_ensure_response(array('success' => true, 'message' => 'Import queued asynchronously.', 'supplier_id' => $supplier->id));
        }

        // Fallback for sync execution if needed
        $agent = \GDS\Core\AgentRegistry::instance()->get('catalog');
        $agent->process_import(null, $supplier->id);

        return rest_ensure_response(array('success' => true, 'message' => 'Import executed synchronously.', 'supplier_id' => $supplier->id));
    }

    public function get_import_status($request)
    {
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $batch_id = sanitize_text_field($request['id']);

        global $wpdb;
        $table = $wpdb->prefix . 'gds_import_batches';
        // The table uses ID implicitly, or relies on batch ID. Assuming batch_id mapping.
        $batch = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d AND tenant_id = %s", intval($batch_id), $tenant_id));

        if (!$batch) {
            return new \WP_Error('not_found', 'Batch not found', array('status' => 404));
        }

        return rest_ensure_response($batch);
    }
}
