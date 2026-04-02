<?php
/**
 * Title: Hero with Image Background
 * Slug: xusmo/hero-image-bg
 * Categories: xusmo-hero
 * Description: A dramatic full-width hero with dark overlay, large centered heading, description, and dual CTA buttons.
 */
?>
<!-- wp:cover {"dimRatio":60,"overlayColor":"text","isUserOverlayColor":true,"minHeight":520,"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-cover" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40);min-height:520px">
	<span aria-hidden="true" class="wp-block-cover__background has-text-background-color has-background-dim-60 has-background-dim"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30"}}},"layout":{"type":"constrained"}} -->
		<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30)">
			<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.2rem, 5vw, 3.5rem)","fontWeight":"800","lineHeight":"1.15"}},"textColor":"background","fontFamily":"heading"} -->
			<h1 class="wp-block-heading has-text-align-center has-background-color has-text-color has-heading-font-family" style="font-size:clamp(2.2rem, 5vw, 3.5rem);font-weight:800;line-height:1.15">Welcome to Our Business</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.15rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"surface","fontFamily":"body"} -->
			<p class="has-text-align-center has-surface-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--30);font-size:1.15rem;line-height:1.7">We deliver exceptional results with a commitment to quality and customer satisfaction. Discover how we can help you achieve your goals.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->

		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|20"}}} -->
		<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
			<!-- wp:button {"backgroundColor":"accent","textColor":"background","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"700","fontSize":"1.05rem"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2.25rem","right":"2.25rem"}}},"fontFamily":"body"} -->
			<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-accent-background-color has-text-color has-background has-body-font-family wp-element-button" style="border-radius:6px;padding-top:0.9rem;padding-right:2.25rem;padding-bottom:0.9rem;padding-left:2.25rem;font-size:1.05rem;font-weight:700" href="/contact/">Get Started</a></div>
			<!-- /wp:button -->

			<!-- wp:button {"textColor":"background","className":"is-style-outline","style":{"border":{"radius":"6px","color":"var:preset|color|surface","width":"2px"},"typography":{"fontWeight":"600","fontSize":"1.05rem"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2.25rem","right":"2.25rem"}}},"fontFamily":"body"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-background-color has-text-color wp-element-button" style="border-radius:6px;border-color:var(--wp--preset--color--surface);border-width:2px;padding-top:0.9rem;padding-right:2.25rem;padding-bottom:0.9rem;padding-left:2.25rem;font-size:1.05rem;font-weight:600" href="/about/">Learn More</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
</div>
<!-- /wp:cover -->
