# Xusmo AI Agent/Engine — Bug Tracker

## Fixed (deployed to production)

- [x] BUG 2: Page creation — `CREATE_PAGE` action creates pages in both DB and designDocument
- [x] BUG 4+10: Response truncation — Switched to Gemini Pro (4K tokens) + `salvageJSON()` for partial responses
- [x] BUG 5+6: Send button conflict — Floating StudioAgent hidden on AI Designer page (`!pathname.includes("/aidesigner")`)
- [x] BUG 7: JSON leak in replies — `sanitizeReply()` strips raw action data from user-facing text
- [x] BUG 8: AI hallucination — System prompt: "ONLY report actions you are ACTUALLY executing. Do NOT claim previous actions."
- [x] BUG 9: Chat persistence — Chat history saved/restored from `localStorage` (last 50 messages)
- [x] BUG 11: Page selector — Defaults to "home" page (`site.pages.find(p => p.slug === "home")`)

## Pending

- [ ] BUG 1: Hero subtitle sync NOT fully fixed — title updates correctly but subtitle still fails. AI uses "heroSubheadline" but actual prop is "subtitle". Tested: asked to change subtitle to "Premium organic skincare for radiant skin" — AI reported success but field remained "Artisan Skincare & Wellness". Reopen and fix `updateDesignDocumentHero()` to also map heroSubheadline -> subtitle.
- [ ] BUG 3: Theme colors not rendering in engine preview — values stored correctly but preview iframe doesn't reflect backgrounds. Tested: set background to #FF0000 (bright red), Theme tab shows correct value, but preview and full engine-preview page both show white background. Needs investigation in `EnginePreviewClient.tsx` CSS variable injection.

## New Bugs Found During Testing

- [ ] BUG 12 (Medium): About-section renders with broken layout — image displays on left half only, right side is completely empty with no text content visible. Section was added via "Make it look better" prompt.
- [ ] BUG 13 (Medium): Testimonials section renders as invisible/empty space — section added to page but nothing visible in preview. Large blank area between about-section and footer.
- [ ] BUG 14 (Low): Footer section not visible in preview — "Added footer to home" action succeeded but footer is not rendered in engine preview.
- [ ] BUG 15 (Medium): "Unknown action" error on page operations — when AI tried to add contact-form to careers page, an "Unknown action" error appeared alongside successful section additions. Suggests some action types are not implemented.

## Future Enhancements

- [ ] E-commerce Agent — WooCommerce product creation, checkout, cart (postponed)
- [ ] Vibe Coding Agent — Generate clean React + Tailwind export alongside WordPress
- [ ] WordPress theme file generation — PHP templates, child themes, ACF fields
- [ ] Multi-user real-time editing — WebSocket-based collaboration
- [ ] AI image generation — Flux/Leonardo for custom AI-generated images (beyond Pexels stock)
