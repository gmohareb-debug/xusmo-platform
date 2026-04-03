import { useState } from 'react'
import { onImgError } from './imgFallback'

// Desktop override removed — handled by styles.css

export function Navbar({ logo, logoUrl, links = [], cta }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Use text logo if logoUrl is a placehold.co placeholder or missing
  const isPlaceholder = !logoUrl || (logoUrl.includes('placehold.co') && !logoUrl.startsWith('data:'))

  // Ensure "Home" link exists - prepend if missing
  const hasHome = links.some(l => l.href === '/' || (l.label || '').toLowerCase() === 'home')
  const allLinks = hasHome ? links : [{ label: 'Home', href: '/' }, ...links]

  return (
    <nav className="navbar">
      
      <div className="navbar__inner">
        <a className="navbar__logo" href="/">
          {isPlaceholder
            ? <span className="navbar__logo-text">{logo || 'SiteName'}</span>
            : <img src={logoUrl} alt={logo || 'Logo'} className="navbar__logo-img" onError={e => onImgError(e, 40, 40)} />
          }
        </a>

        <button
          className="navbar__toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`} />
        </button>

        <div className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
          <ul className="navbar__links">
            {allLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          {cta && (
            <a className="button button--primary navbar__cta" href={cta.href || '#contact'}>
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
