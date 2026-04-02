// @xusmo/publish — deploy adapters for generated sites
//
// Supports publishing to Lumin Hosting, static export, and tar.gz archive.

import type { SiteDocument } from '@xusmo/engine'

export interface PublishResult {
  ok: boolean
  url?: string
  error?: string
  websiteId?: number
  slug?: string
}

export interface LuminConfig {
  apiUrl: string
  apiKey: string
}

/** Publish a site to Lumin Hosting via the /v1/publish-site API */
export async function publishToLumin(
  doc: SiteDocument,
  archive: Buffer | Blob,
  config: LuminConfig,
  options: {
    email: string
    slug: string
    siteTitle: string
    oldUrl: string
    callbackUrl?: string
  }
): Promise<PublishResult> {
  const form = new FormData()
  form.append('email', options.email)
  form.append('slug', options.slug)
  form.append('site_title', options.siteTitle)
  form.append('old_url', options.oldUrl)
  form.append('callback_url', options.callbackUrl || '')
  form.append('archive', new Blob([archive]), 'export.tar.gz')

  const res = await fetch(`${config.apiUrl}/v1/publish-site`, {
    method: 'POST',
    headers: { 'X-API-Key': config.apiKey },
    body: form,
  })

  const data = await res.json()

  if (!res.ok) {
    return { ok: false, error: data.error || `HTTP ${res.status}` }
  }

  return {
    ok: true,
    websiteId: data.website_id,
    slug: data.slug,
    url: data.temporary_domain ? `https://${data.temporary_domain}` : undefined,
  }
}

/** Export a site as a static HTML archive (tar.gz) */
export async function exportStatic(
  doc: SiteDocument,
  renderedPages: Record<string, string>,
): Promise<Buffer> {
  // Placeholder — will integrate with wordpress package for HTML rendering
  throw new Error('Static export not yet implemented')
}
