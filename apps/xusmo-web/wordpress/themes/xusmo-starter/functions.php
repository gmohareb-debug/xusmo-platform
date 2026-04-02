<?php
/**
 * Xusmo Starter Theme functions and definitions.
 *
 * @package Xusmo_Starter
 * @since 1.2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Google Fonts dynamically based on the xusmo_google_fonts_url option.
 * This option is set by the builder agent when applying the archetype theme preset.
 * Falls back to locally hosted fonts if no option is set.
 */
function xusmo_starter_enqueue_fonts() {
	$google_fonts_url = get_option( 'xusmo_google_fonts_url', '' );

	if ( ! empty( $google_fonts_url ) ) {
		// Enqueue Google Fonts from CDN
		wp_enqueue_style(
			'xusmo-google-fonts',
			esc_url( $google_fonts_url ),
			array(),
			null // No version for external CDN
		);
	} else {
		// Fallback: locally hosted fonts
		$local_fonts = get_stylesheet_directory_uri() . '/assets/fonts/fonts.css';
		if ( file_exists( get_stylesheet_directory() . '/assets/fonts/fonts.css' ) ) {
			wp_enqueue_style(
				'xusmo-starter-fonts',
				$local_fonts,
				array(),
				wp_get_theme()->get( 'Version' )
			);
		}
	}
}
add_action( 'wp_enqueue_scripts', 'xusmo_starter_enqueue_fonts' );
add_action( 'enqueue_block_editor_assets', 'xusmo_starter_enqueue_fonts' );

/**
 * Enqueue the child theme stylesheet.
 * Block themes don't auto-enqueue style.css — we must do it explicitly.
 */
function xusmo_starter_enqueue_styles() {
	wp_enqueue_style(
		'xusmo-starter-style',
		get_stylesheet_uri(),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'xusmo_starter_enqueue_styles' );

/**
 * Enqueue the React component bundle that renders interactive homepage sections.
 * The bundle mounts on elements with [data-xusmo-component] attributes.
 */
function xusmo_starter_enqueue_react_bundle() {
	$bundle_path = get_stylesheet_directory() . '/assets/js/xusmo-components.js';
	if ( ! file_exists( $bundle_path ) ) {
		return;
	}

	wp_enqueue_script(
		'xusmo-components',
		get_stylesheet_directory_uri() . '/assets/js/xusmo-components.js',
		array(),
		filemtime( $bundle_path ),
		true // Load in footer
	);
}
add_action( 'wp_enqueue_scripts', 'xusmo_starter_enqueue_react_bundle' );

/**
 * Add defer attribute to the React components script for better performance.
 * This prevents the script from blocking page rendering.
 */
function xusmo_starter_defer_scripts( $tag, $handle ) {
	if ( 'xusmo-components' === $handle ) {
		return str_replace( ' src', ' defer src', $tag );
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'xusmo_starter_defer_scripts', 10, 2 );

/**
 * Output JSON-LD structured data schema in the <head>.
 * The schema is stored in the xusmo_jsonld_schema option by the SEO agent.
 */
function xusmo_starter_jsonld_schema() {
	$schema = get_option( 'xusmo_jsonld_schema', '' );
	if ( ! empty( $schema ) ) {
		echo '<script type="application/ld+json">' . $schema . '</script>';
	}
}
add_action( 'wp_head', 'xusmo_starter_jsonld_schema', 1 );

/**
 * Send cache-control headers for better performance.
 */
function xusmo_starter_cache_headers() {
	if ( ! is_admin() && ! is_user_logged_in() ) {
		header( 'Cache-Control: public, max-age=86400, s-maxage=86400' );
	}
}
add_action( 'send_headers', 'xusmo_starter_cache_headers' );

/**
 * Inject theme design tokens as window.xusmoTheme for React components.
 * The xusmo_theme_tokens option is set by the sync service.
 */
function xusmo_starter_inject_theme_tokens() {
	$tokens = get_option( 'xusmo_theme_tokens', '' );
	if ( empty( $tokens ) ) {
		return;
	}
	// Tokens are already valid JSON — output directly
	echo '<script id="xusmo-theme-tokens">window.xusmoTheme=' . $tokens . ';</script>';
}
add_action( 'wp_head', 'xusmo_starter_inject_theme_tokens', 99 );

/**
 * Inject custom CSS from the xusmo_custom_css option.
 * This provides CSS custom properties for border radius, section padding, etc.
 */
function xusmo_starter_custom_css() {
	$custom_css = get_option( 'xusmo_custom_css', '' );
	if ( ! empty( $custom_css ) ) {
		echo '<style id="xusmo-custom-css">' . wp_strip_all_tags( $custom_css ) . '</style>';
	}
}
add_action( 'wp_head', 'xusmo_starter_custom_css', 100 );

/**
 * Register all block patterns from the patterns/ directory.
 */
function xusmo_starter_register_block_patterns() {
	$pattern_dir = get_stylesheet_directory() . '/patterns/';

	if ( ! is_dir( $pattern_dir ) ) {
		// Fall back to the shared patterns directory at the theme root level.
		$pattern_dir = dirname( get_stylesheet_directory(), 2 ) . '/patterns/';
	}

	if ( ! is_dir( $pattern_dir ) ) {
		return;
	}

	$pattern_files = glob( $pattern_dir . '*.php' );

	if ( empty( $pattern_files ) ) {
		return;
	}

	foreach ( $pattern_files as $pattern_file ) {
		// Extract pattern header from the file.
		$pattern_data = get_file_data(
			$pattern_file,
			array(
				'title'       => 'Title',
				'slug'        => 'Slug',
				'categories'  => 'Categories',
				'description' => 'Description',
			)
		);

		if ( empty( $pattern_data['slug'] ) ) {
			continue;
		}

		// Get the pattern content.
		ob_start();
		include $pattern_file;
		$content = ob_get_clean();

		// Parse categories into an array.
		$categories = array();
		if ( ! empty( $pattern_data['categories'] ) ) {
			$categories = array_map( 'trim', explode( ',', $pattern_data['categories'] ) );
		}

		// Register the pattern.
		register_block_pattern(
			$pattern_data['slug'],
			array(
				'title'       => $pattern_data['title'],
				'description' => $pattern_data['description'],
				'categories'  => $categories,
				'content'     => $content,
			)
		);
	}
}
add_action( 'init', 'xusmo_starter_register_block_patterns' );

/**
 * Register custom block pattern categories.
 */
function xusmo_starter_register_pattern_categories() {
	$categories = array(
		'xusmo-hero'       => __( 'Hero', 'xusmo-starter' ),
		'xusmo-features'   => __( 'Features', 'xusmo-starter' ),
		'xusmo-social'     => __( 'Social Proof', 'xusmo-starter' ),
		'xusmo-cta'        => __( 'Call to Action', 'xusmo-starter' ),
		'xusmo-contact'    => __( 'Contact', 'xusmo-starter' ),
		'xusmo-content'    => __( 'Content', 'xusmo-starter' ),
		'xusmo-commerce'   => __( 'Commerce', 'xusmo-starter' ),
		'xusmo-media'      => __( 'Media', 'xusmo-starter' ),
	);

	foreach ( $categories as $slug => $label ) {
		register_block_pattern_category( $slug, array( 'label' => $label ) );
	}
}
add_action( 'init', 'xusmo_starter_register_pattern_categories' );

/**
 * Declare WooCommerce theme support.
 * Prevents "Your theme does not declare WooCommerce support" warning.
 */
function xusmo_starter_woocommerce_support() {
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
add_action( 'after_setup_theme', 'xusmo_starter_woocommerce_support' );
