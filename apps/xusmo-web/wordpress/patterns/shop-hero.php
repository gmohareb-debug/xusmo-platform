<?php
/**
 * Title: Shop Hero
 * Slug: xusmo/shop-hero
 * Categories: xusmo-commerce
 * Description: A shop-specific hero with heading, tagline, and browse CTA for e-commerce pages.
 */
?>
<!-- wp:cover {"dimRatio":65,"overlayColor":"text","isUserOverlayColor":true,"minHeight":380,"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-cover" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--40);min-height:380px">
	<span aria-hidden="true" class="wp-block-cover__background has-text-background-color has-background-dim-60 has-background-dim"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2rem, 4.5vw, 3rem)","fontWeight":"800","lineHeight":"1.15"}},"textColor":"light","fontFamily":"heading"} -->
		<h1 class="wp-block-heading has-text-align-center has-light-color has-text-color has-heading-font-family" style="font-size:clamp(2rem, 4.5vw, 3rem);font-weight:800;line-height:1.15">Browse Our Collection</h1>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"light","fontFamily":"body"} -->
		<p class="has-text-align-center has-light-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--20);font-size:1.1rem;line-height:1.7">Discover quality products curated for you. Free shipping on orders over $50.</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
		<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
			<!-- wp:button {"backgroundColor":"accent","textColor":"light","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"700","fontSize":"1rem"},"spacing":{"padding":{"top":"0.85rem","bottom":"0.85rem","left":"2rem","right":"2rem"}}},"fontFamily":"body"} -->
			<div class="wp-block-button"><a class="wp-block-button__link has-light-color has-accent-background-color has-text-color has-background has-body-font-family wp-element-button" href="/shop/" style="border-radius:6px;padding-top:0.85rem;padding-right:2rem;padding-bottom:0.85rem;padding-left:2rem;font-size:1rem;font-weight:700">Shop Now</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
</div>
<!-- /wp:cover -->
