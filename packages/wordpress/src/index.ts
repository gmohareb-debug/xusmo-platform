// @xusmo/wordpress — Gutenberg converter + WP-CLI sync
//
// Converts canonical SiteDocument JSON into WordPress Gutenberg blocks,
// and syncs pages/theme/media via WP REST API or WP-CLI.

import type { SiteDocument, PageDef, SectionDef } from '@xusmo/engine'

/** Convert a SiteDocument to Gutenberg block markup for all pages */
export function toGutenbergBlocks(doc: SiteDocument): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, page] of Object.entries(doc.pages)) {
    result[key] = pageToBlocks(page)
  }
  return result
}

/** Convert a single page's sections to Gutenberg HTML */
function pageToBlocks(page: PageDef): string {
  return page.sections
    .map(section => sectionToBlock(section))
    .join('\n\n')
}

/** Convert one section to a Gutenberg block comment + HTML */
function sectionToBlock(section: SectionDef): string {
  const propsJson = JSON.stringify(section.props || {})
  return [
    `<!-- wp:xusmo/${section.component} ${propsJson} -->`,
    `<div class="wp-block-xusmo-${section.component}"></div>`,
    `<!-- /wp:xusmo/${section.component} -->`,
  ].join('\n')
}

/** Sync a SiteDocument to a WordPress site via REST API */
export async function syncToWordPress(
  doc: SiteDocument,
  wpUrl: string,
  auth: { username: string; password: string }
): Promise<{ synced: string[]; errors: string[] }> {
  const blocks = toGutenbergBlocks(doc)
  const synced: string[] = []
  const errors: string[] = []
  const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')

  for (const [slug, content] of Object.entries(blocks)) {
    try {
      // Check if page exists
      const searchRes = await fetch(`${wpUrl}/wp-json/wp/v2/pages?slug=${slug}`, {
        headers: { Authorization: `Basic ${credentials}` },
      })
      const existing = await searchRes.json()

      const pageData = {
        title: doc.pages[slug]?.meta?.title || slug,
        slug,
        content,
        status: 'publish' as const,
      }

      if (Array.isArray(existing) && existing.length > 0) {
        // Update existing page
        await fetch(`${wpUrl}/wp-json/wp/v2/pages/${existing[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(pageData),
        })
      } else {
        // Create new page
        await fetch(`${wpUrl}/wp-json/wp/v2/pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(pageData),
        })
      }
      synced.push(slug)
    } catch (err: any) {
      errors.push(`${slug}: ${err.message}`)
    }
  }

  return { synced, errors }
}
