# Xusmo AI Agent/Engine — Bug Fix Todos

## Critical
- [ ] BUG 2: Add page creation capability to editor agent — AI cannot create new pages, garbles text, and incorrectly targets navbar.logoUrl instead
- [ ] BUG 5+6: Fix Send button z-index conflict with floating AI Assistant — clicking Send opens the modal instead of submitting inline chat; only Enter key works
- [ ] BUG 8: Fix AI hallucination — agent falsely claims actions were completed based on previously failed (unexecuted) commands

## High
- [ ] BUG 1: Fix hero content update — sync heroHeadline/heroSubheadline to actual designDocument section props (title/subtitle)
- [ ] BUG 4+10: Fix LLM response truncation — increase token limit and handle partial responses; multi-step commands cut off after "1."
- [ ] BUG 7: Stop AI from leaking raw JSON/internal action data (UPDATE_SECTION_PROP, pageSlug, etc.) in chat responses

## Medium
- [ ] BUG 3: Fix theme colors not rendering in engine preview — background #111111 stored correctly but preview stays white
- [ ] BUG 9: Persist chat history across page refresh/navigation — entire conversation resets on F5

## Low
- [ ] BUG 11: Fix page selector resetting to "journal" instead of "home" when returning to AI Designer
