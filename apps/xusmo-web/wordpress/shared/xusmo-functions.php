<?php
/**
 * Xusmo Shared Theme Functions
 *
 * Common PHP hooks used by all Xusmo themes (xusmo-service, xusmo-commerce,
 * xusmo-venue, xusmo-portfolio). Included via require_once in each theme's
 * functions.php.
 *
 * @package Xusmo
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ---------------------------------------------------------------------------
// Google Fonts
// ---------------------------------------------------------------------------

function xusmo_enqueue_fonts() {
	$google_fonts_url = get_option( 'xusmo_google_fonts_url', '' );

	if ( ! empty( $google_fonts_url ) ) {
		wp_enqueue_style(
			'xusmo-google-fonts',
			esc_url( $google_fonts_url ),
			array(),
			null
		);
	} else {
		$local_fonts = get_stylesheet_directory_uri() . '/assets/fonts/fonts.css';
		if ( file_exists( get_stylesheet_directory() . '/assets/fonts/fonts.css' ) ) {
			wp_enqueue_style(
				'xusmo-local-fonts',
				$local_fonts,
				array(),
				wp_get_theme()->get( 'Version' )
			);
		}
	}
}
add_action( 'wp_enqueue_scripts', 'xusmo_enqueue_fonts' );
add_action( 'enqueue_block_editor_assets', 'xusmo_enqueue_fonts' );

// ---------------------------------------------------------------------------
// Theme stylesheet (block themes don't auto-enqueue style.css)
// ---------------------------------------------------------------------------

function xusmo_enqueue_styles() {
	wp_enqueue_style(
		'xusmo-theme-style',
		get_stylesheet_uri(),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'xusmo_enqueue_styles' );

// ---------------------------------------------------------------------------
// React component bundle ([data-xusmo-component] mount points)
// ---------------------------------------------------------------------------

function xusmo_enqueue_react_bundle() {
	$bundle_path = get_stylesheet_directory() . '/assets/js/xusmo-components.js';
	if ( ! file_exists( $bundle_path ) ) {
		return;
	}

	wp_enqueue_script(
		'xusmo-components',
		get_stylesheet_directory_uri() . '/assets/js/xusmo-components.js',
		array(),
		filemtime( $bundle_path ),
		true
	);
}
add_action( 'wp_enqueue_scripts', 'xusmo_enqueue_react_bundle' );

// ---------------------------------------------------------------------------
// Defer React bundle for performance
// ---------------------------------------------------------------------------

function xusmo_defer_scripts( $tag, $handle ) {
	if ( 'xusmo-components' === $handle ) {
		return str_replace( ' src', ' defer src', $tag );
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'xusmo_defer_scripts', 10, 2 );

// ---------------------------------------------------------------------------
// JSON-LD structured data in <head>
// ---------------------------------------------------------------------------

function xusmo_jsonld_schema() {
	$schema = get_option( 'xusmo_jsonld_schema', '' );
	if ( ! empty( $schema ) ) {
		echo '<script type="application/ld+json">' . $schema . '</script>';
	}
}
add_action( 'wp_head', 'xusmo_jsonld_schema', 1 );

// ---------------------------------------------------------------------------
// Cache-control headers
// ---------------------------------------------------------------------------

function xusmo_cache_headers() {
	if ( ! is_admin() && ! is_user_logged_in() ) {
		header( 'Cache-Control: public, max-age=86400, s-maxage=86400' );
	}
}
add_action( 'send_headers', 'xusmo_cache_headers' );

// ---------------------------------------------------------------------------
// Theme design tokens -> window.xusmoTheme for React components
// ---------------------------------------------------------------------------

function xusmo_inject_theme_tokens() {
	$tokens = get_option( 'xusmo_theme_tokens', '' );
	if ( empty( $tokens ) ) {
		return;
	}
	echo '<script id="xusmo-theme-tokens">window.xusmoTheme=' . $tokens . ';</script>';
}
add_action( 'wp_head', 'xusmo_inject_theme_tokens', 99 );

// ---------------------------------------------------------------------------
// Custom CSS from xusmo_custom_css option
// ---------------------------------------------------------------------------

function xusmo_custom_css() {
	$custom_css = get_option( 'xusmo_custom_css', '' );
	if ( ! empty( $custom_css ) ) {
		echo '<style id="xusmo-custom-css">' . wp_strip_all_tags( $custom_css ) . '</style>';
	}
}
add_action( 'wp_head', 'xusmo_custom_css', 100 );

// ---------------------------------------------------------------------------
// Block pattern registration (from a whitelist of slugs)
// ---------------------------------------------------------------------------

/**
 * Register block patterns from the canonical wordpress/patterns/ directory.
 * Each theme calls this with its own whitelist array.
 *
 * @param array $whitelist Optional array of pattern slugs to register.
 *                         If empty, registers all patterns found.
 */
function xusmo_register_block_patterns( $whitelist = array() ) {
	// Check theme-local patterns/ first, then shared wordpress/patterns/
	$dirs = array(
		get_stylesheet_directory() . '/patterns/',
		dirname( get_stylesheet_directory(), 2 ) . '/patterns/',
	);

	$registered = array();

	foreach ( $dirs as $pattern_dir ) {
		if ( ! is_dir( $pattern_dir ) ) {
			continue;
		}

		$pattern_files = glob( $pattern_dir . '*.php' );
		if ( empty( $pattern_files ) ) {
			continue;
		}

		foreach ( $pattern_files as $pattern_file ) {
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

			// Skip if already registered (theme-local takes precedence)
			if ( isset( $registered[ $pattern_data['slug'] ] ) ) {
				continue;
			}

			// Skip if whitelist is set and slug is not in it
			if ( ! empty( $whitelist ) && ! in_array( $pattern_data['slug'], $whitelist, true ) ) {
				continue;
			}

			ob_start();
			include $pattern_file;
			$content = ob_get_clean();

			$categories = array();
			if ( ! empty( $pattern_data['categories'] ) ) {
				$categories = array_map( 'trim', explode( ',', $pattern_data['categories'] ) );
			}

			register_block_pattern(
				$pattern_data['slug'],
				array(
					'title'       => $pattern_data['title'],
					'description' => $pattern_data['description'],
					'categories'  => $categories,
					'content'     => $content,
				)
			);

			$registered[ $pattern_data['slug'] ] = true;
		}
	}
}

// ---------------------------------------------------------------------------
// Pattern categories (shared across all themes)
// ---------------------------------------------------------------------------

function xusmo_register_pattern_categories() {
	$categories = array(
		'xusmo-hero'       => __( 'Hero', 'xusmo' ),
		'xusmo-features'   => __( 'Features', 'xusmo' ),
		'xusmo-social'     => __( 'Social Proof', 'xusmo' ),
		'xusmo-cta'        => __( 'Call to Action', 'xusmo' ),
		'xusmo-contact'    => __( 'Contact', 'xusmo' ),
		'xusmo-content'    => __( 'Content', 'xusmo' ),
		'xusmo-commerce'   => __( 'Commerce', 'xusmo' ),
		'xusmo-media'      => __( 'Media', 'xusmo' ),
	);

	foreach ( $categories as $slug => $label ) {
		register_block_pattern_category( $slug, array( 'label' => $label ) );
	}
}
add_action( 'init', 'xusmo_register_pattern_categories' );
