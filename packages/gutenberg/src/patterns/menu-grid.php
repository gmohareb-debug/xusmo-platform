<?php
/**
 * Title: Menu Grid
 * Slug: xusmo/menu-grid
 * Categories: xusmo-content, xusmo-commerce
 * Description: A restaurant or service menu grid with item names, descriptions, and prices.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"1000px"}} -->
<div class="wp-block-group has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"}},"textColor":"text","fontFamily":"heading"} -->
	<h2 class="wp-block-heading has-text-align-center has-text-color has-text-color has-heading-font-family" style="font-size:2.25rem;font-weight:700">Our Menu</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"text-muted","fontFamily":"body"} -->
	<p class="has-text-align-center has-text-muted-color has-text-color has-body-font-family" style="margin-bottom:var(--wp--preset--spacing--60);font-size:1.1rem">Crafted with care using the finest ingredients.</p>
	<!-- /wp:paragraph -->

	<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.35rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|30"}}},"textColor":"primary","fontFamily":"heading"} -->
			<h3 class="wp-block-heading has-primary-color has-text-color has-heading-font-family" style="margin-bottom:var(--wp--preset--spacing--30);font-size:1.35rem;font-weight:600">Starters</h3>
			<!-- /wp:heading -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Garden Salad</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">Fresh seasonal greens with house dressing</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$12</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20","top":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Soup of the Day</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">Chef's daily selection served with bread</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$10</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20","top":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Bruschetta</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">Toasted bread with tomato, basil, and olive oil</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$14</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.35rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|30"}}},"textColor":"primary","fontFamily":"heading"} -->
			<h3 class="wp-block-heading has-primary-color has-text-color has-heading-font-family" style="margin-bottom:var(--wp--preset--spacing--30);font-size:1.35rem;font-weight:600">Mains</h3>
			<!-- /wp:heading -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Grilled Salmon</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">Atlantic salmon with seasonal vegetables</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$28</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20","top":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"},"border":{"bottom":{"color":"var:preset|color|border","width":"1px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--border);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Ribeye Steak</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">12oz premium cut with roasted potatoes</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$36</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->

			<!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20","top":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|10"}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"text","fontFamily":"body"} -->
					<p class="has-text-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">Pasta Primavera</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"}},"textColor":"text-muted","fontFamily":"body"} -->
					<p class="has-text-muted-color has-text-color has-body-font-family" style="font-size:0.85rem">Fresh pasta with garden vegetables in cream sauce</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"textColor":"primary","fontFamily":"body"} -->
				<p class="has-primary-color has-text-color has-body-font-family" style="font-size:1rem;font-weight:600">$22</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
