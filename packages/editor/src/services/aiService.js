const AI_BASE = (import.meta?.env?.VITE_AI_SERVICE_URL || '').replace(/\/$/, '')

/**
 * @param {string}  prompt        User's natural-language request
 * @param {object}  [options]
 * @param {string}  [options.mode]          'full' | 'theme-only' | 'layout-only'
 * @param {object}  [options.currentTheme]  Existing theme object (so AI can preserve it)
 * @param {object}  [options.currentPages]  Existing page layouts keyed by page name
 */
export async function generateWebsite(prompt, options = {}) {
  const { mode = 'full', currentTheme = null, currentPages = null } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000)

  const response = await fetch(`${AI_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      mode,
      currentTheme,
      currentPages,
    }),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `AI service error: ${response.status}`)
  }

  return response.json()
}
