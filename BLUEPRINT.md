# Xusmo Technical Blueprint — React Frontend + WordPress CMS

> Target: React renders the public site, WordPress manages content.
> designDocument is canonical. WordPress is a content backend.

---

## 1. Data Flow (Target Architecture)

```
User Interview
     │
     ▼
Xusmo AI Engine (generateFull)
     │
     ▼
designDocument (CANONICAL)
     │
     ├──► PostgreSQL Site.designDocument (stored)
     │
     ├──► PostgreSQL Page rows (derived projection — read-only for studio UI)
     │
     ├──► WordPress CMS (synced)
     │    ├── Custom Post Types (sections, components)
     │    ├── Media Library (images from Pexels)
     │    ├── Theme Settings (colors, fonts via theme.json)
     │    ├── Menus (nav structure)
     │    └── SEO fields (Yoast meta)
     │
     └──► Next.js React Renderer (reads from designDocument OR WP REST API)
          ├── /engine-preview/{siteId} (studio preview)
          └── /{domain}/* (production public site)
```

---

## 2. Single Source of Truth

### Rule: designDocument is ALWAYS canonical

| Operation | Writes to | Reads from |
|-----------|-----------|------------|
| AI generates site | designDocument | — |
| AI agent edits content | designDocument → derive Page rows | designDocument |
| Studio section editor | designDocument → derive Page rows | designDocument |
| Studio theme editor | designDocument.theme | designDocument.theme |
| Preview rendering | — | designDocument |
| WordPress sync | — (reads designDocument, writes to WP) | designDocument |
| Public site rendering | — | WP REST API (synced from designDocument) |

### What Page rows are for

Page rows (`Page` table) are a **read-only projection** used for:
- Studio sidebar page list
- SEO meta display in studio
- Quick queries (which pages exist, sort order)

They are DERIVED from designDocument — never hand-edited independently.

### Sync function (single place)

```typescript
// lib/sync/derive-pages.ts
async function derivePageRows(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { designDocument: true }
  });
  const doc = site.designDocument as SiteDocument;
  
  // Delete existing pages
  await prisma.page.deleteMany({ where: { siteId } });
  
  // Create from designDocument
  const pages = Object.entries(doc.pages);
  for (let i = 0; i < pages.length; i++) {
    const [slug, pageData] = pages[i];
    const hero = pageData.sections.find(s => s.component.includes('hero'));
    const sectionTitle = pageData.sections.find(s => s.component === 'section-title');
    
    await prisma.page.create({
      data: {
        siteId,
        slug,
        title: sectionTitle?.props?.title || slug,
        sortOrder: i,
        heroHeadline: hero?.props?.title || null,
        heroSubheadline: hero?.props?.subtitle || null,
        ctaLabel: hero?.props?.cta || null,
        metaTitle: pageData.meta?.metaTitle || null,
        metaDesc: pageData.meta?.metaDesc || null,
      }
    });
  }
}
```

Call `derivePageRows(siteId)` after ANY designDocument edit:
- After generation
- After AI agent edits
- After section editor saves
- After theme editor saves

---

## 3. WordPress as Content Backend

### What WordPress stores

| WP Feature | Xusmo Use |
|------------|-----------|
| Pages (post_type=page) | One WP page per designDocument page |
| Post Content | Gutenberg blocks converted from designDocument sections |
| Media Library | Pexels images uploaded during generation |
| Theme.json | Colors, fonts, radius from designDocument.theme |
| Navigation Menus | Derived from designDocument navbar links |
| Yoast SEO | metaTitle, metaDesc from designDocument page.meta |
| Custom Fields | Component props stored as post meta |
| Site Options | Business name, tagline, contact info |

### WordPress sync function

```typescript
// lib/wordpress/sync-from-document.ts
async function syncDesignDocumentToWordPress(siteId: string) {
  const site = await prisma.site.findUnique({...});
  if (!site.wpUrl) return; // No WP backend — skip
  
  const doc = site.designDocument as SiteDocument;
  const wp = getExecutor(siteId);
  
  // 1. Sync theme.json
  await syncThemeJson(wp, doc.theme);
  
  // 2. Sync pages
  for (const [slug, page] of Object.entries(doc.pages)) {
    const gutenbergHtml = sectionsToGutenberg(page.sections);
    await wp.execute(`post update ${wpPostId} --post_content='${gutenbergHtml}'`);
  }
  
  // 3. Sync menus
  const navLinks = doc.pages.home.sections
    .find(s => s.component === 'navbar')?.props?.links;
  await syncNavMenu(wp, navLinks);
  
  // 4. Sync SEO
  for (const [slug, page] of Object.entries(doc.pages)) {
    await syncYoastMeta(wp, slug, page.meta);
  }
}
```

### When WordPress syncs

| Event | Sync Action |
|-------|-------------|
| Site generated (build complete) | Full sync: all pages, theme, media, menus |
| AI agent edits content | Incremental sync: affected page only |
| Theme changed | Theme.json sync only |
| Image changed | Media upload + page update |
| Site published | Final full sync + enable indexing |

---

## 4. React Rendering

### Preview Path (Studio)

```
/engine-preview/{siteId}?page={slug}
     │
     ▼
EnginePreviewClient.tsx
     │
     ├── Reads designDocument from server component
     ├── Injects theme CSS variables
     ├── Renders sections through componentRegistry
     └── Each component is a React JSX with Tailwind
```

### Production Path (Public Site) — Future

```
/{domain}/*
     │
     ▼
Next.js Dynamic Route
     │
     ├── Option A: Read from designDocument (fastest)
     ├── Option B: Fetch from WP REST API (CMS-managed)
     └── Render through same React components
```

### Component Rendering

```
designDocument.pages.home.sections = [
  { component: "navbar", props: { logo, links, cta } },
  { component: "hero-image", props: { title, subtitle, imageUrl } },
  { component: "services-section", props: { title, services[] } },
  ...
]
     │
     ▼
componentRegistry["hero-image"] → Hero.jsx
     │
     ▼
<section className="relative min-h-screen ...">
  <img src={imageUrl} className="absolute inset-0 ..." />
  <h1 className="text-7xl ...">{title}</h1>
  ...
</section>
```

---

## 5. Single Agent API

### Endpoint: POST /api/studio/{siteId}/agents

**One API, one contract, one executor.**

The legacy `/agent` route proxies to `/agents`:
```typescript
export { POST } from "../agents/route";
```

### Actions (unified):

| Action | What it does | Updates |
|--------|-------------|---------|
| UPDATE_CONTENT | Edit hero, subtitle, CTA, body | designDocument → derive pages |
| UPDATE_SEO | Meta title, description | designDocument.meta → derive pages |
| APPLY_PRESET | Theme preset | designDocument.theme |
| UPDATE_THEME | Colors, fonts | designDocument.theme |
| UPDATE_CSS | Custom CSS | Site.customCss |
| UPDATE_IMAGE | Pexels search + replace | designDocument section props |
| UPDATE_SECTION_PROP | Any section prop | designDocument |
| ADD_SECTION | Add component | designDocument |
| REMOVE_SECTION | Delete section | designDocument |
| CREATE_PAGE | New page | designDocument → derive pages |
| NAVIGATE | Switch tab | Frontend only |
| UNDO | Revert last | designDocument |

### After every action:

```typescript
// 1. designDocument already updated by the action
// 2. Derive page rows
await derivePageRows(siteId);
// 3. Sync to WordPress (if connected)
await maybeSyncToWP(siteId);
```

---

## 6. Studio Pages — Engine-Aware

### Every studio page checks:

```typescript
const isEngineSite = !!site.designDocument && !site.wpUrl;
```

| Page | Engine behavior |
|------|----------------|
| AI Designer | Default. Full editing via agent chat |
| Design | Reads theme from designDocument.theme, not themePoolEntry |
| Preview | Shows engine-preview iframe, not WP iframe |
| Content | Reads page content from designDocument sections |
| Pages | Lists pages from designDocument, not Page table |
| SEO | Reads meta from designDocument page.meta |

---

## 7. Migration Path (from current to target)

### Phase 1: Clean architecture (NOW)
- [x] designDocument is canonical
- [x] Remove legacy agent API (proxy to new)
- [x] Fix sortOrder bug
- [x] Fix design page to read designDocument.theme
- [x] Remove WP sync leaks from engine editing
- [ ] Add `derivePageRows()` as single sync function
- [ ] Make all studio pages engine-aware

### Phase 2: WordPress as content backend
- [ ] Sync designDocument → WP pages on generation
- [ ] Sync designDocument → WP on AI agent edits
- [ ] Serve public site from WP REST API
- [ ] Admin can edit in WordPress → syncs back to designDocument

### Phase 3: Production hosting
- [ ] Custom domain assignment
- [ ] SSL via Let's Encrypt
- [ ] CDN for static assets
- [ ] WordPress container lifecycle management
- [ ] Backup and restore

### Phase 4: Scale
- [ ] BullMQ workers for async generation
- [ ] Shared WordPress infrastructure (not per-site containers)
- [ ] E-commerce via WooCommerce
- [ ] Multi-tenant isolation
