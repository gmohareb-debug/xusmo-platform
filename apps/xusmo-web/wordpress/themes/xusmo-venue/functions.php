<?php
/**
 * Xusmo Venue Theme — Restaurants, cafes, hotels, event spaces
 *
 * @package Xusmo_Venue
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__ ) . '/shared/xusmo-functions.php';

function xusmo_venue_init_patterns() {
	xusmo_register_block_patterns();
}
add_action( 'init', 'xusmo_venue_init_patterns' );
