<?php
/**
 * Title: Booking CTA
 * Slug: xusmo/booking-cta
 * Categories: xusmo-cta, xusmo-commerce
 * Description: A booking call-to-action section with a prominent heading, description, and booking button.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"surface","layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-group has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center","width":"60%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%">
			<!-- wp:heading {"style":{"typography":{"fontSize":"2rem","fontWeight":"700","lineHeight":"1.3"}},"textColor":"text","fontFamily":"heading"} -->
			<h2 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:2rem;font-weight:700;line-height:1.3">Book Your Appointment Today</h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"text-muted","fontFamily":"body"} -->
			<p class="has-text-muted-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--20);font-size:1rem;line-height:1.7">Schedule a consultation with our team of experts. We offer flexible scheduling to fit your busy lifestyle.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center","width":"40%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:40%">
			<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"12px","color":"var:preset|color|border","width":"1px"}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-border-color has-background-background-color has-background" style="border-color:var(--wp--preset--color--border);border-width:1px;border-radius:12px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
				<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.9rem"}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="font-size:0.9rem">Available Monday - Saturday</p>
				<!-- /wp:paragraph -->

				<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.75rem","fontWeight":"700"}},"textColor":"primary","fontFamily":"heading"} -->
				<h3 class="wp-block-heading has-text-align-center has-primary-color has-text-color has-heading-font-family" style="font-size:1.75rem;font-weight:700">(555) 123-4567</h3>
				<!-- /wp:heading -->

				<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
				<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)">
					<!-- wp:button {"backgroundColor":"accent","textColor":"background","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600","fontSize":"1rem"},"spacing":{"padding":{"top":"0.85rem","bottom":"0.85rem","left":"2rem","right":"2rem"}}},"fontFamily":"body","width":100} -->
					<div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-background-color has-accent-background-color has-text-color has-background has-body-font-family wp-element-button" href="/contact/" style="border-radius:6px;padding-top:0.85rem;padding-right:2rem;padding-bottom:0.85rem;padding-left:2rem;font-size:1rem;font-weight:600">Book Now</a></div>
					<!-- /wp:button -->
				</div>
				<!-- /wp:buttons -->

				<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.8rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-top:var(--wp--preset--spacing--20);font-size:0.8rem">Free consultation - No obligation</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
