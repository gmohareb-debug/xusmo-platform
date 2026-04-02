<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Logger Class.
 * 
 * Handles structured audit logging for GDS system events.
 */
class Logger
{

    /**
     * Log a system or agent event.
     * 
     * @param string $event_type E.g., 'catalog_import', 'price_update', 'po_submission'.
     * @param string $action     Short description.
     * @param array  $details    Contextual data.
     * @param string $obj_type   Optional object type.
     * @param int    $obj_id     Optional object ID.
     */
    public static function log($event_type, $action, $details = array(), $obj_type = null, $obj_id = null)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gds_audit_log';

        // Sanitize details (redact secrets if found)
        $sanitized_details = self::redact_secrets($details);

        $registry = \GDS\Core\TenantRegistry::instance();

        $wpdb->insert($table, array(
            'tenant_id' => $registry->get_tenant_id(),
            'store_connection_id' => $registry->get_store_connection_id(),
            'event_type' => $event_type,
            'action' => $action,
            'details' => maybe_serialize($sanitized_details),
            'object_type' => $obj_type,
            'object_id' => $obj_id,
            'user_id' => get_current_user_id(),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'created_at' => current_time('mysql'),
        ));

        // Fallback to error_log for critical auditing visibility.
        error_log("[GDS Audit] $event_type | $action | Obj: $obj_type #$obj_id");
    }

    /**
     * Redact sensitive keys from log details.
     */
    private static function redact_secrets($data)
    {
        if (!is_array($data))
            return $data;

        $secret_keys = array('api_key', 'client_secret', 'secret', 'password', 'token');

        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $secret_keys)) {
                $data[$key] = '********';
            } elseif (is_array($value)) {
                $data[$key] = self::redact_secrets($value);
            }
        }

        return $data;
    }
}
