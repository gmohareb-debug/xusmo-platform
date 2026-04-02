<?php
/**
 * Xusmo Portfolio Theme — Photographers, designers, agencies, freelancers
 *
 * @package Xusmo_Portfolio
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__ ) . '/shared/xusmo-functions.php';

function xusmo_portfolio_init_patterns() {
	xusmo_register_block_patterns();
}
add_action( 'init', 'xusmo_portfolio_init_patterns' );
