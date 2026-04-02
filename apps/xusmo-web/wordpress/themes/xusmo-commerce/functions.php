<?php
/**
 * Xusmo Commerce Theme — E-commerce businesses
 *
 * @package Xusmo_Commerce
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load shared Xusmo functions
require_once dirname( __DIR__ ) . '/shared/xusmo-functions.php';

// WooCommerce theme support
function xusmo_commerce_woocommerce_support() {
	add_theme_support( 'woocommerce', array(
		'product_grid' => array(
			'default_rows'    => 3,
			'default_columns' => 4,
			'min_columns'     => 2,
			'max_columns'     => 5,
		),
	) );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', 'xusmo_commerce_woocommerce_support' );

// Register patterns
function xusmo_commerce_init_patterns() {
	xusmo_register_block_patterns();
}
add_action( 'init', 'xusmo_commerce_init_patterns' );
