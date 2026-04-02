<?php
/**
 * Title: Gallery Masonry
 * Slug: xusmo/gallery-masonry
 * Categories: xusmo-media
 * Description: A masonry-style image gallery section with a heading and varied column layout.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Our Gallery</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">A showcase of our finest work and projects.</p>
	<!-- /wp:paragraph -->

	<!-- wp:gallery {"columns":3,"linkTo":"none","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|20","top":"var:preset|spacing|20"}}}} -->
	<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 1" style="border-radius:8px"/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 2" style="border-radius:8px"/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 3" style="border-radius:8px"/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 4" style="border-radius:8px"/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 5" style="border-radius:8px"/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"8px"}}} -->
		<figure class="wp-block-image size-large has-custom-border"><img src="" alt="Gallery image 6" style="border-radius:8px"/></figure>
		<!-- /wp:image -->
	</figure>
	<!-- /wp:gallery -->
</div>
<!-- /wp:group -->
