import { useState } from 'react'

export function MegaMenu({ columns = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`mega-menu ${open ? 'mega-menu--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="mega-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        <span className="mega-menu__trigger-label">Menu</span>
        <svg
          className="mega-menu__chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mega-menu__panel" role="menu">
          <div className="mega-menu__columns">
            {columns.map((column) => (
              <div className="mega-menu__column" key={column.title}>
                <h3 className="mega-menu__column-title">{column.title}</h3>
                <ul className="mega-menu__list">
                  {(column.items || []).map((item) => (
                    <li className="mega-menu__item" key={item.label} role="menuitem">
                      <a className="mega-menu__link" href={item.href || '#'}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
