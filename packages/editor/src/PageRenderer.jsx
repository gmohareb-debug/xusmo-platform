import { useEffect, useState, useRef } from 'react'
import componentRegistry from '@xusmo/engine/components'
import { fetchLayout } from './services/layoutService'

/**
 * Decode Unicode escape sequences in all string values.
 * Handles:
 *   - \uXXXX (BMP characters like \u00A9 → ©)
 *   - \uD83C\uDF3F (escaped surrogate pairs → emoji)
 *   - ud83dudc8e (malformed surrogates without backslash prefix → emoji)
 */
function decodeUnicode(obj) {
  if (typeof obj === 'string') {
    let decoded = obj

    // Pass 1: malformed surrogate pairs WITHOUT backslash (ud83dudc8e → emoji)
    decoded = decoded.replace(/(?:^|(?<=\s|[^\\a-zA-Z]))u(d[89ab][0-9a-f]{2})u(d[c-f][0-9a-f]{2})/gi,
      (_, hi, lo) => {
        try {
          const code = (parseInt(hi, 16) - 0xD800) * 0x400 + (parseInt(lo, 16) - 0xDC00) + 0x10000
          return String.fromCodePoint(code)
        } catch { return _ }
      }
    )

    // Pass 2: escaped surrogate pairs WITH backslash (\uD83C\uDF3F → emoji)
    decoded = decoded.replace(/\\u(D[89ABab][0-9a-fA-F]{2})\\u(D[C-Fc-f][0-9a-fA-F]{2})/g,
      (_, hi, lo) => {
        try {
          const code = (parseInt(hi, 16) - 0xD800) * 0x400 + (parseInt(lo, 16) - 0xDC00) + 0x10000
          return String.fromCodePoint(code)
        } catch { return _ }
      }
    )

    // Pass 3: remaining BMP escapes (\u00A9 → ©)
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )

    // Pass 4: remaining malformed BMP without backslash (u00a9 → ©)
    // Only match if it looks like a standalone escape (not part of a word)
    decoded = decoded.replace(/(?:^|(?<=[\s"'({,]))u([0-9a-fA-F]{4})(?=[\s"')},.!?;:]|$)/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )

    // Pass 5: variation selector "ufe0f" or "uFE0F" appearing after emoji (e.g., "🛠ufe0f" → "🛠️")
    decoded = decoded.replace(/([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}])u(fe0f)/giu, (_, emoji, vs) =>
      emoji + String.fromCharCode(parseInt(vs, 16))
    )

    return decoded
  }
  if (Array.isArray(obj)) return obj.map(decodeUnicode)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = decodeUnicode(v)
    }
    return out
  }
  return obj
}

/**
 * PageRenderer renders a layout as React components from the registry.
 *
 * Props:
 *   pageId         — WordPress page ID to fetch layout from (used when no override)
 *   fallbackLayout — fallback layout if fetch fails
 *   onThemeLoaded  — callback when theme is fetched from WP
 *   overrideLayout — if set, renders this layout instead of fetching from WP
 *   overrideTheme  — if set, uses this theme (for live editing)
 *   onSectionClick — callback(sectionIndex) when a section is clicked
 *   selectedSection — index of the selected section (adds highlight ring)
 */
function PageRenderer({
  pageId,
  fallbackLayout,
  onThemeLoaded,
  overrideLayout,
  overrideTheme,
  onSectionClick,
  selectedSection,
}) {
  const [fetchedLayout, setFetchedLayout] = useState(null)
  const [status, setStatus] = useState('loading')
  const onThemeRef = useRef(onThemeLoaded)
  onThemeRef.current = onThemeLoaded

  // Use override layout if provided, otherwise use fetched layout
  const layout = overrideLayout || fetchedLayout

  useEffect(() => {
    // Skip fetching if we have an override layout
    if (overrideLayout) {
      setStatus('ready')
      return
    }

    let canceled = false

    const load = async () => {
      setStatus('loading')
      try {
        const data = await fetchLayout(pageId)
        if (!canceled && data.layout?.sections?.length) {
          setFetchedLayout(data.layout)
          setStatus('ready')
          if (data.theme && onThemeRef.current) {
            onThemeRef.current(data.theme)
          }
          return
        }
      } catch (error) {
        console.warn('Layout fetch failed, using fallback.', error)
      }

      if (!canceled) {
        if (fallbackLayout) {
          setFetchedLayout(fallbackLayout)
          setStatus('fallback')
        } else {
          setStatus('empty')
        }
      }
    }

    load()
    return () => {
      canceled = true
    }
  }, [pageId, fallbackLayout, overrideLayout])

  // When overrideTheme is set, notify parent (for CSS custom property updates)
  useEffect(() => {
    if (overrideTheme && onThemeRef.current) {
      onThemeRef.current(overrideTheme)
    }
  }, [overrideTheme])

  return (
    <section className="page">
      {!overrideLayout && (
        <div className="page__meta">
          <span className="eyebrow">Rendering</span>
          <span className="status-pill status-pill--info">{status}</span>
        </div>
      )}

      {layout?.sections?.length ? (
        layout.sections.map((section, index) => {
          const Component = componentRegistry[section.component]
          if (!Component) {
            return (
              <div className="section section--missing" key={`missing-${index}`}>
                Unknown component: {section.component}
              </div>
            )
          }

          const l = section.layout || {}
          const isSelected = selectedSection === index
          const cls = [
            'site-section',
            l.background ? `site-section--bg-${l.background}` : '',
            l.padding ? `site-section--pad-${l.padding}` : '',
            l.width === 'full' ? 'site-section--full' : '',
            l.align ? `site-section--align-${l.align}` : '',
            isSelected ? 'site-section--selected' : '',
            onSectionClick ? 'site-section--clickable' : '',
          ].filter(Boolean).join(' ')

          // AI-controlled style tokens → CSS custom properties
          const styleTokens = { ...(section.style || {}) }

          // Add selection ring via inline style when selected
          if (isSelected) {
            styleTokens.outline = '3px solid var(--color-accent, #3b82f6)'
            styleTokens.outlineOffset = '2px'
          }

          // Generate a section ID for anchor linking
          const sectionId = section.props?.id || {
            'hero': 'hero', 'hero-image': 'hero', 'hero-video': 'hero',
            'product-grid': 'products', 'category-showcase': 'categories',
            'services-section': 'services', 'features': 'features',
            'testimonials': 'testimonials', 'pricing-table': 'pricing',
            'about-section': 'about', 'contact-form': 'contact',
            'contact': 'contact', 'faq-accordion': 'faq',
          }[section.component] || undefined

          return (
            <div
              className={cls}
              style={styleTokens}
              key={`${section.component}-${index}`}
              id={sectionId}
              onClick={onSectionClick ? (e) => {
                e.stopPropagation()
                onSectionClick(index)
              } : undefined}
            >
              <div className="site-section__inner">
                <Component {...decodeUnicode(section.props)} />
              </div>
            </div>
          )
        })
      ) : (
        <p className="section section--empty">
          No layout sections available. Save a layout to WordPress and reload.
        </p>
      )}
    </section>
  )
}

export default PageRenderer
