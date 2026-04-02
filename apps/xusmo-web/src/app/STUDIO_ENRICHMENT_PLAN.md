# XUSMO — Studio Enrichment Plan
# Claude Code: Read this file and execute every step in order.
# Prerequisite: WEEK7_PLAN.md completed. All foundation Studio screens working.
#
# ALREADY EXISTS (Week 7 — do not duplicate):
#   /studio/[siteId]/build       → Build tracker
#   /studio/[siteId]/preview     → Preview + revision comment pins
#   /studio/[siteId]/content     → Page content editor
#   /studio/[siteId]/assets      → Asset manager
#   /studio/[siteId]/seo         → SEO panel
#   /studio/[siteId]/pages       → Page manager
#   /studio/[siteId]/domain      → Domain connector
#   /studio/[siteId]/publish     → Publish control
#   /studio/[siteId]/analytics   → Analytics dashboard
#   /studio                      → Multi-site switcher
#
# THIS PLAN ADDS:
#   /studio/[siteId]/leads       → Lead capture dashboard (form submissions inbox)
#   /studio/[siteId]/blog        → Blog/news manager with AI drafting
#   /studio/[siteId]/reviews     → Testimonial & review manager
#   /studio/[siteId]/share       → Client preview share link generator
#   /studio/[siteId]/health      → Site health dashboard
#   /studio/[siteId]/team        → Team access & permissions
#
# PLUS THESE ENHANCEMENTS TO EXISTING SCREENS:
#   Content editor  → AI content regeneration per block
#   Content editor  → Version history + rollback
#   SEO panel       → Social media OG preview editor
#   Analytics       → Performance recommendation engine
#   Design panel    → Custom CSS editor (advanced)

# =============================================================================
# STEP 1: Schema Additions
# =============================================================================
# Add to schema.prisma, then: npx prisma migrate dev --name studio-enrichment

# ADD FormSubmission model (stores all WPForms/contact form submissions):
```prisma
model FormSubmission {
  id     String @id @default(cuid())
  siteId String
  userId String

  // Submission data
  formName    String            // "Contact Form", "Quote Request", "Booking"
  pageSlug    String            // which page the form was on
  fields      Json              // { name, email, phone, message, ... } — raw form data
  submitterIp String?
  userAgent   String?

  // CRM status
  status      FormSubmissionStatus @default(NEW)
  notes       String?  @db.Text  // internal notes
  contactedAt DateTime?
  archivedAt  DateTime?

  // Timestamps
  receivedAt DateTime @default(now())

  // Relations
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([siteId])
  @@index([status])
  @@index([receivedAt])
}

enum FormSubmissionStatus {
  NEW
  VIEWED
  CONTACTED
  CONVERTED
  ARCHIVED
}
```

# ADD BlogPost model:
```prisma
model BlogPost {
  id     String @id @default(cuid())
  siteId String

  // Content
  title       String
  slug        String
  excerpt     String?  @db.Text
  content     Json     // same block format as SitePage.bodyContent
  featuredImageUrl String?

  // SEO
  metaTitle       String?
  metaDescription String?  @db.Text
  focusKeyword    String?

  // AI generation tracking
  aiGenerated     Boolean  @default(false)
  aiPrompt        String?  @db.Text
  llmModel        String?
  llmCost         Float?

  // WP sync
  wpPostId     Int?
  status       BlogPostStatus @default(DRAFT)
  publishedAt  DateTime?
  lastSyncedAt DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, slug])
  @@index([siteId])
  @@index([status])
}

enum BlogPostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

# ADD Testimonial model:
```prisma
model Testimonial {
  id     String @id @default(cuid())
  siteId String

  // Content
  authorName    String
  authorTitle   String?    // "Owner of ABC Bakery"
  authorPhoto   String?    // URL
  rating        Int?       // 1-5
  content       String     @db.Text

  // Source
  source        TestimonialSource @default(MANUAL)
  sourceId      String?    // Google review ID, etc.
  sourceUrl     String?    // link to original review

  // Display
  isPublished   Boolean    @default(true)
  sortOrder     Int        @default(0)
  featuredPage  String?    // "home", "services" — where it shows on the site

  // WP sync
  wpPostId      Int?       // if stored as CPT
  lastSyncedAt  DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([siteId])
}

enum TestimonialSource {
  MANUAL
  GOOGLE
  FACEBOOK
  YELP
}
```

# ADD SiteShareLink model (client preview share links):
```prisma
model SiteShareLink {
  id     String @id @default(cuid())
  siteId String
  userId String

  token       String   @unique @default(cuid())  // used in URL: /preview/{token}
  label       String?  // "Sent to John (client)" — internal memo
  canComment  Boolean  @default(false)  // allow recipient to add comments
  expiresAt   DateTime?
  viewCount   Int      @default(0)
  lastViewedAt DateTime?
  isRevoked   Boolean  @default(false)

  createdAt DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([siteId])
}
```

# ADD ContentVersion model (for content rollback):
```prisma
model ContentVersion {
  id         String @id @default(cuid())
  sitePageId String
  siteId     String

  // Snapshot of SitePage content at save time
  heroHeadline    String?  @db.Text
  heroSubheadline String?  @db.Text
  ctaLabel        String?
  bodyContent     Json?
  metaTitle       String?
  metaDescription String?  @db.Text

  // Who/why
  savedBy    String   // userId
  saveReason String?  // "manual save" | "auto-save" | "ai regeneration" | "rollback"

  createdAt DateTime @default(now())

  @@index([sitePageId])
  @@index([siteId])
}
```

# ADD TeamMember model (studio team access):
```prisma
model TeamMember {
  id     String @id @default(cuid())
  siteId String
  userId String   // the site owner who granted access

  // Invitee
  inviteEmail String
  inviteeName String?
  inviteeUserId String?  // set when they accept

  role        TeamRole @default(VIEWER)
  status      TeamInviteStatus @default(PENDING)
  inviteToken String   @unique @default(cuid())

  // Audit
  invitedAt  DateTime @default(now())
  acceptedAt DateTime?
  revokedAt  DateTime?

  @@index([siteId])
  @@index([inviteEmail])
}

enum TeamRole {
  VIEWER      // can view Studio, cannot edit
  EDITOR      // can edit content, assets, blog
  MANAGER     // full Studio access except billing/delete
}

enum TeamInviteStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}
```

# ADD to Site model:
#   formSubmissions FormSubmission[]
#   blogPosts       BlogPost[]
#   testimonials    Testimonial[]
#   shareLinks      SiteShareLink[]
#   teamMembers     TeamMember[]

# ADD to SitePage model:
#   versions ContentVersion[]

# Run after all additions:
#   npx prisma migrate dev --name studio-enrichment
#   npx prisma generate

# =============================================================================
# STEP 2: Lead Capture Dashboard — /studio/[siteId]/leads
# =============================================================================
# Create src/app/studio/[siteId]/leads/page.tsx

Every form submission from the WP site flows here. This turns the Studio into a
lightweight CRM so customers don't need to check wp-admin or set up a separate tool.

```typescript
// HOW SUBMISSIONS GET INTO THE DB:
// WPForms (already installed in Golden Image) supports webhook notifications.
// Set up a WPForms webhook pointing to: POST /api/webhooks/wpforms
// Webhook payload: { form_id, form_name, fields: {}, entry_id, site_url }
// API route: parse fields, match site by site_url, create FormSubmission record,
// send email notification to site owner (via SendGrid).
//
// Alternatively (simpler in dev): WPForms can email entries.
// Set WPForms notification email to: submissions+{siteId}@inbound.xusmo.io
// Set up SendGrid inbound parse to POST to /api/webhooks/email-submissions
// Parse the email and create FormSubmission records.
//
// LAYOUT:
// ┌─ HEADER ─────────────────────────────────────────────────────────────┐
// │  "Leads & Submissions"  |  [Filter: All/New/Contacted/Converted]    │
// │  Total: 24 submissions  |  New today: 3  |  [Export CSV]            │
// └──────────────────────────────────────────────────────────────────────┘
// ┌─ SUBMISSION LIST ───────────────────────────────────────────────────┐
// │  [●NEW] John Smith · Quote Request · Home page · 2 hours ago       │
// │         john@email.com · (416) 555-1234                             │
// │         "Looking for a full bathroom renovation quote..."            │
// │         [Mark Contacted] [Archive] [Reply via Email]                │
// ├────────────────────────────────────────────────────────────────────┤
// │  [CONTACTED] Sarah Lee · Contact Form · Contact page · Yesterday   │
// │         ...                                                         │
// └────────────────────────────────────────────────────────────────────┘
//
// Each submission card:
// - Status dot (red=NEW, blue=VIEWED, green=CONTACTED/CONVERTED, gray=ARCHIVED)
// - Submitter name + email + phone (extracted from fields JSON)
// - Form name + source page
// - Time ago (relative timestamp)
// - Message preview (truncated to 100 chars)
// - Inline actions: Mark Contacted | Convert | Archive
// - "Reply via Email" → opens mailto: with pre-filled subject
// - "Notes" drawer: internal freetext notes per submission
//
// STATS ROW (top):
// - Total submissions (all time)
// - New (unread) today
// - Conversion rate (CONVERTED / total × 100)
// - Most active form ("Quote Request" is getting 80% of submissions)
//
// EXPORT:
// GET /api/studio/[siteId]/leads/export → CSV download
// Columns: Date, Name, Email, Phone, Form, Page, Message, Status
//
// API routes:
//   GET  /api/studio/[siteId]/leads              → paginated FormSubmissions
//   PUT  /api/studio/[siteId]/leads/[id]         → update status/notes
//   GET  /api/studio/[siteId]/leads/export       → CSV
//   POST /api/webhooks/wpforms                   → receive WPForms webhook
//
// EMAIL NOTIFICATION (send on each new submission via SendGrid):
// Subject: "New lead from your Xusmo site — {businessName}"
// Body: submitter name, email, phone, form name, message preview
// CTA: "View in Studio →" link to /studio/{siteId}/leads
//
// Add to Studio left nav: "📨 Leads" with a badge showing NEW count
// Badge clears when user visits the page (mark all VIEWED)
```

# =============================================================================
# STEP 3: Blog / News Manager — /studio/[siteId]/blog
# =============================================================================
# Create src/app/studio/[siteId]/blog/page.tsx
# Create src/app/studio/[siteId]/blog/[postId]/page.tsx

Lets customers manage their blog without touching wp-admin. AI can draft full
posts from a title or topic. Syncs to WP via WP-CLI.

```typescript
// BLOG INDEX (/studio/[siteId]/blog):
// - Header: "Blog & News" + "Write New Post" button
// - Filter tabs: All | Draft | Published | Archived
// - Post list (table):
//   Title | Status | Published Date | Focus Keyword | SEO Score | Actions
// - Each row: "Edit" | "Publish/Unpublish" | "Delete"
// - Empty state (no posts): "Share your expertise. Blog posts build trust and bring traffic."
//   + "Write Your First Post" CTA
//
// POST EDITOR (/studio/[siteId]/blog/[postId]):
// LEFT PANEL (2/3 width):
//   - Title field (large, prominent)
//   - Slug (auto-generated from title, editable)
//   - Featured image: drag-drop upload or pick from SiteAsset library
//   - Body: same block editor as content editor (heading/paragraph/list/callout blocks)
//     Add block types: heading, paragraph, list, image, callout, quote, divider
//
// RIGHT PANEL (1/3 width, sticky):
//   - Status: Draft | Scheduled | Published
//   - Publish date (datetime picker, enables scheduling)
//   - Focus keyword
//   - Meta title + description (with char counters)
//   - "Save Draft" button
//   - "Publish Now" button (or "Update" if already published)
//
// AI DRAFT ASSISTANT:
// "✨ Draft with AI" button (top of editor, collapses into panel):
//   - Topic / title input (pre-filled with post title)
//   - Tone: Informative | Conversational | Expert | Local SEO
//   - Length: Short (~400 words) | Medium (~800 words) | Long (~1,500 words)
//   - "Generate Draft" button
//   - POST /api/studio/[siteId]/blog/ai-draft
//     Body: { title, topic, tone, length, industryCode, city }
//     Calls Gemini Pro with prompt:
//       "Write a blog post for a {industry} business in {city}.
//        Title: {title}. Tone: {tone}. Length: {length} words.
//        Include: local SEO terms, practical advice, a CTA at the end.
//        Format as JSON blocks: [{type, content}]"
//   - Returns blocks → populates editor
//   - User can edit before saving
//   - Track: aiGenerated=true, aiPrompt, llmModel, llmCost
//
// SYNC TO WORDPRESS:
// On "Publish Now" or "Save Draft":
// 1. Save BlogPost to DB
// 2. Enqueue blogSyncQueue job
// 3. Worker runs WP-CLI:
//    If new post: wp post create --post_type=post --post_title="{title}"
//                   --post_status={draft|publish} --post_name="{slug}"
//                   --post_content="{html}" --path=...
//    If existing:  wp post update {wpPostId} --post_content="{html}"
//                   --post_status={...} --path=...
//    SEO meta:     wp post meta update {wpPostId} _yoast_wpseo_title ...
//                  wp post meta update {wpPostId} _yoast_wpseo_metadesc ...
//    Featured img: upload to WP media library, set as thumbnail
// 4. Update BlogPost.wpPostId, lastSyncedAt
//
// API routes:
//   GET  /api/studio/[siteId]/blog              → list BlogPosts
//   POST /api/studio/[siteId]/blog              → create new post
//   GET  /api/studio/[siteId]/blog/[id]         → get single post
//   PUT  /api/studio/[siteId]/blog/[id]         → save/update
//   DELETE /api/studio/[siteId]/blog/[id]       → delete
//   POST /api/studio/[siteId]/blog/ai-draft      → AI draft generation
```

# =============================================================================
# STEP 4: Testimonial & Review Manager — /studio/[siteId]/reviews
# =============================================================================
# Create src/app/studio/[siteId]/reviews/page.tsx

Lets customers manage the testimonials displayed on their site. Pull from Google,
add manually, choose which ones to feature and where.

```typescript
// LAYOUT:
// ┌─ HEADER ────────────────────────────────────────────────────────────────┐
// │  "Reviews & Testimonials"  |  [+ Add Manually]  [Connect Google]       │
// └─────────────────────────────────────────────────────────────────────────┘
// ┌─ PUBLISHED (showing on site) ────────────────────────────────────────────┐
// │  [★★★★★] "John fixed our burst pipe at 2am. Absolute lifesaver!"         │
// │            John M. · Google · Featured on: Home, Services               │
// │            [Edit] [Hide] [Move to ...]                                   │
// ├─────────────────────────────────────────────────────────────────────────┤
// │  ... more testimonials                                                   │
// └─────────────────────────────────────────────────────────────────────────┘
// ┌─ HIDDEN (imported but not displayed) ───────────────────────────────────┐
// │  [★★★★☆] "Good service but arrived a bit late." · Google               │
// │            [Publish] [Delete]                                            │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ADD MANUALLY modal:
//   Author name, Author title (optional), Rating (1-5 stars), Review text,
//   Author photo upload (optional)
//   "Add to Site" button
//
// CONNECT GOOGLE button:
//   POST /api/studio/[siteId]/reviews/google-connect
//   Opens Google OAuth (Places API requires user auth for their own listing)
//   On auth: fetch reviews from Google Places API for this business
//   Import all reviews as Testimonial records (isPublished=false initially)
//   User manually selects which to publish
//   Show "Last synced: X minutes ago" + "Sync Now" button
//
// FEATURED PAGE selector (per testimonial):
//   Dropdown: "Home page", "Services page", "Both", "None"
//   Controls where the testimonial appears in WP content
//
// SYNC TO WORDPRESS:
// On publish/unpublish/reorder:
// Worker runs WP-CLI to update the testimonials CPT posts in WP
// (Testimonials are stored as a custom post type registered in the Golden Image)
// wp post create --post_type=testimonial --post_title="{author}" --post_content="{content}"
//               --post_status=publish --meta_input='{"rating":5,"author_title":"..."}'
// On hide: wp post update {wpPostId} --post_status=draft
//
// API routes:
//   GET  /api/studio/[siteId]/reviews                    → list Testimonials
//   POST /api/studio/[siteId]/reviews                    → add manually
//   PUT  /api/studio/[siteId]/reviews/[id]               → update/reorder
//   DELETE /api/studio/[siteId]/reviews/[id]             → delete
//   POST /api/studio/[siteId]/reviews/google-connect     → trigger Google import
//   POST /api/studio/[siteId]/reviews/sync               → re-fetch from Google
```

# =============================================================================
# STEP 5: AI Content Regeneration (Enhancement to Content Editor)
# =============================================================================
# Update src/app/studio/[siteId]/content/page.tsx

Add an AI regeneration button to each content block in the existing content editor.

```typescript
// Each block in the body content editor gets a "✨" button on hover.
// Clicking opens a small popover:
//   [Regenerate this section]
//   Instruction: "Make it more urgent" / "Shorter" / "Focus on {service}" (text input)
//   [Generate] button
//
// POST /api/studio/[siteId]/content/regenerate
// Body: { pageSlug, blockIndex, currentContent, instruction, businessContext }
// businessContext = { businessName, industry, city, services[] } (from Blueprint)
//
// Calls Gemini Flash:
//   "Rewrite this section of a {industry} website in {city}:
//    Current text: {currentContent}
//    Instruction: {instruction}
//    Keep it under {wordLimit} words. Maintain the same block type ({type}).
//    Return only the new text, no preamble."
//
// Response appears INLINE as a diff view:
//   BEFORE: [original text, strikethrough red]
//   AFTER:  [new text, highlighted green]
//   [Accept] [Try Again] [Dismiss]
//
// On Accept:
// - Update block in local state
// - Autosave (PUT /api/studio/[siteId]/content)
// - Create ContentVersion snapshot (before replacing) for rollback
//
// Also add "✨ Rewrite page" button at the TOP of each page:
// Regenerates all blocks on the page at once with tone guidance:
//   Tone selector: Professional | Conversational | Urgent | Friendly
// This calls the same API but with the full page as context.
```

# =============================================================================
# STEP 6: Version History + Rollback (Enhancement to Content Editor)
# =============================================================================
# Update src/app/studio/[siteId]/content/page.tsx

```typescript
// Add "History" clock icon button to the content editor top bar.
// Opens a right-side drawer: "Version History"
//
// List of ContentVersion records for the active page:
//   [Today 2:34 PM] — Manual save
//   [Today 1:12 PM] — AI regeneration (hero headline)
//   [Yesterday 6:45 PM] — Manual save
//   [3 days ago] — Initial build
//
// Click any version → shows a diff preview:
//   Left: current content | Right: selected version
//   Changed blocks highlighted in amber
//
// "Restore this version" button:
//   - Creates new ContentVersion (saving current as "pre-rollback")
//   - Replaces SitePage content with version snapshot
//   - Enqueues contentSyncQueue job to push to WP
//   - Shows success toast: "Restored to version from {time ago}"
//
// AUTO-SAVE VERSIONS:
// Every successful PUT /api/studio/[siteId]/content creates a ContentVersion.
// Cap at 20 versions per page (delete oldest when over limit).
//
// API routes:
//   GET  /api/studio/[siteId]/content/[pageSlug]/versions    → list versions
//   GET  /api/studio/[siteId]/content/[pageSlug]/versions/[id] → get snapshot
//   POST /api/studio/[siteId]/content/[pageSlug]/rollback     → restore version
//     Body: { versionId }
```

# =============================================================================
# STEP 7: Social Media OG Preview (Enhancement to SEO Panel)
# =============================================================================
# Update src/app/studio/[siteId]/seo/page.tsx

Add a "Social Preview" tab below the per-page SEO fields.

```typescript
// SOCIAL PREVIEW SECTION (add to SEO panel, below existing SERP preview):
//
// Tab switcher: [Google Preview] [Facebook] [Twitter/X] [LinkedIn]
//
// FACEBOOK preview card:
// ┌──────────────────────────────────────────────────────┐
// │  [OG Image — 1200×630 — drag to replace]            │
// │  YOURDOMAIN.COM                                      │
// │  OG Title (editable, max 60 chars)                   │
// │  OG Description (editable, max 90 chars)             │
// └──────────────────────────────────────────────────────┘
//
// TWITTER preview card (summary_large_image format):
// ┌──────────────────────────────────────────────────────┐
// │  [Twitter Card Image — 1200×628]                    │
// │  Twitter Title (editable)                            │
// │  Twitter Description (editable)                      │
// └──────────────────────────────────────────────────────┘
//
// OG Image options:
//   1. Pick from SiteAsset library
//   2. Upload new image
//   3. Auto-generate: "Generate OG Image" button
//      → POST /api/studio/[siteId]/seo/generate-og-image
//      → Calls Flux/Imagen to generate a branded image:
//          Prompt: "Professional OG image for a {industry} business named {name}.
//                   Background: {primaryColor}. Include business name as overlay text.
//                   Style: clean, modern, appropriate for {industry}."
//      → Save to R2, update Site or SitePage og_image_url field
//
// Fields stored on SitePage model (add if not present):
//   ogTitle       String?
//   ogDescription String?
//   ogImageUrl    String?
//   twitterTitle  String?
//   twitterDescription String?
//
// SYNC TO WORDPRESS:
// WP-CLI + Yoast meta:
//   wp post meta update {wpPostId} _yoast_wpseo_opengraph-title "{ogTitle}"
//   wp post meta update {wpPostId} _yoast_wpseo_opengraph-description "{ogDescription}"
//   wp post meta update {wpPostId} _yoast_wpseo_opengraph-image "{ogImageUrl}"
//   wp post meta update {wpPostId} _yoast_wpseo_twitter-title "{twitterTitle}"
//   wp post meta update {wpPostId} _yoast_wpseo_twitter-description "{twitterDescription}"
```

# =============================================================================
# STEP 8: Performance Recommendation Engine (Enhancement to Analytics)
# =============================================================================
# Update src/app/studio/[siteId]/analytics/page.tsx

Add an AI-powered "Action Items" section that tells customers exactly what to
improve, in plain language, ranked by impact.

```typescript
// ADD "Recommendations" panel to Analytics page (below existing sections):
//
// ┌─ ACTION ITEMS ──────────────────────────────────────────── [Refresh] ─┐
// │  🔴 HIGH IMPACT                                                        │
// │  ┌──────────────────────────────────────────────────────────────────┐ │
// │  │ 🖼  Add a real team photo to your About page                     │ │
// │  │    Sites with team photos get 34% more contact form submissions.  │ │
// │  │    [Add Photo →]  (links to /studio/[siteId]/assets)             │ │
// │  └──────────────────────────────────────────────────────────────────┘ │
// │  ┌──────────────────────────────────────────────────────────────────┐ │
// │  │ 📝 Your hero headline is generic                                 │ │
// │  │    "Welcome to [Business Name]" is used by 60% of competitors.   │ │
// │  │    [Rewrite with AI →]  (links to /studio/[siteId]/content)      │ │
// │  └──────────────────────────────────────────────────────────────────┘ │
// │                                                                        │
// │  🟡 MEDIUM IMPACT                                                      │
// │  [ ] Add a FAQ page (your industry has high FAQ search volume)         │
// │  [ ] Your meta descriptions are missing on 3 pages                     │
// │  [ ] You have no Google reviews connected yet                          │
// │                                                                        │
// │  ✅ DONE                                                               │
// │  [x] SSL certificate active                                            │
// │  [x] Mobile responsive                                                 │
// └────────────────────────────────────────────────────────────────────────┘
//
// RECOMMENDATION ENGINE:
// GET /api/studio/[siteId]/analytics/recommendations
// Server runs a rule-based engine against site data — NO LLM needed:
//
const RECOMMENDATION_RULES = [
  {
    id: "team_photo",
    check: async (site) => {
      const assets = await prisma.siteAsset.count({ where: { siteId: site.id, assetType: "TEAM_PHOTO" } });
      return assets === 0;
    },
    priority: "HIGH",
    title: "Add a real team photo to your About page",
    description: "Sites with team photos get 34% more contact form submissions.",
    actionLabel: "Add Photo",
    actionRoute: "assets",
  },
  {
    id: "generic_headline",
    check: async (site) => {
      const homePage = await prisma.sitePage.findFirst({ where: { siteId: site.id, slug: "home" } });
      const headline = homePage?.heroHeadline?.toLowerCase() || "";
      return headline.includes("welcome to") || headline.includes("about us") || headline.length < 20;
    },
    priority: "HIGH",
    title: "Your hero headline could be more compelling",
    description: "Generic headlines reduce visitor trust. A specific, benefit-driven headline converts better.",
    actionLabel: "Rewrite with AI",
    actionRoute: "content",
  },
  {
    id: "missing_blog",
    check: async (site) => {
      const posts = await prisma.blogPost.count({ where: { siteId: site.id, status: "PUBLISHED" } });
      return posts === 0;
    },
    priority: "MEDIUM",
    title: "Start a blog to attract local search traffic",
    description: "Businesses with 1+ blog posts rank for 3x more keywords on average.",
    actionLabel: "Write a Post",
    actionRoute: "blog",
  },
  {
    id: "missing_reviews",
    check: async (site) => {
      const reviews = await prisma.testimonial.count({ where: { siteId: site.id, isPublished: true } });
      return reviews < 3;
    },
    priority: "MEDIUM",
    title: "Add at least 3 testimonials to build trust",
    description: "93% of consumers read reviews before contacting a local business.",
    actionLabel: "Add Reviews",
    actionRoute: "reviews",
  },
  {
    id: "missing_seo_descriptions",
    check: async (site) => {
      const missingCount = await prisma.sitePage.count({
        where: { siteId: site.id, isPublished: true, metaDescription: null }
      });
      return missingCount > 0;
    },
    priority: "MEDIUM",
    title: "Add meta descriptions to all pages",
    description: "{missingCount} pages are missing meta descriptions — this hurts click-through rates from Google.",
    actionLabel: "Fix SEO",
    actionRoute: "seo",
  },
  {
    id: "no_logo",
    check: async (site) => {
      const logo = await prisma.siteAsset.count({ where: { siteId: site.id, assetType: "LOGO" } });
      return logo === 0;
    },
    priority: "HIGH",
    title: "Upload your logo",
    description: "Sites with a real logo appear 40% more trustworthy to first-time visitors.",
    actionLabel: "Upload Logo",
    actionRoute: "assets",
  },
  // Add more rules as needed...
];
//
// Result is cached for 1 hour per site (Redis, key: recs:{siteId}).
// "Refresh" button invalidates cache + re-runs.
```

# =============================================================================
# STEP 9: Client Preview Share Link — /studio/[siteId]/share
# =============================================================================
# Create src/app/studio/[siteId]/share/page.tsx
# Create src/app/preview/[token]/page.tsx (public — no auth)

Lets customers share their staging site with their own clients for approval,
without giving wp-admin access or requiring a Xusmo login.

```typescript
// /studio/[siteId]/share — Link Generator:
//
// ┌──────────────────────────────────────────────────────────────────────┐
// │  Share Your Site Preview                                             │
// │                                                                      │
// │  Share a preview link with your client, business partner, or team.  │
// │  No login required to view.                                          │
// │                                                                      │
// │  Label (internal note):  [__________________________]                │
// │  Allow comments:  [ ] Yes, allow recipient to leave feedback        │
// │  Expiry:  [Never ▼]  (or 24h / 7 days / 30 days)                  │
// │                                                                      │
// │  [Generate Share Link]                                               │
// └──────────────────────────────────────────────────────────────────────┘
//
// Active Links table:
//   Link Label | Created | Expires | Views | Comments | [Revoke] [Copy]
//
// POST /api/studio/[siteId]/share
// Body: { label, canComment, expiresAt }
// Creates SiteShareLink record, returns full share URL:
//   https://xusmo.io/preview/{token}
//
// /preview/[token] — Public Preview Page (NO AUTH):
// - Verify token exists + not revoked + not expired
// - Increment SiteShareLink.viewCount, update lastViewedAt
// - Render iframe: src={site.wpUrl}
// - TOP BAR (above iframe, non-WordPress UI):
//   [Xusmo logo] "You're viewing a preview of {businessName}"
//   If canComment=true: [Leave Feedback] button
//     Opens comment popover (same click-to-pin as Studio preview)
//     Comments stored as RevisionComments (linked to SiteShareLink)
//     Site owner sees these in /studio/[siteId]/preview alongside their own
// - BOTTOM BAR: "Built with Xusmo — Get your free website →" (subtle referral)
//
// API routes:
//   POST   /api/studio/[siteId]/share              → create link
//   GET    /api/studio/[siteId]/share              → list active links
//   DELETE /api/studio/[siteId]/share/[id]         → revoke link
//   GET    /api/preview/[token]                    → validate + get site (public)
//   POST   /api/preview/[token]/comment            → add comment (public, canComment only)
```

# =============================================================================
# STEP 10: Site Health Dashboard — /studio/[siteId]/health
# =============================================================================
# Create src/app/studio/[siteId]/health/page.tsx

One-glance view of everything that could go wrong with the site.

```typescript
// LAYOUT — dashboard grid of health check cards:
//
// ┌─ OVERALL HEALTH ─────────────────────────────────────────────────────┐
// │  ✅ Excellent  (all critical checks passing)                         │
// │  Last checked: 4 minutes ago  [Check Now]                           │
// └──────────────────────────────────────────────────────────────────────┘
//
// ┌─ SECURITY ────────────────┐  ┌─ PERFORMANCE ─────────────────────────┐
// │  ✅ SSL Valid              │  │  ✅ Lighthouse 91/100                 │
// │     Expires in 87 days    │  │  ✅ Mobile responsive                 │
// │  ✅ WP Core: Up to date   │  │  ⚠️  Page load: 3.2s (target: <2s)  │
// │  ✅ Plugins: All current  │  │     [Run Optimizer]                   │
// │  ✅ No malware detected   │  └───────────────────────────────────────┘
// └───────────────────────────┘
//
// ┌─ UPTIME ──────────────────┐  ┌─ BACKUPS ──────────────────────────────┐
// │  ✅ 99.97% last 30 days   │  │  ✅ Last backup: 6 hours ago          │
// │  Last downtime: None      │  │     Daily via UpdraftPlus             │
// │  [View uptime log]        │  │  ✅ Backup stored: 30 days            │
// └───────────────────────────┘  │  [Download Latest Backup]             │
//                                └────────────────────────────────────────┘
//
// ┌─ FORMS ───────────────────────────────────────────────────────────────┐
// │  ✅ Contact form: Working   ✅ Quote form: Working                   │
// │     Last tested: 2 hours ago    [Run Form Test]                      │
// └──────────────────────────────────────────────────────────────────────┘
//
// DATA SOURCES:
//   SSL expiry:        query Site.sslActive + check expiry via HTTPS
//   Plugin updates:    GET /api/studio/[siteId]/health/plugin-status
//                      → WP-CLI: wp plugin list --update=available --format=json
//   Malware:           last SecurityAgent scan (AgentLog)
//   Lighthouse score:  latest QaReport
//   Uptime:            MonitoringAgent logs (AgentLog)
//   Backups:           WP-CLI: wp plugin run updraftplus --run-now (or query last run)
//   Form tests:        POST request to WP form endpoint with test data
//
// [Check Now] button:
//   POST /api/studio/[siteId]/health/check
//   Enqueues a lightweight health-check job that runs:
//     - SSL check via fetch with timeout
//     - wp plugin list (via WP-CLI executor)
//     - wp core check-update (via WP-CLI executor)
//     - Test form submission
//   Returns updated health status within ~15 seconds
//
// [Download Latest Backup]:
//   wp eval 'echo UpdraftPlus_Options::get_updraft_dir();' → get backup dir path
//   List files → offer download URL via signed R2 link
//
// API routes:
//   GET  /api/studio/[siteId]/health         → aggregated health data
//   POST /api/studio/[siteId]/health/check   → trigger fresh check
```

# =============================================================================
# STEP 11: Team Access — /studio/[siteId]/team
# =============================================================================
# Create src/app/studio/[siteId]/team/page.tsx

Let customers invite a VA, business partner, or web coordinator to help manage
their site without sharing their Xusmo login.

```typescript
// LAYOUT:
// ┌─ HEADER ────────────────────────────────────────────────────────────┐
// │  "Team Access"  |  [Invite Someone]                                 │
// └─────────────────────────────────────────────────────────────────────┘
//
// Current members:
//   [Avatar] George (you — Owner) · Full Access
//   [Avatar] Sarah (sarah@va.com) · Editor · Accepted Jan 2026  [Remove]
//
// Pending invites:
//   mike@partner.com · Viewer · Sent 3 days ago  [Resend] [Cancel]
//
// INVITE MODAL:
//   Email address
//   Role: Viewer | Editor | Manager (role descriptions shown)
//     Viewer:  Can see all Studio screens. Cannot save changes.
//     Editor:  Can edit content, blog, assets, reviews.
//     Manager: Full Studio access. Cannot delete site or change billing.
//   [Send Invite]
//
// POST /api/studio/[siteId]/team/invite
// Body: { email, role }
// 1. Create TeamMember record (status=PENDING)
// 2. Send invite email via SendGrid:
//    Subject: "{ownerName} invited you to manage {businessName}'s website"
//    Body: what they'll be able to do, accept link
//    CTA: "Accept Invite" → /invite/{token}
//
// /invite/[token] page (public):
//   "You've been invited to manage {businessName}'s website on Xusmo"
//   If not logged in → redirect to signup/login, then return to this page
//   If logged in → "Accept & Open Studio" button
//   POST /api/invite/[token]/accept → set TeamMember.inviteeUserId, status=ACCEPTED
//   Redirect to /studio/{siteId}
//
// PERMISSION ENFORCEMENT:
// In all Studio API routes, check: is requesting user the site owner OR
// has a TeamMember record with ACCEPTED status and sufficient role?
//   VIEWER: GET routes only
//   EDITOR: GET + content/blog/assets/reviews PUT/POST routes
//   MANAGER: all routes except DELETE site and billing
//
// Create a helper:
//   src/lib/studio/permissions.ts
//   checkStudioPermission(userId, siteId, required: "view"|"edit"|"manage"): Promise<boolean>
//
// API routes:
//   GET    /api/studio/[siteId]/team              → list members + pending
//   POST   /api/studio/[siteId]/team/invite       → send invite
//   DELETE /api/studio/[siteId]/team/[memberId]   → remove member
//   POST   /api/invite/[token]/accept             → accept invite
```

# =============================================================================
# STEP 12: Custom CSS Editor (Enhancement to Design Panel)
# =============================================================================
# Update src/app/studio/[siteId]/design/page.tsx

Add an "Advanced" section at the bottom of the design panel for power users.

```typescript
// ADVANCED SECTION (collapsed by default, expandable):
// "Custom CSS — For advanced users. CSS is applied site-wide."
//
// ┌─ CUSTOM CSS ────────────────────────────────────────────────────────┐
// │  /* Example: hide the footer copyright line */                      │
// │  .site-footer .copyright { display: none; }                        │
// │                                                                     │
// │  /* Example: make all headings uppercase */                        │
// │  h1, h2, h3 { text-transform: uppercase; }                        │
// └─────────────────────────────────────────────────────────────────────┘
// [Apply CSS]  ⚠️ "Incorrect CSS may affect how your site looks"
//
// Use a <textarea> with monospace font. No full code editor dependency needed.
// Character limit: 5,000 chars.
//
// SAVE FLOW:
// PUT /api/studio/[siteId]/design/custom-css
// Body: { css: string }
// Server validates (check for <script> tags, XSS — reject if found)
// Enqueues job → Worker uses WP-CLI to write to wp_global_styles additionalCss:
//
//   wp eval '
//     $post_id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_type = '"'"'wp_global_styles'"'"' LIMIT 1");
//     $content = json_decode(get_post_field("post_content", $post_id), true);
//     $content["styles"]["css"] = "{escapedCss}";
//     wp_update_post(["ID" => $post_id, "post_content" => json_encode($content)]);
//   '
//
// This is the CANONICAL approach — writes to wp_global_styles.styles.css,
// same as the WordPress editor's "Additional CSS" feature.
// wp_global_styles takes precedence over theme.json.
//
// Store in DB: Add customCss String? @db.Text to Site model.
// Show "Last updated: X minutes ago" after apply.
```

# =============================================================================
# STEP 13: Studio Left Nav — Update with New Screens
# =============================================================================
# Update src/app/studio/[siteId]/layout.tsx

Add all new screens to the icon rail nav with badge counts where relevant.

```typescript
// Updated NAV_ITEMS (replace existing):
const NAV_ITEMS = [
  // BUILD PHASE
  { route: "build",     icon: Hammer,      label: "Build Progress",  phase: "build",    showWhen: ["BUILDING", "PREVIEW_READY", "QA_RUNNING"] },

  // MANAGE PHASE (always visible once PREVIEW_READY or later)
  { route: "preview",   icon: Eye,         label: "Preview & Review",phase: "manage"  },
  { route: "content",   icon: PenLine,     label: "Content",         phase: "manage"  },
  { route: "blog",      icon: BookOpen,    label: "Blog",            phase: "manage"  },
  { route: "assets",    icon: ImagePlus,   label: "Assets",          phase: "manage"  },
  { route: "reviews",   icon: Star,        label: "Reviews",         phase: "manage"  },
  { route: "leads",     icon: Inbox,       label: "Leads",           phase: "manage",   badge: "newLeadsCount" },

  // DIVIDER

  // SETTINGS PHASE
  { route: "pages",     icon: LayoutGrid,  label: "Pages",           phase: "settings" },
  { route: "seo",       icon: SearchCheck, label: "SEO",             phase: "settings" },
  { route: "design",    icon: Palette,     label: "Design",          phase: "settings" },
  { route: "domain",    icon: Globe,       label: "Domain",          phase: "settings" },

  // DIVIDER

  // GROWTH
  { route: "analytics", icon: BarChart2,   label: "Analytics",       phase: "growth"  },
  { route: "health",    icon: ShieldCheck, label: "Site Health",     phase: "growth",   badge: "healthAlertCount" },
  { route: "share",     icon: Share2,      label: "Share Preview",   phase: "growth"  },
  { route: "team",      icon: Users,       label: "Team",            phase: "growth"  },

  // PUBLISH
  { route: "publish",   icon: Rocket,      label: "Publish",         phase: "publish",
    badge: site.status === "STAGING" ? "!" : null },
];
//
// Badges: fetch counts at layout level (server component) and pass down:
//   newLeadsCount = count of FormSubmissions where status=NEW for this site
//   healthAlertCount = count of failing health checks (computed by health API)
//
// showWhen: some nav items only appear during certain build statuses
// (e.g. "Build Progress" only relevant while still building)
//
// On mobile: nav collapses to a bottom tab bar showing only 5 most important icons
```

# =============================================================================
# STEP 14: Notification Center
# =============================================================================
# Create src/app/studio/[siteId]/notifications/ (or as a global top-bar dropdown)

Centralise all events across all sites into one notification feed.

```typescript
// NOTIFICATION BELL in Studio top bar (global, not per-site):
// Click → dropdown panel: "Notifications"
//
// Notification types (pulled from multiple sources):
//   🔔 NEW LEAD — "New quote request from John S. · Mario's Plumbing · 5 min ago"
//      → links to /studio/{siteId}/leads
//   ✅ BUILD COMPLETE — "Your site is ready to review · Mario's Plumbing · 1 hour ago"
//      → links to /studio/{siteId}/preview
//   ✅ REVISION DONE — "Your revision has been applied · Mario's Plumbing"
//      → links to /studio/{siteId}/preview
//   ⚠️  HEALTH ALERT — "SSL expires in 14 days · Mario's Plumbing"
//      → links to /studio/{siteId}/health
//   🎉 SITE LIVE — "Your site went live! · Mario's Plumbing"
//      → links to /studio/{siteId}/analytics
//   💬 CLIENT COMMENT — "Your client left feedback on the preview"
//      → links to /studio/{siteId}/preview
//
// Implementation:
// Add Notification model to schema:
```prisma
model Notification {
  id     String @id @default(cuid())
  userId String

  type      NotificationType
  title     String
  body      String?
  linkUrl   String?
  siteId    String?
  isRead    Boolean  @default(false)
  readAt    DateTime?

  createdAt DateTime @default(now())

  @@index([userId, isRead])
  @@index([userId, createdAt])
}

enum NotificationType {
  NEW_LEAD
  BUILD_COMPLETE
  REVISION_DONE
  HEALTH_ALERT
  SITE_LIVE
  CLIENT_COMMENT
  TEAM_INVITE
}
```
//
// CREATE notifications from:
//   - FormSubmission webhook handler (NEW_LEAD)
//   - Publishing Agent completion (SITE_LIVE, BUILD_COMPLETE)
//   - Revision Agent completion (REVISION_DONE)
//   - Health check failures (HEALTH_ALERT)
//   - Public preview comments (CLIENT_COMMENT)
//   - Team invite acceptance (TEAM_INVITE)
//
// API routes:
//   GET  /api/notifications           → latest 20, unread count
//   PUT  /api/notifications/read-all  → mark all read
//   PUT  /api/notifications/[id]/read → mark single read
```

# =============================================================================
# DONE — Studio Enrichment Deliverables
# =============================================================================
#
# NEW SCREENS:
# ✅ Leads dashboard — WPForms submissions inbox with CRM status, export CSV
# ✅ Blog manager — create/edit posts, AI drafting, schedule, WP sync
# ✅ Review manager — manual add, Google import, publish/hide, WP sync
# ✅ Client share link — token-based preview URL with optional commenting
# ✅ Site health — SSL, plugins, uptime, backups, forms — all in one card grid
# ✅ Team access — invite VA/partner with role-based permissions
#
# ENHANCEMENTS TO EXISTING SCREENS:
# ✅ Content editor → AI regeneration per block (inline diff accept/dismiss)
# ✅ Content editor → Version history drawer + one-click rollback
# ✅ SEO panel → Social OG preview editor (Facebook/Twitter/LinkedIn cards)
# ✅ SEO panel → AI-generated OG images via Flux/Imagen
# ✅ Analytics → Rule-based recommendation engine (8+ checks, no LLM needed)
# ✅ Design panel → Custom CSS editor (writes to wp_global_styles.styles.css)
#
# INFRASTRUCTURE:
# ✅ Studio nav updated with all new screens + live badge counts
# ✅ Notification center (bell icon, global across all sites)
# ✅ Studio permission system (checkStudioPermission for team roles)
# ✅ WPForms webhook receiver → FormSubmission pipeline
# ✅ Schema additions: FormSubmission, BlogPost, Testimonial, SiteShareLink,
#    ContentVersion, TeamMember, Notification
