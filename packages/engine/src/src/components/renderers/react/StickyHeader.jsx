import { useState, useEffect } from 'react'

export function StickyHeader({ logo, links = [], cta }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setStuck(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky-header ${stuck ? 'sticky-header--stuck' : ''}`}>
      <div className="sticky-header__inner">
        <a className="sticky-header__logo" href="/">
          {logo || 'SiteName'}
        </a>

        <button
          className="sticky-header__toggle"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`sticky-header__hamburger ${menuOpen ? 'sticky-header__hamburger--open' : ''}`} />
        </button>

        <nav className={`sticky-header__nav ${menuOpen ? 'sticky-header__nav--open' : ''}`}>
          <ul className="sticky-header__links">
            {links.map((link) => (
              <li className="sticky-header__link-item" key={link.label}>
                <a className="sticky-header__link" href={link.href || '#'}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {cta && (
            <a className="button button--primary sticky-header__cta" href={cta.href || '#'}>
              {cta.label}
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
