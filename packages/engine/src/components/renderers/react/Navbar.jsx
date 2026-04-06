import { useState, useEffect } from 'react'
import { onImgError } from './imgFallback'

export function Navbar({ logo, logoUrl, links = [], cta }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isPlaceholder = !logoUrl || (logoUrl.includes('placehold.co') && !logoUrl.startsWith('data:'))
  const hasHome = links.some(l => l.href === '/' || (l.label || '').toLowerCase() === 'home')
  const allLinks = hasHome ? links : [{ label: 'Home', href: '/' }, ...links]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-[var(--border,#e5e7eb)]/60 shadow-sm' : 'bg-transparent border-b border-transparent'}`}
      style={{ height: '72px' }}
    >
      <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6 lg:px-12 h-full">
        {/* Logo — left */}
        <a className="flex items-center gap-2.5 no-underline shrink-0" href="/">
          {isPlaceholder
            ? <span className="text-xl font-bold tracking-tight text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{logo || 'SiteName'}</span>
            : <img src={logoUrl} alt={logo || 'Logo'} className="h-10 w-auto object-contain" onError={e => onImgError(e, 40, 40)} />
          }
        </a>

        {/* Desktop links — center */}
        <ul className="hidden md:flex items-center gap-1 list-none p-0 m-0 absolute left-1/2 -translate-x-1/2">
          {allLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="inline-block px-4 py-2 text-sm font-medium text-[var(--muted,#6b7280)] hover:text-[var(--text,#1c1c1c)] rounded-lg hover:bg-[var(--text,#1c1c1c)]/[0.06] transition-all duration-200 no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA — right */}
        <div className="hidden md:flex items-center">
          {cta && (
            <a
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full text-white no-underline hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              href={cta.href || '#contact'}
              style={{
                background: 'var(--accent, #3b82f6)',
                boxShadow: '0 4px 14px -2px var(--accent, #3b82f6)',
              }}
            >
              {cta.label}
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer z-50"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
        </button>
      </div>

      {/* Mobile fullscreen overlay */}
      <div
        className={`md:hidden fixed inset-0 top-[72px] z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--bg, #ffffff)' }}
      >
        {allLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-semibold text-[var(--text,#1c1c1c)] no-underline hover:opacity-60 transition-opacity duration-200"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {link.label}
          </a>
        ))}
        {cta && (
          <a
            className="mt-4 inline-flex items-center px-8 py-3.5 text-base font-semibold rounded-full text-white no-underline"
            href={cta.href || '#contact'}
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'var(--accent, #3b82f6)',
              boxShadow: '0 4px 14px -2px var(--accent, #3b82f6)',
            }}
          >
            {cta.label}
          </a>
        )}
      </div>
    </nav>
  )
}
