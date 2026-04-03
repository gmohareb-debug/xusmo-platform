# Test Rounds Overflow

This file captures test rounds that could not be appended to TODO.md due to GitHub editor caching. Merge into TODO.md manually.

---

## Round 12 — TC-004: Bright Minds Tutoring (Tutoring Service, Ottawa ON)
**Date:** 2026-04-03 | **Generation time:** ~106s | **Site ID:** cmnjgfuzi0004g66g5zzauf75
**Result: 10 PASSED, 6 FAILED**

### Passes (10)
- Nav CTA contrast: white on blue - PASS
- Double navbar: single nav only - PASS
- Footer tagline: business-specific - PASS
- Black/blank sections: none found - PASS
- All pages have content: 5 pages (Home, Services, Team, FAQ, Contact) - PASS
- SEO "in ." artifact: not present - PASS
- SEO unique per page: unique titles and descriptions - PASS
- Image alt texts: business-relevant - PASS
- Contact email: correct (learn@brightmindstutoring.ca) - PASS
- AI Designer route: still fixed, redirects correctly - PASS

### Failures (6)
- BUG 71 REGRESSION: Mobile navbar hamburger hidden (display:none) at 390px
- BUG 70 REGRESSION: OG image not auto-generated, placeholder shown
- BUG 72 REGRESSION: QA Check returns no results after 10s
- BUG 75 REGRESSION: Footer social icons render as "?" and link to "#"
- BUG 76 REGRESSION: Placeholder phone "(613) 555-1234" on Contact page; fabricated staff names (Jessica Miller, Sarah Chen, David Martin) on Team page
- BUG 77 NEW: Generation hung indefinitely for "Harvest Table" (restaurant, Montreal QC). Stuck at 50% for 9+ minutes with JS error "e.toLowerCase is not a function" visible in DOM. No timeout, no retry UI, no error message shown to user. Generator silently crashed.

### Bug Status
- BUG 74 FIXED: Studio sidebar now shows actual site pages (Home, Services, Team, Faq, Contact) matching the generated nav - confirmed fixed
- BUG 73 FIXED: AI Designer /ai-designer route still correctly redirecting (no 404)

- [ ] BUG 77 NEW — Generator hangs indefinitely on certain business inputs with no recovery UI. Observed with "Harvest Table" restaurant in Montreal. JS error "e.toLowerCase is not a function" renders into DOM. Generator must implement: (a) a server-side timeout (max 3-5 min) that returns a graceful error and retry option to the user, (b) input sanitization/type-checking before passing business data to generation pipeline to prevent TypeError crashes, (c) client-side watchdog that detects stall after N seconds and shows user an actionable error state.

---

## Round 13 — TC-005: Pixel and Mortar (Real Estate Agency, Edmonton AB)
**Date:** 2026-04-03 | **Generation time:** ~100s | **Site ID:** cmnjh9e0y000eg66gelu7va5l
**Result: 10 PASSED, 6 FAILED**

### Passes (10)
- Nav CTA contrast: white on blue - PASS
- - Double navbar: single nav - PASS
  - - Black/blank sections: none - PASS
    - - All pages have content: 6 pages (Home, Services, Listings, Valuation, About, Contact) - PASS
      - - SEO "in ." artifact: not present - PASS
        - - SEO unique per page: specific titles and descriptions - PASS
          - - Image alt texts: relevant (property names, Edmonton neighbourhoods) - PASS
            - - Contact email: correct (homes@pixelandmortar.ca) - PASS
              - - AI Designer route: still fixed - PASS
                - - Studio sidebar pages: match actual site pages - PASS (BUG 74 still fixed)
                 
                  - ### Failures (6)
                  - - BUG 70 REGRESSION: OG image placeholder not auto-generated
                    - - BUG 71 REGRESSION: Mobile navbar hamburger display:none at 390px
                      - - BUG 72 REGRESSION: QA Check returns no results
                        - - BUG 75 PARTIAL FIX: SVG icons now render correctly in footer, but all social links still point to "#"
                          - - BUG 76 REGRESSION: Placeholder phone "(780) 555-1234" and address "123 Jasper Avenue" on Contact page
                            - - BUG 78 NEW: Footer tagline is generic ("Excellence in every detail.") instead of business-specific. Previous sites generated specific taglines. Regression likely tied to business type (real estate) or template selection.
                             
                              - - [ ] BUG 78 NEW — Footer tagline generator produces generic fallback copy ("Excellence in every detail.") for certain business types (observed: real estate). Generator must always derive the tagline from interview data (business name, services, location) and must not fall back to a generic phrase. Every generated footer tagline must be specific to the business.

---

## Round 14 — TC-006: Vance Legal Group (Law Firm, Winnipeg MB)
**Date:** 2026-04-03 | **Generation time:** ~109s | **Site ID:** cmnjhk2c6000pg66grsmqe2x9
**Result: 11 PASSED, 5 FAILED**

### Passes (11)
- Nav CTA contrast: white on dark navy - PASS
- - Double navbar: single nav - PASS
  - - Black/blank sections: none - PASS
    - - All pages have content: 5 pages (Home, Services, About, FAQ, Contact) - PASS
      - - SEO "in ." artifact: not present - PASS
        - - SEO unique per page - PASS
          - - Image alt texts: relevant (legal practice areas) - PASS
            - - Contact email: correct (consult@vancelegal.ca) - PASS
              - - AI Designer route: still fixed - PASS
                - - Studio sidebar pages: match actual site pages - PASS (BUG 74 fixed)
                  - - Social SVG icons: render correctly - PASS (BUG 75 SVG portion fixed)
                   
                    - ### Failures (5)
                    - - BUG 70 REGRESSION: OG image placeholder
                      - - BUG 71 REGRESSION: Mobile navbar hamburger display:none at 390px
                        - - BUG 72 REGRESSION: QA Check returns no results
                          - - BUG 75 PARTIAL: Social URLs still all "#" — links have no real destinations
                            - - BUG 76 REGRESSION: Placeholder phone "(204) 555-0123" and address "201 Portage Avenue" on Contact
                              - - BUG 78 CONFIRMED: Footer tagline "Vance Legal Group — Excellence in every detail." — same generic copy as TC-005. Confirmed cross-business-type regression, not a one-off.
