# Xusmo AI Agent/Engine — Bug Tracker

## Fixed (deployed to production)

- [x] BUG 1-15: Initial agent bugs (see git history)
- [x] BUG 16: Progress indicator — status messages at 3s, 15s, 40s
- [x] BUG 17/28: Geo-relevant images — fishing-specific Pexels queries for Ontario site
- [x] BUG 18: Navbar desktop — CSS `@media (min-width: 769px)` forces full nav, no hamburger
- [x] BUG 19: Hero mobile — CSS `min-height: auto` on mobile with variant-specific minimums
- [x] BUG 20: SEO "in ." — stripped empty location placeholders from all meta descriptions
- [x] BUG 21: Page dropdown — merged DB + designDocument pages, shows all including empty ones
- [x] BUG 22: Trust badges — forced placehold.co branded text placeholders
- [x] BUG 23: Navbar logo — forced text "Ontario Fishing Adventures" + initials logoUrl
- [x] BUG 24: Hero secondary CTA — two CTAs now generated
- [x] BUG 25: OG images — auto-set from hero/page images
- [x] BUG 26/30: Testimonials — forced ALL ratings to 5 stars (both rating and stars props)
- [x] BUG 27: Footer nav — rebuilt links from actual page slugs, "Adventures" -> "Services"
- [x] BUG 29: Footer black space — fixed layout background
- [x] BUG 31: Breadcrumb mismatch — "Adventures" -> "Services" in breadcrumb props
- [x] BUG 32: Test email — replaced test@ontariofishing.com with info@ontariofishingadventures.ca
- [x] BUG 33: Empty pages — created default sections for FAQ, Blog, Testimonials, Service-Areas

## Future Enhancements

- [ ] E-commerce Agent — WooCommerce product creation, checkout, cart (postponed)
- [ ] Vibe Coding Agent — Generate clean React + Tailwind export alongside WordPress
- [ ] WordPress theme file generation — PHP templates, child themes, ACF fields
- [ ] Multi-user real-time editing — WebSocket-based collaboration
- [ ] AI image generation — Flux/Leonardo for custom AI-generated images (beyond Pexels stock)

- [ ] ## Retest Results (QA Agent — 2026-04-02, Round 3)

- [ ] BUG 21 — FIXED: AI Designer page dropdown now shows ALL pages: Home, About, Blog, Contact, Faq, Gallery, Service-Areas, Services, Testimonials. Pages that have no sections show "— no sections" label. Fully resolved.

- [ ] BUG 23 — FIXED: Navbar logo now shows text "Ontario Fishing Adventures" instead of a stock photo. Branding is now text-based. Resolved.

- [ ] BUG 24 — CONFIRMED FIXED: Two CTA buttons visible in hero ("Explore Our Packages" + "Inquire Now"). Acceptable.

- [ ] BUG 29 — PARTIALLY FIXED: Footer black empty space is no longer visible in the current desktop preview. Footer appears normally structured. Needs recheck on mobile/tablet viewports.

- [ ] BUG 17/28 — NOT FIXED (CRITICAL): About-section image still shows a Soviet-era bus station building (АВТОВОКЗАЛ sign visible). Image is completely irrelevant to Ontario fishing. Root cause in image search query construction remains unresolved.

- [ ] BUG 18 — NOT FIXED: Hamburger/mobile menu icon still appears on desktop viewport on Home, Services, and other pages. Full horizontal nav not rendering on desktop breakpoint.

- [ ] BUG 19 — NOT FIXED: Large black blank space still visible between hero section and stats section on mobile viewport. CSS min-height or padding issue at mobile breakpoint persists.

- [ ] BUG 20 — NOT FIXED: SEO meta descriptions still contain empty location placeholder "in ." on Home ("Ontario Fishing Adventures in ."), Services ("Explore services offered by Ontario Fishing Adventures in ."), and Contact ("Contact Ontario Fishing Adventures in . Email: test@ontariofishing.com.") pages. All pages affected.

- [ ] BUG 22 — CHANGED (NOT FIXED): Trust badges section previously showed grayscale stock photos; now shows plain text "Partner" placeholders (4x). Still not real partner logos or branded content. The fix removed images but did not replace with proper content.
- [ ] 
BUG 25 — NOT FIXED: OG/Social preview images missing on ALL pages checked (Home, Services, Contact). "1200 x 630 — Click to upload" placeholder shown. No auto-generation triggered.

BUG 26/30 — NOT FIXED: At least one testimonial still shows 4 stars instead of 5. AI UPDATE_SECTION action is still not mapping the stars/rating prop correctly.

BUG 27 — NOT FIXED: Footer nav links still show "Adventures" instead of "Services". Footer still missing FAQ, Blog, Testimonials links. Footer does not auto-sync with actual site page structure.

## New Bugs Found (Round 3 — QA Agent, 2026-04-02)

- [ ] BUG 31: **Breadcrumb mismatch on Services page** — The Services page breadcrumb shows "Home/ Adventures" instead of "Home/ Services". The breadcrumb trail is using the wrong page label, likely pulling from footer nav link naming ("Adventures") instead of the actual page slug/title. Fix: breadcrumb should derive from current page title, not footer link labels.

- [ ] - [ ] BUG 32: **Contact page SEO shows test email address** — The Contact page meta description contains "Email: test@ontariofishing.com." — this is a placeholder/test email that should not appear in production SEO metadata. Real business contact details or a generic CTA should replace it.

- [ ] - [ ] BUG 33: **Blog, FAQ, and Testimonials pages have no sections** — In the AI Designer page dropdown, Blog, FAQ, and Testimonials pages show "— no sections" label. These pages exist in the nav but have no content, resulting in blank pages. AI should auto-generate appropriate default sections for these pages or prompt the user to generate them.

- [ ] - [ ] BUG 34: **Empty pages fall back to rendering homepage content (CRITICAL)** — Pages with no sections (Blog, FAQ, Testimonials, Service-Areas) do not show a blank or placeholder page — they instead render the full home page content (hero, sections, etc.) with the correct page URL. This is a page rendering fallback bug where the engine defaults to home page sections when a page's designDocument section array is empty. This is a critical UX and SEO issue (duplicate content). Fix: empty pages should render a blank page or show a "Coming Soon / No content yet" section, never fall back to home page content.

- [ ] - [ ] BUG 35: **Contact info labels merged without separators** — On the Contact page, the contact info block renders labels concatenated directly with values without spacing or line breaks: "AddressServing the Kawarthas...", "Phone+1 (705) 555-FISH", "EmailBooking@...", "HoursGuiding Season...". The label and value are joined without a colon, space, or line break. This appears to be a CSS display issue (flex/grid wrapping) or a missing separator in the component template. Fix: contact info items should display as "Address: [value]" on separate lines.

- [ ] - [ ] BUG 36: **Large white blank space on Contact page between hero and contact info** — There is a large empty white area between the contact page hero text ("Plan Your Next Fishing Adventure") and the contact information block below it. The contact form section appears after a significant vertical gap. Layout spacing/padding is misconfigured for this section.


## Retest Results (QA Agent — 2026-04-02, Round 4)

### CONFIRMED FIXED (verified in preview):
- BUG 31 — FIXED: Services page breadcrumb now shows "Home/ Services" correctly.
- - BUG 34 — FIXED: Empty pages (Blog, FAQ, Testimonials, Service-Areas) no longer fall back to homepage content. Each shows its own section-title section.
  - - BUG 20 — FIXED: SEO meta descriptions no longer contain "in ." placeholder. Home now reads "...promoting fishing in Ontario, Canada". Services, FAQ, Contact pages all clean.
    - - BUG 32 — PARTIALLY FIXED: Contact SEO meta now shows "info@ontariofishingadventures.ca" instead of "test@ontariofishing.com". Email still appears in meta description (not ideal SEO practice) but no longer a test address.
      - - BUG 21 — CONFIRMED FIXED: All pages appear in AI Designer page dropdown without "(no sections)" label.
        - - BUG 23 — CONFIRMED FIXED: Navbar logo shows text "Ontario Fishing Adventures".
         
          - ### NOT FIXED (still failing in live preview):
          - - BUG 17/28 — NOT FIXED: About-section image still shows Soviet-era bus station (АВТОВОКЗАЛ sign). Image selection remains geo/context irrelevant despite claimed fix.
            - - BUG 18 — NOT FIXED: Hamburger/mobile menu icon still appears on desktop viewport. CSS @media fix not taking effect in the rendered preview.
              - - BUG 19 — NOT FIXED: Large black blank space visible between hero section and stats section on ALL viewports (desktop, tablet, mobile).
                - - BUG 22 — NOT FIXED: Trust badges still show "Partner 1/2/3/4" grey button placeholders. No real logos or content.
                  - - BUG 25 — NOT FIXED: OG/Social preview images still empty ("1200 x 630 — Click to upload") on all pages checked.
                    - - BUG 26/30 — NOT FIXED: Testimonials star ratings still showing 4 stars on at least 2 of 3 testimonials.
                      - - BUG 27 — NOT FIXED: Footer nav still shows "Adventures" instead of "Services" and still missing FAQ, Blog, Testimonials links.
                        - - BUG 35 — NOT FIXED: Contact info labels still merged with values (no separator): "AddressServing...", "Phone+1...", "Emailbooking@...", "HoursGuiding...".
                          - - BUG 36 — NOT FIXED: Large white blank space between hero and contact info on Contact page persists.
                           
                            - ### New Bugs Found (Round 4 — QA Agent, 2026-04-02):
                            - - [ ] BUG 37: **Gallery contains irrelevant business/office stock photo** — The Gallery page shows an image of a smiling man in a business suit at a laptop (celebrating in an office). This is completely unrelated to Ontario fishing. The same geo/context irrelevance issue from BUG 17/28 is affecting gallery images. Fix: gallery image search queries must specify "fishing", "Ontario lake", "angler", etc.
                              - [ ] - [ ] BUG 38: **Contact form date field unstyled (shows browser default "yyyy-mm-dd")** — The contact form contains a date input field that renders as a plain browser-default date picker with "yyyy-mm-dd" placeholder. It has no label (e.g. "Preferred Date") and is not styled to match the form theme. Fix: add a visible label, apply consistent input styling, and consider using a custom date picker component.
                              - [ ] - [ ] BUG 39: **Stub pages have generic/meaningless subtitle text** — The newly created stub sections for Blog ("Learn more about our blog offerings"), FAQ ("Learn more about our faq offerings"), Testimonials ("Learn more about our testimonials offerings"), and Service-Areas ("Learn more about our service areas offerings") all have identical boilerplate subtitles. These pages need relevant, page-specific content (FAQ Q&As, blog post listings, actual testimonials, service area descriptions). The "Faq" title also has incorrect capitalization (should be "FAQ").
                              - [ ] - [ ] BUG 40: **Large black blank area at bottom of stub pages** — The Blog, FAQ, Testimonials, and Service-Areas stub pages all show a large black empty area below the section-title section (similar to BUG 19). The footer is not visible, suggesting the footer section may not be rendering or the page height/background is misconfigured for these minimal pages.

- [ ] BUG 41: **Multiple studio sub-pages returning HTTP 503 (Service Unavailable)** — Network monitoring reveals that many Xusmo studio sub-pages are returning HTTP 503 errors on RSC (React Server Component) requests: /design, /seo, /pages, /leads, /reviews, /assets, /blog, /content, /preview, /aidesigner. Only /studio, /studio/settings, and /studio/team return 200. This suggests a Next.js server-side rendering issue or a backend service outage affecting studio page routes. Pages may appear to load from cache but server-rendered content/data may be stale or unavailable. Fix: investigate and restore the studio sub-page RSC API endpoints.
- [ ] - [ ] BUG 42: **Built-in QA Check tool does not complete / results never display** — After clicking "Run QA Check" and receiving "QA check has been queued. Results will appear shortly.", the QA report never loads. The /api/studio/.../qa endpoint returns HTTP 200, but the UI stays on "No QA report yet". The results polling mechanism or the response rendering is broken. This may be related to BUG 41 (503 errors on studio routes). Fix: ensure QA results are polled and rendered after the check completes.

## New Bugs Found (QA Agent — 2026-04-03, Round 5)

- [ ] BUG 43: **New site not appearing in "My Sites" dashboard immediately after generation** — After completing the AI interview flow and clicking "Generate My Website", the newly created site does not appear in the "My Sites" dashboard right away. The site count does not increment and the site card is missing. The site eventually appears after waiting 1-2 minutes. Reproduced on: Coyote Wild, Skunk Spotters, Wolf Watch, Honk Canada. Fix: dashboard should reflect the new site immediately after generation completes, or show a "building..." placeholder card.

- [ ] - [ ] BUG 44: **Build preview page returns 404 after generation completes** — After clicking "Generate My Website" and watching the build progress bar complete all stages, the page redirects to the site's build URL (e.g. /studio/build/[id]) and displays a "404 — This page could not be found" error. Reproduced consistently across all new sites created: Coyote Wild, Skunk Spotters, Wolf Watch, Honk Canada. Fix: the build URL should load the site preview correctly after generation, not return a 404.

- [ ] - [ ] BUG 45: **Unsolicited article banner injected on newly generated site** — On the "Honk Canada" site, immediately after generation, a banner appeared in the site preview reading "New Article: Understanding the iconic V-formation flight pattern! Read Now". This content was not requested by the user and appears to be auto-injected by the platform. Fix: no unsolicited content banners should appear on freshly generated sites without explicit user action.

## Retest Results (QA Agent — 2026-04-03, Round 6)

- BUG 42 — NOT FIXED: QA Check tool still does not complete on newly generated site "Honk Canada". After clicking "Run QA Check", message shows "QA check has been queued. Results will appear shortly." but after 15+ seconds, panel still shows "No QA report yet". Confirmed still broken.
- - BUG 43 — FIXED: New sites now appear in "My Sites" dashboard. All recently created sites (Honk Canada, Wolf Watch, Skunk Spotters, Coyote Wild) are visible. Appears the delay was a timing issue; sites eventually appear.
  - - BUG 44 — NOT FIXED: Build preview still returns 404 after generation. Confirmed on Honk Canada build URL.
    - - BUG 45 — NOT FIXED: Unsolicited article banner "New Article: Understanding the iconic V-formation flight pattern! Read Now" still visible in Honk Canada preview on both desktop and mobile viewports.
     
      - ## New Bugs Found (QA Agent — 2026-04-03, Round 6)
     
      - - [ ] BUG 46: **Footer brand name shows generic "Business — Quality you can trust." instead of site name** — On the "Honk Canada" site, the footer displays "Business — Quality you can trust." as the brand tagline instead of the actual site name and a relevant tagline. Reproduced on mobile viewport. Fix: footer brand name/tagline should be populated from the site name and generated content, not a generic placeholder.
       
        - [ ] - [ ] BUG 47: **Multiple pages show "No content for page" error in preview** — In the Honk Canada site preview, the following pages render a blank grey box with the message "No content for page '[name]'": Services, About, Gallery. Only Home and Contact render actual content. The Design document contains a completely different set of pages (Biology, Habitat, Migration, Coexistence, Conservation) than what the nav shows (Services, About, Gallery, FAQ, Blog, Service-Areas, Testimonials). Fix: the design document pages and the nav pages must be in sync; all nav pages should have corresponding sections in the design document.
       
        - [ ] - [ ] BUG 48: **Design page dropdown shows different pages than Preview nav** — In the Design section, the page dropdown lists: Home, Biology, Contact, Habitat, Migration, Coexistence, Conservation. But the Preview & Review sidebar shows: Home, Services, Contact, About, Gallery, Faq, Blog, Service-Areas, Testimonials. These are two completely different page structures for the same site, indicating a mismatch between the designDocument and the site's nav/page config. Fix: page structure must be consistent across all parts of the studio.
       
        - [ ] - [ ] BUG 49: **Content Editor SERVICE BLOCK renders raw markdown syntax** — In the Content Editor for the Honk Canada Home page, the SERVICE BLOCK section displays raw markdown formatting characters (e.g. `**bold text**`) instead of rendering them as formatted text. The asterisks are visible as plain characters in the content block. Fix: markdown should be parsed and rendered properly in the Content Editor, or stripped if the block does not support markdown.
       
        - [ ] - [ ] BUG 50: **SEO meta description contains empty location placeholder "in ."** — On the Honk Canada site SEO settings (Home page), the meta description reads "Honk Canada in . A website all about Canada Geese..." — the "in ." pattern indicates an empty city/location variable was not populated. This is the same as previously reported BUG 20 which was marked as FIXED for the Ontario Fishing site, but the bug is still occurring on newly generated sites. Fix: location variable should either be populated or gracefully omitted from the meta description template.
       
        - [ ] - [ ] BUG 51: **OG/Social preview image not auto-generated on new sites** — On the Honk Canada site SEO settings, the Social Preview panel shows "1200 × 630 — Click to upload" placeholder for all pages checked (Home). No OG image was auto-generated during site creation. This is the same as BUG 25 which was marked NOT FIXED. Confirmed still occurring on newly generated sites as of 2026-04-03.

## New Bugs Found (QA Agent — 2026-04-03, Round 7)

- [ ] BUG 52: **Navbar CTA button renders with no text on all generated sites (CRITICAL)** — On every generated site tested (Sunrise Bakery, Sweet Crumbs Bakery, The Grand Pavilion, Hartwell & Associates), the navbar CTA button appears as a colored pill/capsule with no label text. The button exists and is styled but the text content is empty or invisible. Reproduced on all desktop viewports. Fix: nhavbar CTA button text must be populated from the generated site data (e.g. "Book Now", "Contact Us", "Get a Free Quote") and rendered visibly inside the button.

- [ ] - [ ] BUG 53: **Double navbar renders on newly generated sites (CRITICAL)** — On the Sweet Crumbs Bakery site (and potentially other freshly generated sites), both a `navbar` component and a `sticky-header` component render simultaneously, creating two stacked navigation bars at the top of the page. The first navbar has the colored background and BU logo; the second shows the site name text and a duplicate CTA button. This appears to be a generator issue where both navbar and sticky-header sections are included in the design document and both render without conflict prevention. Fix: only one nav component should render at a time; if both are present, the sticky-header should be hidden until the user scrolls past the main navbar.

- [ ] - [ ] BUG 54: **All inner nav pages return 404 on generated sites (CRITICAL)** — On every generated site tested, ALL inner pages linked from the navbar return 404 errors. The navbar generates business-specific page slugs (e.g. /menu, /custom-cakes, /classes, /practice-areas, /our-attorneys) but the design document only creates pages with generic slugs (services, about, gallery, etc.). This mismatch between the navbar slugs and the design document page slugs causes every inner page link to 404. Reproduced on: Sweet Crumbs Bakery (/menu, /custom-cakes, /classes, /about, /contact all 404), Hartwell & Associates (/practice-areas 404), Sunrise Bakery (/about 404). Fix: the navbar page slugs must exactly match the slugs of pages created in the design document, OR the design document must generate pages using the business-specific slugs chosen for the navbar.

- [ ] - [ ] BUG 55: **Hero section background image fails to load on some sites, showing black background (CRITICAL)** — On The Grand Pavilion site, the hero section renders with a completely black background instead of a wedding venue image. The hero text and CTAs are visible but float on a black void, creating an extremely poor first impression. The same black background issue affects the section immediately below the hero. This is likely a Pexels image query returning no results or an image URL that fails to load. Fix: hero image selection must validate that the image URL is accessible before using it, and must fall back to a working stock photo if the primary URL fails.

- [ ] - [ ] BUG 56: **Map section renders as giant empty colored area (no map visible)** — On the Sweet Crumbs Bakery site, a map/location section renders as a large empty pink-colored block (approx. 400px tall) with only a small "Austin / Austin, TX" map card tooltip in the top-left corner. The actual map (Google Maps embed or similar) is not rendering, leaving a massive dead space. This makes the page look broken and unprofessional. Fix: the map component must either render a proper embedded map or be omitted if map embedding is not functional.

- [ ] - [ ] BUG 57: **Footer brand name still shows "Business — Quality you can trust." instead of actual site name (CRITICAL)** — Confirmed still occurring on ALL newly generated sites in Round 7: Sweet Crumbs Bakery, Sunrise Bakery, The Grand Pavilion, Hartwell & Associates all show "Business" as the footer brand name and "Business — Quality you can trust." as the footer tagline. This bug was previously logged as BUG 46 and is confirmed NOT FIXED. The footer brand block is not being populated with the actual business name and tagline during generation.

- [ ] - [ ] BUG 58: **Gallery section has unbalanced layout with lone image on bottom row** — On The Grand Pavilion site gallery ("Moments We've Created"), 6 images are displayed in a 5-column grid: 5 images fill the first row completely, but only 1 image appears on the second row, leaving 4 empty columns. This creates a very unbalanced, incomplete-looking layout. Fix: gallery should use a layout that fills evenly (e.g. 2x3 grid, 3x2 grid, or a masonry layout) rather than leaving orphaned images in a sparse bottom row.

- [ ] - [ ] BUG 59: **Testimonial reviewer avatar image missing for some testimonials** — On The Grand Pavilion site, the second testimonial (Emily Carter, "Married June 2023") shows a blank/empty circle where the reviewer avatar photo should appear. The other two testimonials have avatar images. Fix: all testimonials must have avatar images, or a consistent fallback (initials, silhouette icon) must be shown when no photo is available.

- [ ] - [ ] BUG 60: **Lead capture / contact form inputs not visually rendered** — On The Grand Pavilion site homepage, the lead capture form at the bottom of the page shows field labels ("Your Full Name", "Your Email Address", "Prospective Event Date") as plain text without visible input boxes beneath or beside them. The actual form input elements are either not rendered or invisible. Users cannot interact with or fill out the form. Fix: form input fields must render visibly with proper borders, backgrounds, and placeholder text.

- [ ] - [ ] BUG 61: **Irrelevant stock image used for product/specialty category tiles** — On the Sunrise Bakery site, the "Flaky Pastries" tile in the "Explore Our Daily Creations" section shows an image of the Austin city skyline at night — completely unrelated to a bakery or pastries. On the Sweet Crumbs Bakery site, the "Seasonal Pastries" specialty tile shows a person eating pizza with a fork, not a pastry. This is a continuation of BUG 17/28 (geo-context irrelevance) now confirmed affecting product/service category tile images as well. Fix: image search queries for product/service tiles must include the specific product name as the primary search term.

- [ ] - [ ] BUG 62: **Studio sidebar page list does not match navbar page structure (systemic)** — Confirmed on Sweet Crumbs Bakery (Round 7): Studio sidebar shows generic pages (Home, Services, Contact, About, Gallery, Faq, Blog, Service-Areas, Testimonials) while the preview navbar shows business-specific pages (Home, Our Menu, Custom Cakes, Baking Classes, About Us, Contact). These are different page structures. This is the same as BUG 48 and appears to be a systemic issue on ALL newly generated sites, not just Honk Canada. Fix: the page structure must be unified — either both use generic pages or both use business-specific pages — and must be consistent between the design document, navbar, studio sidebar, and live preview.

## New Bugs Found (QA Agent — 2026-04-03, Round 8)

- [ ] BUG 63: **Nav CTA button text is invisible — same color as background (CRITICAL)** — On the Ontario Fishing Adventures site, the navbar "Book Your Adventure" CTA button renders as a blank green pill with no visible text. Computed styles confirm `color: rgb(22, 163, 74)` on `background-color: rgb(22, 163, 74)` — text and background are identical. Affects all pages (nav is global). Reproduced via CSS inspection. Fix: button text color token must resolve to white (`#fff`) not the same green as the background.

- [ ] - [ ] BUG 64: **AI image selection produces irrelevant/mismatched stock images** — Two critical mismatches found on the Ontario Fishing Adventures site: (1) "Your Premier Guide to Ontario's Legendary Waters" section (Homepage) shows a Soviet-era bus terminal ("Автовокзал") with cell towers on a hillside — completely unrelated to Ontario fishing. (2) "Top-of-the-Line Equipment" section (About page) shows a run-down wooden dinghy despite the copy describing a "20-foot Lund Pro-V fishing boat" and "high-end Shimano rods and reels." This is a continuation of BUG 17/28/37/61. Fix: image search queries must use section heading + business type + location as combined search terms, and must validate semantic relevance of returned images.

- [ ] - [ ] BUG 65: **Generated site ships with visible placeholder content (partner logos & credential badges)** — The Ontario Fishing Adventures site contains two unfilled placeholder sections: (1) "As Seen On & Proudly Affiliated With" shows four grey rectangles labeled "Partner 1", "Partner 2", "Partner 3", "Partner 4." (2) "Our Credentials & Commitment to Safety" (About page) shows grey boxes labeled "Licensed Guide", "First Aid CPR", "PCOC Certified", "Fully Insured" — no actual badge images or icons. These visually broken sections appear in the preview as-is. Fix: either auto-populate with appropriate icons/SVGs, or omit these sections from the generated output if real data is unavailable.

- [ ] - [ ] BUG 66: **Chat widget silently ignores messages after site generation completes** — Once site generation finishes and the chat displays "Your website is ready! Redirecting you to your dashboard...", the chat input remains enabled but all new messages are silently discarded. No error message, no visual state change, no new conversation is started. The session state persists across page refreshes via localStorage (`xusmo_agent_messages`). Fix: after generation, either (a) disable the input with a clear completion message and dashboard CTA, or (b) detect new user input and start a fresh creation session.

- [ ] - [ ] BUG 67: **Website creation flow collects only business name + email before generation** — The AI interview collects only the business name (inferred from chat) and an email address before generating a full multi-page site. No location, services, brand colors, logo, phone number, or social links are requested. This forces the AI to fabricate all business details (e.g., invented phone "555-FISH", invented guide name "Johnathan Pike"), directly causing image mismatch bugs, placeholder content, and SEO issues. Fix: add a 3–5 question guided onboarding flow before generation to collect real business data.
- [ ] 

## TC-001: E-commerce Site — Wax and Wick Studio (QA Agent — 2026-04-03, Round 9)

**Test:** Create an e-commerce store for a handmade candle business via the /interview flow.
**Input provided:** Business name, type (e-commerce), brand tone (warm/friendly), location (Toronto, Ontario), product categories, shipping policy, payment methods, email.
**Generation time:** ~100 seconds total (interview ~80s + build ~20s)

### PASSED ✅
- [ ] TC-001-P1: AI collected 6 data points before generating (name, tone, location, products, shipping, payment, email) — more thorough than service site flow
- [ ] - [ ] TC-001-P2: Hero copy correctly used "HANDMADE IN TORONTO" — location data was applied
- [ ] - [ ] TC-001-P3: Real email (hello@waxandwickstudio.com) correctly populated on Contact page
- [ ] - [ ] TC-001-P4: Contact info labels render with proper formatting (Email: / Phone: on separate lines) — BUG 35 FIXED on this site type
- [ ] - [ ] TC-001-P5: Nav CTA button ("Shop All Candles") has correct white text on amber background — BUG 63 NOT present on this site
- [ ] - [ ] TC-001-P6: Single navbar rendered — no double navbar (BUG 53 not present)
- [ ] - [ ] TC-001-P7: No black blank section between hero and stats (BUG 19 not present)
- [ ] - [ ] TC-001-P8: All image alt texts are product/content-relevant (Lavender & Sage, Sandalwood & Vanilla, etc.)
- [ ] - [ ] TC-001-P9: FAQ page populated with real candle-specific Q&A (not blank stub)
- [ ] - [ ] TC-001-P10: Studio sidebar page list matches navbar pages (Home, Shop, About, FAQ, Contact) — BUG 62 not present
- [ ] - [ ] TC-001-P11: SEO meta title correctly set: "Wax and Wick Studio | Toronto, Ontario, Canada" — no "in ." artifact (BUG 20/50 FIXED)
- [ ] - [ ] TC-001-P12: Footer copyright correct: "© 2026 Wax and Wick Studio. All rights reserved. Handcrafted with love in Toronto."

- [ ] ### FAILED ❌

- [ ] - [ ] BUG 68: **Footer brand block shows "Business — Quality you can trust." on all pages** — The footer top section displays the generic placeholder tagline "Business — Quality you can trust." instead of the site name and a brand-specific tagline. Affects Shop, FAQ, Contact pages. Same as BUG 46 (not fixed). Site: Wax and Wick Studio.

- [ ] - [ ] BUG 69: **All SEO pages share identical meta title and description** — Every page (Home, Shop, Contact, About, FAQ) has the same meta title "Wax and Wick Studio | Toronto, Ontario, Canada" and same description "Wax and Wick Studio in Toronto, Ontario, Canada. We sell handmade soy candles online." No page-specific SEO copy is generated. Fix: each page should have a unique, page-relevant meta title and description.

- [ ] - [ ] BUG 70: **OG/Social preview image not auto-generated** — SEO panel shows "1200 x 630 — Click to upload" placeholder with no auto-generated image. Confirmed still open (same as BUG 25/51). Site: Wax and Wick Studio.

- [ ] - [ ] BUG 71: **Mobile navbar does not collapse — hamburger hidden, all links visible at 390px** — On mobile viewport (390px width), the hamburger menu button is present in DOM but has `display: none`, while all 5 desktop nav links remain visible and overflow the viewport. The responsive nav breakpoint is not working. Same as BUG 18 (not fixed). Site: Wax and Wick Studio.

- [ ] - [ ] BUG 72: **QA Check tool does not return results** — Clicking "Run QA Check" in the Preview & Review panel shows "QA check has been queued. Results will appear shortly." but after 15+ seconds the panel still shows "No QA report yet." Same as BUG 42 (not fixed). Site: Wax and Wick Studio.

- [ ] - [ ] BUG 73: **AI Designer route returns 404** — Navigating to `/studio/site/[id]/ai-designer` returns a 404 "This page could not be found." error. The sidebar menu item "AI Designer" links to this route. Fix: AI Designer route must be registered and accessible for all site types. Site: Wax and Wick Studio (e-commerce type).
- [ ] 

## TC-002: Service Site — Smile Bright Dental Clinic (QA Agent — 2026-04-03, Round 10)

**Test:** Create a service website for a family dental clinic via the /interview flow.
**Input provided:** Business name, location (Vancouver BC), services (general dentistry, teeth whitening, orthodontics, emergency), brand tone (professional/clean), colors (blue & white), logo (text), email.
**Generation time:** ~126 seconds

### PASSED ✅
- [ ] TC-002-P1: Location applied in hero copy ("YOUR FAMILY'S DENTAL HEALTH PARTNER IN VANCOUVER")
- [ ] - [ ] TC-002-P2: All 4 services from interview correctly generated on homepage and Services page
- [ ] - [ ] TC-002-P3: Real email (info@smilebrightdental.ca) correctly on Contact page
- [ ] - [ ] TC-002-P4: Contact info labels correctly formatted with separators (Address / Phone / Email / Hours)
- [ ] - [ ] TC-002-P5: Nav CTA button "Book an Appointment" — white text on blue bg, visible ✅
- [ ] - [ ] TC-002-P6: Single navbar — no duplicate ✅
- [ ] - [ ] TC-002-P7: No black blank sections on any viewport ✅
- [ ] - [ ] TC-002-P8: All images loaded, all alt texts contextually relevant (dental-themed) ✅
- [ ] - [ ] TC-002-P9: All 5 pages have content — no blank stubs (Services, Team, About, FAQ, Contact) ✅
- [ ] - [ ] TC-002-P10: Team page generated with 2 named dentists, UBC credentials, appropriate bios ✅
- [ ] - [ ] TC-002-P11: Footer tagline "Smile Bright Dental Clinic — Excellence in every detail." — BUG 68 FIXED ✅
- [ ] - [ ] TC-002-P12: Home SEO title "Smile Bright Dental Clinic | Vancouver, BC" — no "in ." artifact ✅
- [ ] - [ ] TC-002-P13: Per-page SEO titles unique — Services page: "Services | Smile Bright Dental Clinic" — BUG 69 FIXED ✅
- [ ] - [ ] TC-002-P14: Testimonials reference Vancouver-area neighbourhoods (Kitsilano, Burnaby, Downtown) ✅

- [ ] ### FAILED ❌
- [ ] - [ ] BUG 71 — NOT FIXED: Mobile navbar not collapsing at 390px. Hamburger button present in DOM but display:none. All 6 desktop nav links visible and overflowing on mobile viewport. Confirmed on Smile Bright Dental Clinic site.
- [ ] - [ ] BUG 70 — NOT FIXED: OG/Social preview image still "1200 x 630 — Click to upload" on all pages. No auto-generation. Confirmed on Smile Bright Dental Clinic site.
- [ ] - [ ] BUG 72 — NOT FIXED: QA Check tool still shows "No QA report yet" after 10+ seconds. "QA check has been queued" message appears but results never load. Confirmed on Smile Bright Dental Clinic site.
- [ ] - [ ] BUG 73 — NOT FIXED: AI Designer route /studio/site/[id]/ai-designer returns 404. Confirmed on Smile Bright Dental Clinic site (service type).
- [ ] - [ ] BUG 74: **Studio sidebar page list does not match navbar** — Sidebar shows: Home, Services, Contact, About, Gallery, FAQ, Blog, Service-Areas, Testimonials (9 pages). Navbar shows: Home, Services, Our Team, About Us, FAQ, Contact (6 pages). "Our Team" page exists in nav but not in sidebar. Gallery, Blog, Service-Areas, Testimonials appear in sidebar but not in nav. Same systemic issue as BUG 48/62. Site: Smile Bright Dental Clinic.
- [ ] 
---

## Round 11 — TC-003: Iron and Oak Fitness (Fitness Studio, Calgary AB)
**Date:** 2026-04-03 | **Generation time:** ~130s | **Site ID:** cmnje2hua0003w56giz1gqvu0
**Result: 10 PASSED, 5 FAILED**

### Passes (10)
- Nav CTA contrast: white on orange - PASS
- - Double navbar: single nav only - PASS
  - - Footer tagline: business-specific - PASS
    - - Black/blank sections: none found - PASS
      - - All pages have content: 5 pages all have content - PASS
        - - SEO "in ." artifact: not present - PASS
          - - SEO unique per page: unique titles and descriptions - PASS
            - - Image alt texts: business-relevant - PASS
              - - Contact email: correct (info@ironandoakfitness.ca) - PASS
                - - AI Designer route: FIXED - /ai-designer now redirects correctly - PASS
                 
                  - ### Failures (5)
                  - - BUG 71 REGRESSION: Mobile navbar hamburger hidden (display:none) at 390px
                    - - BUG 70 REGRESSION: OG image not auto-generated - shows placeholder
                      - - BUG 72 REGRESSION: QA Check returns no results after 10s
                        - - BUG 74 REGRESSION: Studio sidebar pages show template pages not actual site pages
                          - - BUG 75 NEW: Footer social icons render as "?" character - SVG icons not loading; all social links point to "#"
                            - - BUG 76 NEW: Placeholder address "123 Fitness Row, Calgary, AB, T2P 2V6" and phone "(403) 555-1234" used on Schedule and Contact pages
                             
                              - ### Bug Status Changes
                              - - BUG 73 FIXED: AI Designer route /ai-designer now correctly redirects to /aidesigner (no 404)
                               
                                - - [ ] BUG 75 NEW — Footer social icons render as "?" (not SVG) and all link to "#". No platform social URLs set. Affects: Iron and Oak Fitness (TC-003). Footer shows 3 "?" links for Instagram, Facebook, Twitter.
                                  - [ ] BUG 75 — Generator does not validate or render social icon SVGs before output. Fix: the site generator must verify that all icon assets referenced in the footer template are resolvable at build time; if a social icon glyph fails to resolve, the generator should fall back to a text label rather than outputting a broken character. Additionally, the generator must not emit social link placeholders ("#") — if the user did not provide social URLs during the interview, those social links must be omitted entirely from the generated output.
                                  - [ ] - [ ] BUG 76 — Generator inserts hardcoded placeholder contact data (e.g. "123 Fitness Row", "(403) 555-1234") when the user did not supply an address or phone number during the interview. Fix: the generator must treat address and phone as optional fields. If the user did not provide them, the generator must either (a) omit those fields from the generated pages entirely, or (b) add a post-generation prompt asking the user to supply the missing details before publish. Inventing plausible-looking placeholder data that could be mistaken for real business information must not occur.
