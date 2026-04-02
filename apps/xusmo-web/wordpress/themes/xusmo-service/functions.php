<?php
/**
 * Xusmo Service Theme — Professional service businesses
 *
 * @package Xusmo_Service
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load shared Xusmo functions (fonts, React bundle, JSON-LD, etc.)
require_once dirname( __DIR__ ) . '/shared/xusmo-functions.php';

// Register patterns — shared patterns + service-specific
function xusmo_service_init_patterns() {
	xusmo_register_block_patterns(); // registers all available patterns
}
add_action( 'init', 'xusmo_service_init_patterns' );
