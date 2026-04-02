<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Job Orchestrator.
 * 
 * Manages AS/Cron scheduling, retries, and job run observability.
 */
class JobOrchestrator
{
    private static $_instance = null;

    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function init()
    {
        // Hook into core trigger actions to provide background execution
        add_action('gds_catalog_import_trigger', array($this, 'schedule_import'), 10, 2);
        add_action('gds_pricing_update_trigger', array($this, 'schedule_pricing'), 10, 1);

        // Register the actual background workers
        add_action('gds_run_import_job', array($this, 'run_import_job'));
        add_action('gds_run_pricing_job', array($this, 'run_pricing_job'));
    }

    public function schedule_import($batch_id, $supplier_id)
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $args = array(
            $supplier_id,
            0, // retry_count
            $registry->get_tenant_id(),
            $registry->get_store_connection_id()
        );

        if (function_exists('as_enqueue_async_action')) {
            as_enqueue_async_action('gds_run_import_job', $args, 'gds_jobs');
        } else {
            wp_schedule_single_event(time(), 'gds_run_import_job', $args);
        }
        $this->log_job_run('catalog_import', 'queued', "Import queued for supplier $supplier_id");
    }

    public function schedule_pricing($args = array())
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $job_args = array(
            0, // retry_count
            $registry->get_tenant_id(),
            $registry->get_store_connection_id()
        );

        if (function_exists('as_enqueue_async_action')) {
            as_enqueue_async_action('gds_run_pricing_job', $job_args, 'gds_jobs');
        } else {
            wp_schedule_single_event(time(), 'gds_run_pricing_job', $job_args);
        }
        $this->log_job_run('pricing_update', 'queued', "Pricing update queued.");
    }

    public function run_import_job($supplier_id, $retry_count = 0, $tenant_id = null, $store_connection_id = null)
    {
        // Restore multi-tenant context (SaaS Guard)
        if ($tenant_id) {
            \GDS\Core\TenantRegistry::instance()->set_context($tenant_id, $store_connection_id);
        }

        $job_id = $this->log_job_run('catalog_import', 'running', "Supplier ID: $supplier_id. Attempt: " . ($retry_count + 1), $retry_count);

        $catalog_agent = AgentRegistry::instance()->get('catalog');
        if ($catalog_agent) {
            try {
                $catalog_agent->process_import(null, $supplier_id);
                $this->update_job_run($job_id, 'completed', "Import success for supplier $supplier_id");
            } catch (\Exception $e) {
                $this->handle_job_failure('gds_run_import_job', array($supplier_id), $retry_count, $job_id, $e->getMessage());
            }
        }
    }

    public function run_pricing_job($retry_count = 0, $tenant_id = null, $store_connection_id = null)
    {
        // Restore multi-tenant context
        if ($tenant_id) {
            \GDS\Core\TenantRegistry::instance()->set_context($tenant_id, $store_connection_id);
        }

        $job_id = $this->log_job_run('pricing_update', 'running', "Global pricing evaluation. Attempt: " . ($retry_count + 1), $retry_count);

        $pricing_agent = AgentRegistry::instance()->get('pricing');
        if ($pricing_agent) {
            try {
                $pricing_agent->evaluate_prices();
                $this->update_job_run($job_id, 'completed', "Pricing evaluation success.");
            } catch (\Exception $e) {
                $this->handle_job_failure('gds_run_pricing_job', array(), $retry_count, $job_id, $e->getMessage());
            }
        }
    }

    private function handle_job_failure($hook, $args, $retry_count, $job_id, $error_message)
    {
        $max_retries = 3;
        if ($retry_count < $max_retries) {
            $next_retry = $retry_count + 1;
            $delay = pow(2, $next_retry) * MINUTE_IN_SECONDS;

            $registry = \GDS\Core\TenantRegistry::instance();
            $retry_args = array_merge($args, array(
                $next_retry,
                $registry->get_tenant_id(),
                $registry->get_store_connection_id()
            ));

            if (function_exists('as_enqueue_async_action')) {
                as_schedule_single_action(time() + $delay, $hook, $retry_args, 'gds_jobs');
            } else {
                wp_schedule_single_event(time() + $delay, $hook, $retry_args);
            }

            $this->update_job_run($job_id, 'retrying', "Attempt failed: $error_message. Retrying in " . ($delay / 60) . " mins.", $next_retry);

        } else {
            $this->update_job_run($job_id, 'failed', "Max retries reached. Final Error: $error_message", $retry_count);
            \GDS\Core\Logger::log('jobs', 'JOB_DEAD_LETTER', array('hook' => $hook, 'args' => $args, 'error' => $error_message), 'error');
        }
    }

    public function log_job_run($type, $status, $summary = '', $retries = 0)
    {
        global $wpdb;
        $registry = \GDS\Core\TenantRegistry::instance();
        $table = $wpdb->prefix . 'gds_job_runs';
        $wpdb->insert($table, array(
            'tenant_id' => $registry->get_tenant_id(),
            'store_connection_id' => $registry->get_store_connection_id(),
            'job_type' => $type,
            'status' => $status,
            'summary' => $summary,
            'retries' => $retries,
            'started_at' => current_time('mysql')
        ));
        return $wpdb->insert_id;
    }

    public function update_job_run($job_id, $status, $summary = '', $retries = null)
    {
        global $wpdb;
        $tenant_id = \GDS\Core\TenantRegistry::instance()->get_tenant_id();
        $table = $wpdb->prefix . 'gds_job_runs';

        $data = array(
            'status' => $status,
            'summary' => $summary,
            'finished_at' => current_time('mysql')
        );

        if ($retries !== null) {
            $data['retries'] = $retries;
        }

        $wpdb->update($table, $data, array('id' => $job_id, 'tenant_id' => $tenant_id));
    }
}
