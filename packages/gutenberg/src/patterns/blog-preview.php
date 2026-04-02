<?php
/**
 * Title: Blog Preview
 * Slug: xusmo/blog-preview
 * Categories: xusmo-content
 * Description: A blog preview section showing the latest posts in a card grid layout.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"surface","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Latest from Our Blog</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">Stay up to date with our news and insights.</p>
	<!-- /wp:paragraph -->

	<!-- wp:query {"queryId":1,"query":{"perPage":3,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
	<div class="wp-block-query">
		<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
			<!-- wp:group {"style":{"spacing":{"blockGap":"0"},"border":{"radius":"12px","color":"var:preset|color|border","width":"1px"},"overflow":"hidden"},"backgroundColor":"background","layout":{"type":"constrained"}} -->
			<div class="wp-block-group has-border-color has-background-background-color has-background" style="border-color:var(--wp--preset--color--border);border-width:1px;border-radius:12px">
				<!-- wp:post-featured-image {"isLink":true,"style":{"spacing":{"margin":{"bottom":"0"}}}} /-->

				<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
					<!-- wp:post-date {"style":{"typography":{"fontSize":"0.8rem"}},"textColor":"text-muted","fontFamily":"body"} /-->

					<!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600","lineHeight":"1.4"},"elements":{"link":{"color":{"text":"var:preset|color|text"}}}},"fontFamily":"heading"} /-->

					<!-- wp:post-excerpt {"moreText":"Read More","excerptLength":18,"style":{"typography":{"fontSize":"0.9rem"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"text-muted","fontFamily":"body"} /-->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		<!-- /wp:post-template -->
	</div>
	<!-- /wp:query -->

	<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
	<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
		<!-- wp:button {"textColor":"primary","className":"is-style-outline","style":{"border":{"radius":"6px"},"typography":{"fontWeight":"600"}},"fontFamily":"body"} -->
		<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-primary-color has-text-color wp-element-button" style="border-radius:6px;font-weight:600" href="/blog/">View All Posts</a></div>
		<!-- /wp:button -->
	</div>
	<!-- /wp:buttons -->
</div>
<!-- /wp:group -->
