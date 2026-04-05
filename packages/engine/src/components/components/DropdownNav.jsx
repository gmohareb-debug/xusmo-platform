import { useState } from 'react'

export function DropdownNav({ label, items = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`dropdown-nav ${open ? 'dropdown-nav--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="dropdown-nav__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        <span className="dropdown-nav__label">{label}</span>
        <svg
          className="dropdown-nav__chevron"
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
        <ul className="dropdown-nav__menu" role="menu">
          {items.map((item) => (
            <li className="dropdown-nav__item" key={item.label} role="menuitem">
              <a className="dropdown-nav__link" href={item.href || '#'}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
