# Xusmo AI Agent/Engine — Bug Tracker

## Fixed (deployed to production)

- [x] BUG 1: Hero content sync — `updateDesignDocumentHero()` syncs heroHeadline to designDocument section props (title/subtitle)
- [x] BUG 2: Page creation — `CREATE_PAGE` action creates pages in both DB and designDocument
- [x] BUG 4+10: Response truncation — Switched to Gemini Pro (4K tokens) + `salvageJSON()` for partial responses
- [x] BUG 5+6: Send button conflict — Floating StudioAgent hidden on AI Designer page (`!pathname.includes("/aidesigner")`)
- [x] BUG 7: JSON leak in replies — `sanitizeReply()` strips raw action data from user-facing text
- [x] BUG 8: AI hallucination — System prompt: "ONLY report actions you are ACTUALLY executing. Do NOT claim previous actions."
- [x] BUG 9: Chat persistence — Chat history saved/restored from `localStorage` (last 50 messages)
- [x] BUG 11: Page selector — Defaults to "home" page (`site.pages.find(p => p.slug === "home")`)

## Pending

- [ ] BUG 3: Theme colors not rendering in engine preview — values stored correctly but preview iframe doesn't reflect dark backgrounds. Needs investigation in `EnginePreviewClient.tsx` CSS variable injection.

## Future Enhancements

- [ ] E-commerce Agent — WooCommerce product creation, checkout, cart (postponed)
- [ ] Vibe Coding Agent — Generate clean React + Tailwind export alongside WordPress
- [ ] WordPress theme file generation — PHP templates, child themes, ACF fields
- [ ] Multi-user real-time editing — WebSocket-based collaboration
- [ ] AI image generation — Flux/Leonardo for custom AI-generated images (beyond Pexels stock)
