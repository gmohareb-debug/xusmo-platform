# Xusmo Platform — Architecture & Flow Documentation

> Last updated: 2026-04-04
> Status: WordPress integration working end-to-end

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│                                                         │
│  xusmo.com/interview → AI Chat → "Generate My Website"  │
│                          │                              │
│                          ▼                              │
│  xusmo.com/studio/site/{id}/aidesigner                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React Frontend (Tailwind CSS)                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ Navbar   │  │ Hero     │  │ Services     │  │   │
│  │  │ Footer   │  │ About    │  │ Testimonials │  │   │
│  │  │ Gallery  │  │ Contact  │  │ FAQ          │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  │       ▲               ▲              ▲          │   │
│  │       │               │              │          │   │
│  │  designDocument    theme.json    Pexels images   │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│  WordPress Backend (Docker container per site)          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  WP REST API ← Content synced from designDocument │   │
│  │  Pages, Media, Theme, Menus, Settings             │   │
│  │  Port: 9xxx (per site)                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Generation Pipeline (What happens when user clicks "Generate")

```
User prompt ("Build me a cafe website")
     │
     ▼
┌─────────────────────────────────────────────┐
│ POST /api/agent/build                        │
│                                              │
│ 1. Create Lead record (rawAnswers)           │
│ 2. Classify business (industry, archetype)   │
│ 3. Generate Blueprint (services, pages, etc) │
│ 4. Start async pipeline ──────────────────┐  │
│ 5. Poll for siteId (up to 120s)           │  │
│ 6. Return { buildId, siteId }             │  │
└───────────────────────────────────────────┘  │
                                                │
     ┌──────────────────────────────────────────┘
     ▼
┌─────────────────────────────────────────────┐
│ startDevBuildPipeline() — queue.ts           │
│                                              │
│ Stage 1: ENGINE GENERATION                   │
│   @xusmo/engine generateFull(prompt, ctx)    │
│   ├─ Step 0: Business Intelligence (LLM)     │
│   ├─ Step 1: Site Planner (archetype, pages) │
│   ├─ Step 2: Full site generation (LLM)      │
│   ├─ Step 3: enforceConsistency() (17 steps) │
│   ├─ Step 4: resolveImages() (Pexels API)    │
│   └─ Output: designDocument JSON             │
│                                              │
│ Stage 2: SITE + PAGE RECORDS                 │
│   Create Site in PostgreSQL                  │
│   Create Page records from designDocument    │
│   Store designDocument on Site record        │
│                                              │
│ Stage 3: WORDPRESS PROVISIONING              │
│   Create Docker container (per site)         │
│   Create MariaDB database                    │
│   Install WordPress via WP-CLI               │
│   Activate xusmo-service theme               │
│   Create WP pages from designDocument        │
│   Upload images to WP media library          │
│   Store wpUrl, wpContainerName, wpPort       │
│                                              │
│ Stage 4: THEME APPLICATION                   │
│   Apply theme.json (colors, fonts)           │
│   Set custom CSS                             │
│   Configure menus                            │
│                                              │
│ Result: PREVIEW_READY                        │
└─────────────────────────────────────────────┘
```

---

## 3. File Structure

```
xusmo-platform/
├── apps/
│   └── xusmo-web/                     # Next.js 16 application
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/
│       │   │   │   ├── agent/
│       │   │   │   │   ├── build/route.ts      # Site generation endpoint
│       │   │   │   │   └── chat/route.ts       # Interview chat endpoint
│       │   │   │   ├── studio/[siteId]/
│       │   │   │   │   ├── agent/route.ts      # AI editing agent (single)
│       │   │   │   │   ├── agents/route.ts     # Multi-agent pipeline
│       │   │   │   │   └── design/
│       │   │   │   │       ├── sections/route.ts
│       │   │   │   │       └── theme/route.ts
│       │   │   │   └── builds/[id]/status/route.ts
│       │   │   ├── engine-preview/[siteId]/
│       │   │   │   ├── page.tsx                # Server component
│       │   │   │   ├── EnginePreviewClient.tsx # React renderer
│       │   │   │   ├── layout.tsx              # Imports Tailwind
│       │   │   │   └── preview.css             # @import "tailwindcss"
│       │   │   └── studio/
│       │   │       └── site/[siteId]/
│       │   │           ├── aidesigner/         # AI Designer page
│       │   │           ├── design/             # Design page
│       │   │           ├── preview/            # Preview page
│       │   │           └── layout.tsx          # Studio sidebar
│       │   ├── lib/
│       │   │   ├── agents/                     # Multi-agent system
│       │   │   │   ├── types.ts
│       │   │   │   ├── router.ts               # Intent classifier
│       │   │   │   ├── builder-agent.ts        # Full site generation
│       │   │   │   ├── editor-agent.ts         # Site editing (12 actions)
│       │   │   │   ├── image-agent.ts          # Pexels image search
│       │   │   │   ├── seo-agent.ts            # SEO optimization
│       │   │   │   └── ecommerce-agent.ts      # Placeholder
│       │   │   ├── llm/
│       │   │   │   ├── gemini.ts               # Gemini Flash + Pro
│       │   │   │   ├── router.ts               # LLM routing
│       │   │   │   └── claude.ts               # Claude fallback
│       │   │   ├── wordpress/
│       │   │   │   ├── container.ts            # Docker container management
│       │   │   │   ├── ssh.ts                  # WP-CLI executor
│       │   │   │   ├── sync.ts                 # Content sync to WP
│       │   │   │   ├── provision.ts            # Full WP provisioning
│       │   │   │   ├── fonts.ts                # Google Fonts + theme.json
│       │   │   │   └── theme-presets.ts        # Archetype presets
│       │   │   ├── generators/
│       │   │   │   └── engine-adapter.ts       # @xusmo/engine bridge
│       │   │   ├── interview/
│       │   │   │   └── blueprint.ts            # Blueprint generation
│       │   │   ├── classification/
│       │   │   │   └── classify.ts             # Business classification
│       │   │   └── queue.ts                    # Build pipeline orchestrator
│       │   ├── agents/                         # BullMQ worker agents
│       │   │   ├── index.ts                    # Worker startup
│       │   │   ├── content.agent.ts
│       │   │   ├── builder.agent.ts
│       │   │   ├── seo.agent.ts
│       │   │   ├── asset.agent.ts
│       │   │   ├── qa.agent.ts
│       │   │   ├── publishing.agent.ts
│       │   │   ├── security.agent.ts
│       │   │   └── revision.agent.ts
│       │   └── components/
│       │       ├── marketing/
│       │       │   └── InterviewAgent.tsx       # Homepage chat widget
│       │       ├── studio/
│       │       │   ├── SectionEditor.tsx
│       │       │   └── ThemeEditor.tsx
│       │       └── layout/
│       │           └── Navbar.tsx               # Marketing site nav
│       ├── prisma/
│       │   └── schema.prisma                   # Database schema
│       └── .env.production                     # Environment config
│
├── packages/
│   ├── engine/                                 # @xusmo/engine
│   │   └── src/
│   │       ├── ai/
│   │       │   ├── generate.js                 # Core generation engine
│   │       │   │   ├── generateFull()          # Main entry point
│   │       │   │   ├── analyzeBusinessIntelligence()
│   │       │   │   ├── planSite()              # Archetype + pages
│   │       │   │   ├── buildGenerationPrompt() # LLM prompt builder
│   │       │   │   ├── enforceConsistency()    # 17-step post-processing
│   │       │   │   ├── autoPopulateEmptyPages()
│   │       │   │   ├── assignPerPageSEO()
│   │       │   │   ├── assignOgImages()
│   │       │   │   └── stripEmptyLocation()
│   │       │   ├── image-resolver.js           # Pexels image search
│   │       │   ├── logo-generator.js           # SVG logo creation
│   │       │   ├── component-catalog.json      # 95 component definitions
│   │       │   └── component-groups.js         # Archetype presets
│   │       ├── components/
│   │       │   ├── componentRegistry.js        # Maps names → React components
│   │       │   ├── styles.css                  # Legacy CSS (kept for compat)
│   │       │   └── renderers/react/            # 94 JSX components
│   │       │       ├── Hero.jsx                # Full-screen hero (Tailwind)
│   │       │       ├── Navbar.jsx              # Glass navbar (Tailwind)
│   │       │       ├── Footer.jsx              # Dark footer (Tailwind)
│   │       │       ├── ServicesSection.jsx      # Card grid (Tailwind)
│   │       │       ├── Testimonials.jsx         # Quote cards (Tailwind)
│   │       │       ├── SectionTitle.jsx
│   │       │       ├── AboutSection.jsx
│   │       │       ├── Contact.jsx
│   │       │       ├── ContactForm.jsx
│   │       │       ├── FaqAccordion.jsx
│   │       │       ├── FeaturedContent.jsx
│   │       │       ├── Breadcrumbs.jsx
│   │       │       ├── ProductGrid.jsx
│   │       │       ├── HeroStats.jsx
│   │       │       ├── Gallery.jsx
│   │       │       └── ... (79 more components)
│   │       ├── types/
│   │       │   └── index.ts                    # SiteDocument, PageDef, etc.
│   │       └── index.ts                        # Package exports
│   │
│   ├── gutenberg/                              # @xusmo/gutenberg
│   │   └── src/
│   │       ├── content-generator.ts
│   │       ├── hydrator.ts
│   │       ├── registry.ts
│   │       ├── presets.ts
│   │       ├── theme-json.ts
│   │       └── patterns/                       # 56 PHP pattern templates
│   │
│   ├── editor/                                 # @xusmo/editor
│   │   └── src/
│   │       └── AdminShell.jsx                  # Visual page builder
│   │
│   ├── wordpress/                              # @xusmo/wordpress
│   │   └── src/
│   │       └── index.ts                        # Gutenberg block converter
│   │
│   └── publish/                                # @xusmo/publish
│       └── src/
│           └── index.ts                        # Deployment adapters
│
└── /ROOT/apps/wordpress/                       # WordPress themes (on server)
    └── themes/
        ├── xusmo-service/
        │   ├── style.css
        │   ├── index.php
        │   ├── functions.php
        │   ├── theme.json
        │   └── patterns/
        ├── xusmo-commerce/
        ├── xusmo-venue/
        └── xusmo-portfolio/
```

---

## 4. React Component System

### Styling: Tailwind CSS (single source)

All 15 core components use inline Tailwind utility classes. No external CSS dependency for these components.

```
preview.css → @import "tailwindcss"
Component JSX → Tailwind classes → Rendered HTML
```

Theme colors come from CSS variables set by EnginePreviewClient:
- `var(--accent)` — Primary brand color
- `var(--bg)` — Page background
- `var(--text)` — Text color
- `var(--surface)` — Card/surface background
- `var(--border)` — Border color
- `var(--font-heading)` — Heading font family
- `var(--font-body)` — Body font family

### Component → CSS Variable Mapping in Tailwind

```jsx
// Example: accent-colored button
<button className="bg-[var(--accent)] text-white rounded-full px-8 py-4">
  {cta}
</button>

// Example: theme-aware heading
<h1 className="text-5xl font-bold tracking-tight"
    style={{ fontFamily: 'var(--font-heading, inherit)' }}>
  {title}
</h1>
```

### Top 15 Components (Tailwind-migrated)

| Component | Props | Design |
|-----------|-------|--------|
| Hero | title, subtitle, cta, ctaSecondary, imageUrl, eyebrow | min-h-screen, gradient overlay, pill CTAs |
| Navbar | logo, logoUrl, links, cta | Fixed glass blur, centered links, mobile overlay |
| Footer | logo, tagline, columns, social, text, links | bg-gray-950, SVG social icons, grid layout |
| ServicesSection | title, services[] | Card grid, hover lift+shadow, arrow links |
| Testimonials | title, testimonials[] | Quote cards, SVG stars, accent border |
| SectionTitle | title, subtitle, eyebrow | Centered, accent decoration |
| AboutSection | title, description, image, stats[] | Split grid, offset accent rectangle |
| Contact | title, description, email, phone, address | Icon cards, hover lift |
| ContactForm | title, fields[], submitLabel | Styled inputs, focus rings |
| FaqAccordion | title, items[] | Animated expand, rotating chevron |
| FeaturedContent | title, description, image, reverse | Split layout, accent glow |
| Breadcrumbs | items[] | Chevron separators, accent hover |
| ProductGrid | title, products[] | Responsive grid, image zoom |
| HeroStats | stats[] | Horizontal with dividers |
| Gallery | title, images[] | Auto-fill grid, hover zoom overlay |

### Remaining 79 Components (Legacy CSS + Tailwind hybrid)

Still use class names from styles.css but Tailwind is loaded alongside for backwards compatibility.

---

## 5. WordPress Integration

### Per-Site Docker Architecture

```
┌─────────────────────────────────┐
│ Server (135.181.83.33)           │
│                                  │
│ ┌─────────────┐                  │
│ │ xusmo-wp-db │ MariaDB 11.4     │
│ │ (shared)    │ rootpassword     │
│ └──────┬──────┘                  │
│        │ sitefast_default network │
│ ┌──────┼──────┐  ┌──────────┐   │
│ │ xusmo-site- │  │ xusmo-cli│   │
│ │ {shortId}   │  │ {shortId}│   │
│ │ WP 6.7      │  │ WP-CLI   │   │
│ │ PHP 8.2     │  │ sidecar  │   │
│ │ Port 9xxx   │  └──────────┘   │
│ └─────────────┘                  │
│                                  │
│ Each site gets:                  │
│ - Own Docker container           │
│ - Own database (wp_{shortId})    │
│ - Own WP-CLI sidecar             │
│ - Own port (9000-9999)           │
│ - Own data volume                │
└─────────────────────────────────┘
```

### WordPress Provisioning Flow (container.ts)

```
1. Create database: mariadb -e "CREATE DATABASE wp_{id}"
2. Start WP container: docker run -d --name xusmo-site-{id}
   - Mount theme: xusmo-service/commerce/venue/portfolio
   - Mount patterns directory
   - Mount plugins directory
   - Connect to sitefast_default network
3. Start WP-CLI sidecar: docker run -d --name xusmo-cli-{id}
4. Wait for WP to be ready (30s timeout)
5. Install WP: wp core install --title="{businessName}"
6. Activate theme: wp theme activate xusmo-service
7. Upload images: wp media import (Pexels URLs)
8. Create pages: wp post create (from designDocument)
9. Apply theme.json (colors, fonts)
10. Store wpUrl, wpContainerName, wpPort on Site record
```

### WordPress Theme Structure

```
xusmo-service/
├── style.css           # Theme header (required by WP)
├── index.php           # Template fallback
├── functions.php       # Theme support, REST API, nav menus
├── theme.json          # Block editor settings (v3)
└── patterns/           # 56 Gutenberg block patterns
```

---

## 6. enforceConsistency() — Post-Processing Steps

After the LLM generates a site, these 17+ steps fix common issues:

| Step | What it does |
|------|-------------|
| 1 | Copy navbar/footer from home to all pages |
| 2 | Normalize product data across pages |
| 3 | Sync contact info across pages |
| 4 | Sync stats across pages |
| 5 | Apply consistency to all pages |
| 6 | Fix copyright year, © symbol |
| 6b | Enrich minimal footers (add columns, social, tagline) |
| 6c | Strip "#" social links |
| 7 | Ensure navbar has "Home" link |
| 8 | Replace loremflickr URLs |
| 9 | Strip empty location "in ." patterns |
| 10 | Force navbar logo to text (not stock photo) |
| 10b | Generate SVG logos |
| 11 | Force testimonial ratings to 5 |
| 11b | Deduplicate footer links across columns |
| 12 | Rebuild footer nav from actual pages |
| 12b | Force navbar/footer/hero to padding=none |
| 13 | Remove placeholder trust-badges/certifications |
| 13a | Convert hero-video to hero-image |
| 13b | Fix hero CTA hrefs (default to /contact) |
| 14 | Ensure navbar CTA has text |
| 15 | Remove duplicate nav (sticky-header) |
| 16 | Validate navbar links against actual pages |
| 17 | Strip fake 555 phone numbers |
| 17b | Remove announcement-bar sections |

---

## 7. Multi-Agent System

### Agent Router (router.ts)

```
User prompt → Gemini Flash classifies intent → Route to agent

Agents:
├── Builder Agent  — Full site generation via @xusmo/engine
├── Editor Agent   — 12 edit actions (content, theme, CSS, images, sections)
├── Image Agent    — Pexels search + bulk replace
├── SEO Agent      — Per-page meta generation
└── Ecommerce Agent — Placeholder (coming soon)
```

### Editor Agent Actions

| Action | What it does |
|--------|-------------|
| UPDATE_CONTENT | Edit heroHeadline, heroSubheadline, ctaLabel, bodyContent, title |
| UPDATE_SEO | Set metaTitle, metaDesc per page |
| APPLY_PRESET | Apply professional/bold/elegant/minimal/warm |
| UPDATE_THEME | Set design token colors/fonts |
| UPDATE_CSS | Custom CSS |
| UPDATE_IMAGE | Search Pexels, update section image |
| UPDATE_SECTION_PROP | Edit any prop on any section |
| ADD_SECTION | Add component with default props |
| REMOVE_SECTION | Delete section by index |
| CREATE_PAGE | Create new page with sections |
| NAVIGATE | Switch studio tabs |
| UNDO | Revert last change |

---

## 8. LLM Configuration

| Model | Use | Cost |
|-------|-----|------|
| Gemini 2.5 Flash | Classification, routing, quick tasks | $0.01/$0.04 per 1M tokens |
| Gemini 2.5 Pro | Main site generation (quality mode) | $0.07/$0.28 per 1M tokens |
| OpenRouter Free Models | Fallback (7 models in rotation) | $0 |
| Claude Sonnet | Regulated industries (law, dental) | $3/$15 per 1M tokens |

### Color Selection

LLM-driven — no hardcoded industry-to-color mapping. The prompt tells the LLM to reason about what colors fit the specific business identity, tone, and emotion. Background is always neutral (enforced in post-processing).

---

## 9. Infrastructure

| Service | Type | Port |
|---------|------|------|
| xusmo-web | Next.js (systemd) | 3006 |
| xusmo-workers | BullMQ agents (systemd) | — |
| PostgreSQL | Database | 5432 |
| Redis | Queue/cache | 6379 |
| nginx | Reverse proxy | 80/443 |
| xusmo-wp-db | MariaDB (Docker) | — |
| Per-site WP | Docker containers | 9000-9999 |

### Server: Hetzner VPS
- IP: 135.181.83.33
- RAM: 3.7GB
- Disk: 38GB
- OS: Ubuntu
- SSH: `~/.ssh/XusmoHosting_new`

---

## 10. Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| User | Auth, email, role |
| Site | Generated sites (wpUrl, designDocument, status) |
| Page | Site pages (slug, title, content, SEO) |
| Build | Build pipeline status |
| Blueprint | Structured interview data |
| Lead | Interview raw answers |
| Tenant | Multi-tenancy |
| AgentLog | Agent execution logs |

### Site Status Flow

```
STAGING → APPROVED → LIVE → SUSPENDED
```

### Build Status Flow

```
IN_PROGRESS → PREVIEW_READY → APPROVED → PUBLISHING → PUBLISHED
```
