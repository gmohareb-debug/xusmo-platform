<?php
/**
 * Title: Portfolio Grid
 * Slug: xusmo/portfolio-grid
 * Categories: xusmo-media
 * Description: A portfolio showcase grid with project images, titles, and category labels.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"surface","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Our Work</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">Explore our recent projects and see what we can do.</p>
	<!-- /wp:paragraph -->

	<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|30"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:group {"style":{"spacing":{"blockGap":"0"},"border":{"radius":"12px"},"overflow":"hidden"},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-background-background-color has-background" style="border-radius:12px">
				<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px","bottomLeft":"0px","bottomRight":"0px"}}}} -->
				<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Project 1" style="border-top-left-radius:12px;border-top-right-radius:12px;border-bottom-left-radius:0px;border-bottom-right-radius:0px"/></figure>
				<!-- /wp:image -->

				<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"},"left":{"color":"var:preset|color|border","width":"1px"},"right":{"color":"var:preset|color|border","width":"1px"},"radius":{"bottomLeft":"12px","bottomRight":"12px"}}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;border-left-color:var(--wp--preset--color--border);border-left-width:1px;border-right-color:var(--wp--preset--color--border);border-right-width:1px;border-bottom-left-radius:12px;border-bottom-right-radius:12px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem","fontWeight":"500","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"primary","fontFamily":"body"} -->
					<p class="has-primary-color has-text-color has-body-font-family" style="font-size:0.8rem;font-weight:500;letter-spacing:0.05em;text-transform:uppercase">Web Design</p>
					<!-- /wp:paragraph -->

					<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"heading"} -->
					<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1.1rem;font-weight:600">Brand Refresh for Acme Co.</h3>
					<!-- /wp:heading -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:group {"style":{"spacing":{"blockGap":"0"},"border":{"radius":"12px"},"overflow":"hidden"},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-background-background-color has-background" style="border-radius:12px">
				<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px","bottomLeft":"0px","bottomRight":"0px"}}}} -->
				<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Project 2" style="border-top-left-radius:12px;border-top-right-radius:12px;border-bottom-left-radius:0px;border-bottom-right-radius:0px"/></figure>
				<!-- /wp:image -->

				<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"},"left":{"color":"var:preset|color|border","width":"1px"},"right":{"color":"var:preset|color|border","width":"1px"},"radius":{"bottomLeft":"12px","bottomRight":"12px"}}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;border-left-color:var(--wp--preset--color--border);border-left-width:1px;border-right-color:var(--wp--preset--color--border);border-right-width:1px;border-bottom-left-radius:12px;border-bottom-right-radius:12px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem","fontWeight":"500","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"primary","fontFamily":"body"} -->
					<p class="has-primary-color has-text-color has-body-font-family" style="font-size:0.8rem;font-weight:500;letter-spacing:0.05em;text-transform:uppercase">Marketing</p>
					<!-- /wp:paragraph -->

					<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"heading"} -->
					<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1.1rem;font-weight:600">Digital Campaign for StartUp Inc.</h3>
					<!-- /wp:heading -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:group {"style":{"spacing":{"blockGap":"0"},"border":{"radius":"12px"},"overflow":"hidden"},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-background-background-color has-background" style="border-radius:12px">
				<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px","bottomLeft":"0px","bottomRight":"0px"}}}} -->
				<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Project 3" style="border-top-left-radius:12px;border-top-right-radius:12px;border-bottom-left-radius:0px;border-bottom-right-radius:0px"/></figure>
				<!-- /wp:image -->

				<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"},"left":{"color":"var:preset|color|border","width":"1px"},"right":{"color":"var:preset|color|border","width":"1px"},"radius":{"bottomLeft":"12px","bottomRight":"12px"}}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;border-left-color:var(--wp--preset--color--border);border-left-width:1px;border-right-color:var(--wp--preset--color--border);border-right-width:1px;border-bottom-left-radius:12px;border-bottom-right-radius:12px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem","fontWeight":"500","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"primary","fontFamily":"body"} -->
					<p class="has-primary-color has-text-color has-body-font-family" style="font-size:0.8rem;font-weight:500;letter-spacing:0.05em;text-transform:uppercase">Branding</p>
					<!-- /wp:paragraph -->

					<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"heading"} -->
					<h3 class="wp-block-heading has-text-color has-text-color has-heading-font-family" style="font-size:1.1rem;font-weight:600">Visual Identity for LocalBiz</h3>
					<!-- /wp:heading -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
