<?php
/**
 * Title: Product Grid
 * Slug: xusmo/product-grid
 * Categories: xusmo-commerce
 * Description: A WooCommerce product grid with heading and category filter. Displays products using the [products] shortcode.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Our Products</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">Browse our curated selection of quality products.</p>
	<!-- /wp:paragraph -->

	<!-- wp:shortcode -->
	[products limit="12" columns="4" orderby="date" order="DESC"]
	<!-- /wp:shortcode -->
</div>
<!-- /wp:group -->
