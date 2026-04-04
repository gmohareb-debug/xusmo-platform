const SOCIAL_ICONS = {
  facebook: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  twitter: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#fff" d="M9.545 15.568V8.432L15.818 12z"/></svg>,
}

function SocialIcon({ label, icon }) {
  const key = (label || '').toLowerCase().replace(/[^a-z]/g, '')
  const match = Object.keys(SOCIAL_ICONS).find(k => key.includes(k))
  if (match) return SOCIAL_ICONS[match]
  return <span className="text-sm font-medium">{icon || label?.charAt(0) || '?'}</span>
}

export function Footer({ text, links = [], columns = [], logo, tagline, social = [], address }) {
  const hasColumns = columns.length > 0
  const copyrightText = text
    ? text.replace(/\u00a9\s*\d{4}|©\s*\d{4}|\(c\)\s*\d{4}/gi, (m) =>
        m.replace(/\d{4}/, new Date().getFullYear().toString())
      )
    : null

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_2fr] gap-12 lg:gap-24">
          {/* Brand column */}
          {(logo || tagline || address) && (
            <div className="space-y-5">
              {logo && (
                <span
                  className="block text-2xl font-bold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {logo}
                </span>
              )}
              {tagline && (
                <p className="text-sm leading-relaxed text-gray-400 max-w-xs m-0">{tagline}</p>
              )}
              {address && (
                <p className="text-sm text-gray-500 m-0">{address}</p>
              )}
              {social.length > 0 && (
                <div className="flex items-center gap-3 pt-3">
                  {social.map((s, i) => (
                    <a
                      key={i}
                      href={s.href || '#'}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.07] text-gray-400 hover:text-white hover:bg-white/[0.15] transition-all duration-300 no-underline"
                      aria-label={s.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon label={s.label} icon={s.icon} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link columns */}
          {hasColumns && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12">
              {columns.map((col, i) => (
                <div key={i} className="space-y-4">
                  {col.title && (
                    <h4 className="text-xs font-semibold text-white uppercase tracking-[0.15em] m-0">{col.title}</h4>
                  )}
                  <div className="flex flex-col gap-3">
                    {col.links?.map((link, j) => (
                      <a
                        key={j}
                        href={link.href || '#'}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 no-underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {copyrightText && (
            <p className="text-xs text-gray-500 m-0">{copyrightText}</p>
          )}
          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200 no-underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
