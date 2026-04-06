import { useState } from 'react'

export function DropdownNav({ label, items = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:brightness-95"
        style={{
          backgroundColor: 'var(--surface, #fff)',
          color: 'var(--text, #1c1c1c)',
        }}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        <span>{label}</span>
        <svg
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
        <ul
          className="absolute left-0 top-full mt-1 min-w-[180px] rounded-lg py-1 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          role="menu"
        >
          {items.map((item) => (
            <li key={item.label} role="menuitem">
              <a
                className="block px-4 py-2 text-sm transition-colors duration-150 no-underline hover:brightness-95"
                style={{
                  color: 'var(--text, #1c1c1c)',
                }}
                href={item.href || '#'}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
