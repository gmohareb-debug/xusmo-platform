<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Schema Class.
 * 
 * Handles the creation and migration of GDS custom database tables.
 */
class Schema
{
	const DB_VERSION = '2.1.0';

	/**
	 * Create or update GDS tables.
	 */
	public static function update_schema()
	{
		global $wpdb;

		$current_version = get_option('gds_db_version');
		if ($current_version === self::DB_VERSION) {
			return;
		}

		$charset_collate = $wpdb->get_charset_collate();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// 1. Tenants Table (Platform Scope)
		$table_tenants = $wpdb->prefix . 'gds_tenants';
		$sql_tenants = "CREATE TABLE $table_tenants (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			domain varchar(255) NOT NULL,
			plan_name varchar(50) DEFAULT 'Growth',
			status varchar(20) DEFAULT 'active',
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY tenant_id (tenant_id),
			UNIQUE KEY domain (domain)
		) $charset_collate;";
		dbDelta($sql_tenants);

		// 2. Store Connections Table
		$table_connections = $wpdb->prefix . 'gds_store_connections';
		$sql_connections = "CREATE TABLE $table_connections (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			store_connection_id varchar(50) NOT NULL,
			tenant_id varchar(50) NOT NULL,
			platform_type varchar(50) NOT NULL,
			store_domain varchar(255) NOT NULL,
			auth_credentials longtext DEFAULT NULL,
			status varchar(20) DEFAULT 'connected',
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY connection_id (store_connection_id),
			KEY tenant_lookup (tenant_id)
		) $charset_collate;";
		dbDelta($sql_connections);

		// 3. Suppliers Table
		$table_suppliers = $wpdb->prefix . 'gds_suppliers';
		$sql_suppliers = "CREATE TABLE $table_suppliers (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			name varchar(255) NOT NULL,
			slug varchar(255) NOT NULL,
			connector_type varchar(50) NOT NULL,
			config longtext DEFAULT NULL,
			is_active tinyint(1) DEFAULT 1 NOT NULL,
			last_sync_at datetime DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY slug (tenant_id, slug)
		) $charset_collate;";
		dbDelta($sql_suppliers);

		// 4. Import Batches Table
		$table_batches = $wpdb->prefix . 'gds_import_batches';
		$sql_batches = "CREATE TABLE $table_batches (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			supplier_id bigint(20) NOT NULL,
			status varchar(50) NOT NULL,
			items_processed int(11) DEFAULT 0,
			items_failed int(11) DEFAULT 0,
			raw_payload_path text DEFAULT NULL,
			started_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			finished_at datetime DEFAULT NULL,
			PRIMARY KEY (id),
			KEY tenant_store (tenant_id, store_connection_id)
		) $charset_collate;";
		dbDelta($sql_batches);

		// 5. Supplier Products (Staging)
		$table_products = $wpdb->prefix . 'gds_supplier_products';
		$sql_products = "CREATE TABLE $table_products (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			supplier_id bigint(20) NOT NULL,
			supplier_sku varchar(100) NOT NULL,
			title varchar(255) DEFAULT NULL,
			description longtext DEFAULT NULL,
			category varchar(255) DEFAULT NULL,
			brand varchar(100) DEFAULT NULL,
			image_urls text DEFAULT NULL,
			raw_data longtext DEFAULT NULL,
			is_private tinyint(1) DEFAULT 0 NOT NULL,
			last_import_batch_id bigint(20) DEFAULT NULL,
			published_product_id bigint(20) DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY supplier_sku_v2 (tenant_id, store_connection_id, supplier_id, supplier_sku)
		) $charset_collate;";
		dbDelta($sql_products);

		// 6. Supplier Variants (Staging)
		$table_variants = $wpdb->prefix . 'gds_supplier_variants';
		$sql_variants = "CREATE TABLE $table_variants (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			product_id bigint(20) NOT NULL,
			supplier_v_sku varchar(100) NOT NULL,
			attributes text DEFAULT NULL,
			cost decimal(19,4) DEFAULT 0.0000 NOT NULL,
			price decimal(19,4) DEFAULT 0.0000 NOT NULL,
			currency char(3) DEFAULT 'USD' NOT NULL,
			supplier_origin varchar(50) DEFAULT NULL,
			stock_qty int(11) DEFAULT 0 NOT NULL,
			published_variation_id bigint(20) DEFAULT NULL,
			is_quarantined tinyint(1) DEFAULT 0 NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY supplier_v_sku_v2 (tenant_id, store_connection_id, product_id, supplier_v_sku)
		) $charset_collate;";
		dbDelta($sql_variants);

		// 7. Mappings Table
		$table_mappings = $wpdb->prefix . 'gds_mappings';
		$sql_mappings = "CREATE TABLE $table_mappings (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			mapping_type varchar(50) NOT NULL,
			source_value varchar(255) NOT NULL,
			target_value varchar(255) NOT NULL,
			supplier_id bigint(20) DEFAULT NULL,
			PRIMARY KEY (id),
			KEY tenant_store (tenant_id, store_connection_id)
		) $charset_collate;";
		dbDelta($sql_mappings);

		// 8. Purchase Orders Table
		$table_pos = $wpdb->prefix . 'gds_purchase_orders';
		$sql_pos = "CREATE TABLE $table_pos (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			order_id bigint(20) NOT NULL,
			supplier_id bigint(20) NOT NULL,
			status varchar(50) NOT NULL,
			supplier_po_ref varchar(100) DEFAULT NULL,
			carrier varchar(100) DEFAULT NULL,
			tracking_number varchar(255) DEFAULT NULL,
			items_json longtext DEFAULT NULL,
			total_cost decimal(19,4) DEFAULT 0.0000 NOT NULL,
			currency char(3) DEFAULT 'USD' NOT NULL,
			cancellation_expiry datetime DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY order_lookup (tenant_id, store_connection_id, order_id)
		) $charset_collate;";
		dbDelta($sql_pos);

		// 9. Fulfillment Events Table
		$table_fulfillment = $wpdb->prefix . 'gds_fulfillment_events';
		$sql_fulfillment = "CREATE TABLE $table_fulfillment (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			po_id bigint(20) NOT NULL,
			event_type varchar(50) NOT NULL,
			carrier varchar(100) DEFAULT NULL,
			tracking_number varchar(255) DEFAULT NULL,
			raw_payload longtext DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY po_lookup (tenant_id, store_connection_id, po_id)
		) $charset_collate;";
		dbDelta($sql_fulfillment);

		// 10. Audit Log Table
		$table_audit = $wpdb->prefix . 'gds_audit_log';
		$sql_audit = "CREATE TABLE $table_audit (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			event_type varchar(100) NOT NULL,
			object_type varchar(50) DEFAULT NULL,
			object_id bigint(20) DEFAULT NULL,
			user_id bigint(20) DEFAULT NULL,
			action varchar(255) NOT NULL,
			details longtext DEFAULT NULL,
			ip_address varchar(45) DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY event_lookup (tenant_id, store_connection_id, event_type),
			KEY object_lookup (tenant_id, store_connection_id, object_type, object_id)
		) $charset_collate;";
		dbDelta($sql_audit);

		// 11. RMA Requests Table
		$table_rma = $wpdb->prefix . 'gds_rma_requests';
		$sql_rma = "CREATE TABLE $table_rma (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			po_id bigint(20) NOT NULL,
			order_id bigint(20) NOT NULL,
			status varchar(50) NOT NULL,
			reason text DEFAULT NULL,
			wc_refund_id bigint(20) DEFAULT NULL,
			items_json text DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY po_lookup (tenant_id, store_connection_id, po_id),
			KEY order_lookup (tenant_id, store_connection_id, order_id)
		) $charset_collate;";
		dbDelta($sql_rma);

		// 12. Pricing Rules Table
		$table_pricing_rules = $wpdb->prefix . 'gds_pricing_rules';
		$sql_pricing_rules = "CREATE TABLE $table_pricing_rules (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			rule_name varchar(100) NOT NULL,
			min_cost decimal(19,4) DEFAULT 0.0000 NOT NULL,
			max_cost decimal(19,4) DEFAULT 0.0000 NOT NULL,
			markup_type varchar(20) DEFAULT 'multiplier' NOT NULL,
			markup_value decimal(19,4) DEFAULT 1.0000 NOT NULL,
			priority int(11) DEFAULT 0 NOT NULL,
			is_active tinyint(1) DEFAULT 1 NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY tenant_store (tenant_id, store_connection_id)
		) $charset_collate;";
		dbDelta($sql_pricing_rules);

		// 13. Inventory Snapshots Table
		$table_inventory = $wpdb->prefix . 'gds_inventory_snapshots';
		$sql_inventory = "CREATE TABLE $table_inventory (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			variant_id bigint(20) NOT NULL,
			stock_qty int(11) NOT NULL,
			snapshot_date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY variant_date (tenant_id, store_connection_id, variant_id, snapshot_date)
		) $charset_collate;";
		dbDelta($sql_inventory);

		// 14. Job Runs Table
		$table_jobs = $wpdb->prefix . 'gds_job_runs';
		$sql_jobs = "CREATE TABLE $table_jobs (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			job_type varchar(100) NOT NULL,
			status varchar(50) NOT NULL,
			started_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			finished_at datetime DEFAULT NULL,
			retries int(11) DEFAULT 0 NOT NULL,
			summary text DEFAULT NULL,
			PRIMARY KEY (id),
			KEY tenant_store (tenant_id, store_connection_id)
		) $charset_collate;";
		dbDelta($sql_jobs);

		// 15. Studio Staging Table
		$table_studio = $wpdb->prefix . 'gds_studio_staging';
		$sql_studio = "CREATE TABLE $table_studio (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			tenant_id varchar(50) NOT NULL,
			store_connection_id varchar(50) DEFAULT NULL,
			layout_json longtext NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY (id),
			KEY tenant_store (tenant_id, store_connection_id)
		) $charset_collate;";
		dbDelta($sql_studio);

		update_option('gds_db_version', self::DB_VERSION);
	}
}
