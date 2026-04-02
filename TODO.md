# Xusmo AI Agent/Engine — Bug Tracker

## Fixed (deployed to production)

- [x] BUG 1: Hero content sync — `updateDesignDocumentHero()` tries ALL matching prop names
- [x] BUG 2: Page creation — `CREATE_PAGE` action
- [x] BUG 3: Theme colors rendering — `.page` uses `var(--bg)` for background
- [x] BUG 4+10: Response truncation — Gemini Pro + `salvageJSON()`
- [x] BUG 5+6: Send button conflict — StudioAgent hidden on AI Designer
- [x] BUG 7: JSON leak — `sanitizeReply()` strips raw action data
- [x] BUG 8: AI hallucination — anti-hallucination prompt rules
- [x] BUG 9: Chat persistence — localStorage (last 50 messages)
- [x] BUG 11: Page selector — defaults to "home"
- [x] BUG 12-14: Empty sections — `getDefaultProps()` for 15+ component types
- [x] BUG 15: Unknown action — all 12 action types implemented
- [x] BUG 16: Progress indicator — status messages at 3s, 15s, 40s during long operations
- [x] BUG 17: Geo-relevant images — image keywords now include business location
- [x] BUG 18: Navbar hamburger on desktop — CSS fix: `@media (min-width: 769px)` forces full nav
- [x] BUG 19: Hero black space on mobile — CSS fix: `min-height: auto` on mobile, variant-specific minimums
- [x] BUG 20: Empty location in SEO — `stripEmptyLocation()` removes "in ." patterns from all text
- [x] BUG 21: Missing pages in dropdown — merged DB + designDocument pages, home first
- [x] BUG 22: Trust badges stock photos — prompt + post-processing forces placehold.co for logos
- [x] BUG 23: Navbar logo stock photo — `enforceConsistency()` replaces URL logos with text + initials
- [x] BUG 24: Missing secondary CTA — prompt rule: hero MUST include `cta` + `ctaSecondary`
- [x] BUG 25: OG images — auto-set from hero/page images during generation
- [x] BUG 26: Testimonials 4 stars — prompt + post-processing forces all ratings to 5
- [x] BUG 27: Footer nav mismatch — `enforceConsistency()` rebuilds footer links from actual pages

## Future Enhancements

## TODO (New Bugs — Found by QA Testing Agent, 2025-04-02)

- [ ] BUG 16: **AI response latency** — Homepage generation took 70+ seconds with no progress indicator. User has no feedback during long waits. Add a loading progress bar or step-by-step status messages (e.g. "Generating hero...", "Adding sections...").

- [ ] - [ ] BUG 17: **Irrelevant about-section image** — The about-section image on the homepage shows people fishing from a bridge in Istanbul, Turkey — not Ontario, Canada. Image selection must be geo-relevant and contextually accurate. Fix image search query to include location context.

- [ ] - [ ] BUG 18: **Navbar shows hamburger menu on desktop** — On Services, Contact, About, and Gallery pages (desktop viewport), the navbar renders a hamburger/mobile menu icon instead of full horizontal navigation links. This is a critical UI regression.

- [ ] - [ ] BUG 19: **Large black blank space in hero section (mobile/tablet)** — On mobile and tablet viewports, there is a large empty black area above the hero image/content. The hero section has incorrect height or padding at smaller breakpoints.

- [ ] - [ ] BUG 20: **SEO meta description has empty location placeholder** — On Home and Services pages, the meta description contains "in ." with a blank location variable (e.g. "Ontario Fishing Adventures in ."). The location/city variable is not being populated. All pages must be checked and the placeholder resolved.

- [ ] - [ ] BUG 21: **Missing pages in AI Designer page dropdown** — The AI Designer page selector only shows: home, about, contact, gallery, services. Pages FAQ, Blog, Service-Areas, and Testimonials are missing from the dropdown. Users cannot edit these pages via AI Designer.

- [ ] - [ ] BUG 22: **Trust badges show non-branded placeholder images** — The "As Seen On & Proudly Affiliated With" trust-badges section shows grayscale generic ocean/coastal photos instead of real partner logos or relevant brand badges. This looks unprofessional and misleading.

- [ ] - [ ] BUG 23: **Logo in navbar is a stock photo, not a brand logo** — The navbar logo displays a fishing boat stock photo image instead of a text logo or branded SVG. This should default to business name text or an auto-generated logo placeholder.

- [ ] - [ ] BUG 24: **No second CTA button in hero** — The prompt asked for "CTA buttons" (plural) in the hero section but only one button ("Explore Our Packages") was generated. Hero should have two CTAs (e.g. primary + secondary "Contact Us").

- [ ] - [ ] BUG 25: **OG/Social preview image missing on all pages** — None of the SEO pages have a social preview (OG image) set. The AI should auto-generate or assign a relevant OG image per page when building the site.

- [ ] - [ ] BUG 26: **Testimonials show 4 stars instead of 5** — At least one testimonial card (Mark Reynolds) displays only 4 gold stars out of 5. Default generated testimonials should show 5-star ratings unless intentionally set otherwise.

- [ ] - [ ] BUG 27: **Footer nav links don't match site pages** — The footer shows: Home, Adventures, Gallery, About Us, Contact — but the site has pages named "Services" (not "Adventures") and missing FAQ, Blog, Testimonials. Footer links should auto-sync with actual page structure.

- [ ] ## Retest Results (QA Agent — 2025-04-02, Round 2)

- [ ] **BUG 24 — PARTIALLY FIXED**: Two CTA buttons now appear in hero ("Explore Our Packages" + "Inquire Now"). Button label differs from requested ("Book a Free Consultation") — minor, acceptable.

- [ ] **BUG 17 — REGRESSED (WORSE)**: About-section image replaced with a Soviet-era bus station photo (Cyrillic "АВТОВОКЗАЛ" text visible). Image is now MORE irrelevant than before (was Istanbul bridge fishing, now is a bus station building). Image search/selection algorithm needs urgent fix for geo-contextual relevance.

- [ ] **BUG 23 — NOT FIXED**: Navbar logo still shows a stock photo (changed from fishing boat to a building/signage image). Not a brand logo. The logo image prop is still pointing to stock photos instead of text-based brand identity.

- [ ] **BUG 26 — NOT FIXED**: At least one testimonial card still shows 4 stars instead of 5. The star count property is not being updated by the AI fix request.

- [ ] **BUG 27 — NOT FIXED**: Footer nav links still show "Adventures" instead of "Services" and still missing FAQ, Blog, Testimonials pages. Footer links are not auto-syncing with actual page structure.

- [ ] - [ ] BUG 28: **Image search returns geo/context irrelevant results** — The Pexels/stock image search is failing to respect location context ("Ontario, Canada") and thematic context ("fishing"). Results include: Istanbul bridge scene, Soviet bus station building. Root cause: image search queries are not constructed with enough specificity (e.g. "Ontario lake fishing" vs generic keyword). Fix: build image search queries from `[niche] [location] [section-type]` pattern.

- [ ] - [ ] BUG 29: **Footer large black empty space** — After the AI fix attempt on BUG 27, the footer now has a large black empty area above the social icons and below the newsletter section. The footer background or height is misconfigured. Footer content (nav links, business name) is invisible against the black background.

- [ ] - [ ] BUG 30: **AI cannot fix star rating count** — When asked to "fix all testimonials to show 5 stars", the AI reports the action but the star count does not change. The testimonials `rating` or `stars` prop is likely not being mapped or updated correctly by the UPDATE_SECTION action.

- [ ] E-commerce Agent — WooCommerce product creation, checkout, cart (postponed)
- [ ] Vibe Coding Agent — Generate clean React + Tailwind export alongside WordPress
- [ ] WordPress theme file generation — PHP templates, child themes, ACF fields
- [ ] Multi-user real-time editing — WebSocket-based collaboration
- [ ] AI image generation — Flux/Leonardo for custom AI-generated images (beyond Pexels stock)
