# Xusmo AI Agent/Engine — Bug Tracker

## Fixed (deployed to production)

- [x] BUG 1: Hero content sync — `updateDesignDocumentHero()` now tries ALL matching prop names (title/headline/heading for heroHeadline, subtitle/subheadline/description for heroSubheadline)
- [x] BUG 2: Page creation — `CREATE_PAGE` action creates pages in both DB and designDocument
- [x] BUG 3: Theme colors rendering — `.page` CSS now uses `var(--bg)` for background-color, sections use `var(--bg, var(--surface))` fallback
- [x] BUG 4+10: Response truncation — Switched to Gemini Pro (4K tokens) + `salvageJSON()` for partial responses
- [x] BUG 5+6: Send button conflict — Floating StudioAgent hidden on AI Designer page (`!pathname.includes("/aidesigner")`)
- [x] BUG 7: JSON leak in replies — `sanitizeReply()` strips raw action data from user-facing text
- [x] BUG 8: AI hallucination — System prompt: "ONLY report actions you are ACTUALLY executing"
- [x] BUG 9: Chat persistence — Chat history saved/restored from `localStorage` (last 50 messages)
- [x] BUG 11: Page selector — Defaults to "home" page
- [x] BUG 12-14: Empty sections — `getDefaultProps()` provides real default content for 15+ component types (about, testimonials, footer, services, FAQ, features, etc.)
- [x] BUG 15: Unknown action — All action types now implemented in editor agent (12 actions total)

## Future Enhancements

- [ ] E-commerce Agent — WooCommerce product creation, checkout, cart (postponed)
- [ ] Vibe Coding Agent — Generate clean React + Tailwind export alongside WordPress
- [ ] WordPress theme file generation — PHP templates, child themes, ACF fields
- [ ] Multi-user real-time editing — WebSocket-based collaboration
- [ ] AI image generation — Flux/Leonardo for custom AI-generated images (beyond Pexels stock)
