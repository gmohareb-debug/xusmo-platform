<?php
/**
 * Title: Map Embed
 * Slug: xusmo/map-embed
 * Categories: xusmo-contact
 * Description: A map embed section with an address sidebar for displaying business location.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"surface","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Find Us</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">Visit our location or get directions below.</p>
	<!-- /wp:paragraph -->

	<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center","width":"60%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%">
			<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}},"border":{"radius":"12px","color":"var:preset|color|border","width":"1px"},"dimensions":{"minHeight":"400px"}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-border-color has-background-background-color has-background" style="border-color:var(--wp--preset--color--border);border-width:1px;border-radius:12px;min-height:400px;padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
				<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.5rem"}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="font-size:1.5rem">&#x1F4CD;</p>
				<!-- /wp:paragraph -->
				<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="font-size:0.95rem">Map location available on the live site.</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center","width":"40%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:40%">
			<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"constrained"}} -->
			<div class="wp-block-group">
				<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"}},"textColor":"text","fontFamily":"heading"} -->
				<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1.5rem;font-weight:600">Our Location</h3>
				<!-- /wp:heading -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.95rem","lineHeight":"1.8"}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.95rem;line-height:1.8">123 Main Street, Suite 100<br>City, State 12345<br>United States</p>
				<!-- /wp:paragraph -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.95rem","lineHeight":"1.8"}},"textColor":"text-muted","fontFamily":"body"} -->
				<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.95rem;line-height:1.8"><strong>Phone:</strong> (555) 123-4567<br><strong>Email:</strong> hello@example.com</p>
				<!-- /wp:paragraph -->

				<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
				<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)">
					<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600"}},"fontFamily":"body"} -->
					<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background has-body-font-family wp-element-button" style="border-radius:6px;font-weight:600" href="https://maps.google.com" target="_blank" rel="noopener">Get Directions</a></div>
					<!-- /wp:button -->
				</div>
				<!-- /wp:buttons -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
