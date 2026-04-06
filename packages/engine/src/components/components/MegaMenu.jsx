import { useState } from 'react'

export function MegaMenu({ columns = [] }) {
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
        <span>Menu</span>
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
        <div
          className="absolute left-0 top-full mt-1 rounded-xl shadow-xl z-50 p-6"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          role="menu"
        >
          <div className="flex gap-8">
            {columns.map((column) => (
              <div className="min-w-[160px]" key={column.title}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--muted, #6b7280)', fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {(column.items || []).map((item) => (
                    <li key={item.label} role="menuitem">
                      <a
                        className="block px-2 py-1.5 rounded-md text-sm no-underline transition-colors duration-150 hover:brightness-95"
                        style={{ color: 'var(--text, #1c1c1c)' }}
                        href={item.href || '#'}
                      >
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
