<?php
/**
 * Title: Hero Video Background
 * Slug: xusmo/hero-video-bg
 * Categories: xusmo-hero
 * Description: A high-contrast hero built for video backgrounds with dual CTA actions.
 */
?>
<!-- wp:cover {"dimRatio":70,"overlayColor":"text","isUserOverlayColor":true,"minHeight":640,"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"820px"}} -->
<div class="wp-block-cover" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40);min-height:640px">
	<span aria-hidden="true" class="wp-block-cover__background has-text-background-color has-background-dim-70 has-background-dim"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1.08"}},"textColor":"background","fontFamily":"heading"} -->
		<h1 class="wp-block-heading has-text-align-center has-background-color has-text-color has-heading-font-family" style="font-size:clamp(2.5rem, 5vw, 4rem);font-weight:800;line-height:1.08">Experience the Difference</h1>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.15rem","lineHeight":"1.75"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"surface","fontFamily":"body"} -->
		<p class="has-text-align-center has-surface-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--30);font-size:1.15rem;line-height:1.75">See what sets us apart. Our commitment to excellence is visible in everything we do.</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center","flexWrap":"wrap"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|20"}}} -->
		<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
			<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"700","fontSize":"1rem"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2.25rem","right":"2.25rem"}}},"fontFamily":"body"} -->
			<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background has-body-font-family wp-element-button" href="/about/" style="border-radius:6px;padding-top:0.9rem;padding-right:2.25rem;padding-bottom:0.9rem;padding-left:2.25rem;font-size:1rem;font-weight:700">Watch Our Story</a></div>
			<!-- /wp:button -->

			<!-- wp:button {"textColor":"background","className":"is-style-outline","style":{"border":{"radius":"6px","color":"var:preset|color|background","width":"2px"},"typography":{"fontWeight":"700","fontSize":"1rem"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2.25rem","right":"2.25rem"}}},"fontFamily":"body"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-background-color has-text-color wp-element-button" href="/about/" style="border-radius:6px;border-color:var(--wp--preset--color--background);border-width:2px;padding-top:0.9rem;padding-right:2.25rem;padding-bottom:0.9rem;padding-left:2.25rem;font-size:1rem;font-weight:700">Learn More</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
</div>
<!-- /wp:cover -->
