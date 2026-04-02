<?php
/**
 * Test JobOrchestrator
 */

if (file_exists(__DIR__ . '/wp-load.php')) {
    require_once __DIR__ . '/wp-load.php';
} elseif (file_exists('/var/www/html/wp-load.php')) {
    require_once '/var/www/html/wp-load.php';
} else {
    die("Error: wp-load.php not found.\n");
}

function test_job_orchestrator()
{
    global $wpdb;
    echo "--- TESTING JOB ORCHESTRATOR ---\n";

    // 1. Get a supplier ID
    $supplier_id = $wpdb->get_var("SELECT id FROM {$wpdb->prefix}gds_suppliers LIMIT 1");
    if (!$supplier_id) {
        die("ABORT: No suppliers found. Run fix-and-test.php first.\n");
    }

    // 2. Trigger via action
    echo "Triggering gds_catalog_import_trigger for supplier $supplier_id...\n";
    do_action('gds_catalog_import_trigger', null, $supplier_id);

    // 3. Since we are in CLI and Action Scheduler might not be running unless we trigger it,
    // let's check if a job was LOGGED in our custom job table.
    $job = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}gds_job_runs WHERE job_type = 'catalog_import' ORDER BY id DESC LIMIT 1");

    if ($job) {
        echo "SUCCESS: Job logged in gds_job_runs. ID: {$job->id}, Status: {$job->status}\n";
    } else {
        echo "FAILURE: No job logged in gds_job_runs.\n";
    }

    echo "--- JOB TEST COMPLETE ---\n";
}

test_job_orchestrator();
