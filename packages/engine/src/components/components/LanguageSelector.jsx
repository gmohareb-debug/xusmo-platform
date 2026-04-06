import { useState, useEffect, useRef } from 'react'

export function LanguageSelector({ languages = [], current }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(current)
  const selectorRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!languages.length) return null
  const currentLanguage = languages.find((lang) => lang.code === selected) || languages[0]

  function handleSelect(code) {
    setSelected(code)
    setOpen(false)
  }

  return (
    <div className="relative inline-block" ref={selectorRef}>
      <button
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:brightness-95"
        style={{
          backgroundColor: 'var(--surface, #fff)',
          color: 'var(--text, #1c1c1c)',
          border: '1px solid var(--border, #e5e7eb)',
        }}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        onClick={() => setOpen(!open)}
      >
        <svg
          className="shrink-0"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--muted, #6b7280)' }}
        >
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M1.5 8h13M8 1.5c-2 2.5-2 9.5 0 13M8 1.5c2 2.5 2 9.5 0 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>
          {currentLanguage ? currentLanguage.label : 'Language'}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
          className="absolute left-0 top-full mt-1 min-w-[160px] rounded-lg py-1 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          role="listbox"
          aria-label="Languages"
        >
          {languages.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === selected}
            >
              <button
                className="w-full text-left px-4 py-2 text-sm transition-colors duration-150 hover:brightness-95"
                style={{
                  color: 'var(--text, #1c1c1c)',
                  backgroundColor: lang.code === selected ? 'var(--border, #e5e7eb)' : 'transparent',
                  fontWeight: lang.code === selected ? 600 : 400,
                }}
                type="button"
                onClick={() => handleSelect(lang.code)}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
