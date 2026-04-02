const API_BASE = (import.meta?.env?.VITE_WORDPRESS_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  if (!API_BASE) throw new Error('No WordPress API base URL configured')

  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Layout API error: ${response.status} ${body}`)
  }

  return response.json()
}

export async function fetchLayout(pageId) {
  const data = await request(`/wp-json/ai-builder/v1/get-layout/${pageId}`)
  return { layout: data.layout, theme: data.theme }
}

export async function saveLayout(layout, pageId, theme = null) {
  const body = { page_id: pageId, layout }
  if (theme) body.theme = theme
  return request('/wp-json/ai-builder/v1/save-layout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function saveMultiPageLayout(pages, pageIdMap, theme = null) {
  const results = {}
  for (const [pageName, layout] of Object.entries(pages)) {
    const pageId = pageIdMap[pageName]
    if (!pageId) {
      console.warn(`No page ID mapped for "${pageName}" — skipping`)
      continue
    }
    results[pageName] = await saveLayout(layout, pageId, theme)
  }
  return results
}

// ── Single-blob site storage (for dynamic page sets) ──

const SITE_PAGE_ID = 2 // Master page that stores the entire site JSON

export async function fetchSite() {
  const data = await request(`/wp-json/ai-builder/v1/get-site`)
  return data.site || null
}

export async function saveSite(siteData) {
  return request('/wp-json/ai-builder/v1/save-site', {
    method: 'POST',
    body: JSON.stringify({ site: siteData }),
  })
}
