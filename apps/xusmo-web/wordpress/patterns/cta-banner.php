<?php
/**
 * Title: CTA Banner
 * Slug: xusmo/cta-banner
 * Categories: xusmo-cta
 * Description: A full-width call-to-action banner with heading, description, and action button.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"primary","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group has-primary-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"background","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-background-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Ready to Get Started?</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"surface","fontFamily":"body"} -->
	<p class="has-text-align-center has-surface-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--20);font-size:1.1rem;line-height:1.7">Take the first step today. Contact us for a free consultation and discover how we can help your business thrive.</p>
	<!-- /wp:paragraph -->

	<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
	<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
		<!-- wp:button {"backgroundColor":"background","textColor":"primary","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600","fontSize":"1.05rem"},"spacing":{"padding":{"top":"0.85rem","bottom":"0.85rem","left":"2.25rem","right":"2.25rem"}}},"fontFamily":"body"} -->
		<div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-background-background-color has-text-color has-background has-body-font-family wp-element-button" href="/contact/" style="border-radius:6px;padding-top:0.85rem;padding-right:2.25rem;padding-bottom:0.85rem;padding-left:2.25rem;font-size:1.05rem;font-weight:600">Contact Us Today</a></div>
		<!-- /wp:button -->
	</div>
	<!-- /wp:buttons -->
</div>
<!-- /wp:group -->
