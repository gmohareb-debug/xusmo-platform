<?php
/**
 * Title: CTA Split
 * Slug: xusmo/cta-split
 * Categories: xusmo-cta
 * Description: A split call-to-action section with text on one side and an image or highlight box on the other.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center">
			<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"primary","fontFamily":"body"} -->
			<p class="has-primary-color has-text-color has-body-font-family" style="font-size:0.9rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Why Choose Us</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"style":{"typography":{"fontSize":"2.25rem","fontWeight":"700","lineHeight":"1.3"}},"textColor":"text","fontFamily":"heading"} -->
			<h2 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700;line-height:1.3">We Bring Your Vision to Life</h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.05rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"text-muted","fontFamily":"body"} -->
			<p class="has-text-muted-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--20);font-size:1.05rem;line-height:1.7">With years of experience and a dedication to excellence, we offer solutions that truly make a difference. Our team is ready to help you achieve remarkable results.</p>
			<!-- /wp:paragraph -->

			<!-- wp:list {"style":{"typography":{"fontSize":"0.95rem","lineHeight":"2"},"spacing":{"padding":{"left":"var:preset|spacing|20"}}},"textColor":"text","fontFamily":"body"} -->
			<ul class="has-text-color has-text-color has-body-font-family" style="padding-left:var(--wp--preset--spacing--20);font-size:0.95rem;line-height:2">
				<li>Expert team with proven track record</li>
				<li>Customized solutions for your needs</li>
				<li>Transparent pricing, no hidden fees</li>
				<li>100% satisfaction guarantee</li>
			</ul>
			<!-- /wp:list -->

			<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|20"}}} -->
			<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
				<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600"}},"fontFamily":"body"} -->
				<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background has-body-font-family wp-element-button" href="/contact/" style="border-radius:6px;font-weight:600">Get Started Today</a></div>
				<!-- /wp:button -->

				<!-- wp:button {"textColor":"primary","className":"is-style-outline","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600"}},"fontFamily":"body"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-primary-color has-text-color wp-element-button" href="/about/" style="border-radius:6px;font-weight:600">Learn More</a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center">
			<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"12px"}}} -->
			<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Why choose us" style="border-radius:12px"/></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
