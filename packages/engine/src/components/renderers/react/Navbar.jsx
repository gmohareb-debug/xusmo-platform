import { useState } from 'react'
import { onImgError } from './imgFallback'

export function Navbar({ logo, logoUrl, links = [], cta }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isPlaceholder = !logoUrl || (logoUrl.includes('placehold.co') && !logoUrl.startsWith('data:'))

  const hasHome = links.some(l => l.href === '/' || (l.label || '').toLowerCase() === 'home')
  const allLinks = hasHome ? links : [{ label: 'Home', href: '/' }, ...links]

  return (
    <nav className="navbar sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
      <div className="navbar__inner flex items-center justify-between max-w-[1200px] mx-auto px-6 lg:px-12 h-[72px]">
        <a className="navbar__logo flex items-center gap-2 no-underline" href="/">
          {isPlaceholder
            ? <span className="navbar__logo-text text-xl font-bold tracking-tight text-[var(--text,#1c1c1c)]">{logo || 'SiteName'}</span>
            : <img src={logoUrl} alt={logo || 'Logo'} className="navbar__logo-img h-10 w-auto object-contain" onError={e => onImgError(e, 40, 40)} />
          }
        </a>

        <button
          className="navbar__toggle md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text,#1c1c1c)] rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
        </button>

        <div className={`navbar__menu ${menuOpen ? 'navbar__menu--open max-md:translate-x-0 max-md:opacity-100' : 'max-md:translate-x-full max-md:opacity-0 max-md:pointer-events-none'} max-md:fixed max-md:inset-0 max-md:top-[72px] max-md:bg-white/95 max-md:backdrop-blur-xl max-md:flex max-md:flex-col max-md:items-center max-md:justify-start max-md:pt-12 max-md:gap-8 max-md:transition-all max-md:duration-300 md:flex md:items-center md:gap-1`}>
          <ul className="navbar__links flex max-md:flex-col max-md:items-center max-md:gap-4 md:gap-1 list-none p-0 m-0">
            {allLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-block px-4 py-2 text-sm font-medium text-[var(--text,#1c1c1c)]/70 hover:text-[var(--text,#1c1c1c)] rounded-lg hover:bg-black/[0.04] transition-all duration-200 no-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {cta && (
            <a
              className="button button--primary navbar__cta inline-block ml-4 px-6 py-2.5 text-sm font-semibold rounded-full bg-[var(--accent,#1f4dff)] text-white no-underline hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              href={cta.href || '#contact'}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
