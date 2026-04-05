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
    <div className={`language-selector ${open ? 'language-selector--open' : ''}`} ref={selectorRef}>
      <button
        className="language-selector__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        onClick={() => setOpen(!open)}
      >
        <svg
          className="language-selector__globe"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M1.5 8h13M8 1.5c-2 2.5-2 9.5 0 13M8 1.5c2 2.5 2 9.5 0 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="language-selector__current">
          {currentLanguage ? currentLanguage.label : 'Language'}
        </span>
        <svg
          className="language-selector__chevron"
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
        <ul className="language-selector__dropdown" role="listbox" aria-label="Languages">
          {languages.map((lang) => (
            <li
              className={`language-selector__option ${lang.code === selected ? 'language-selector__option--active' : ''}`}
              key={lang.code}
              role="option"
              aria-selected={lang.code === selected}
            >
              <button
                className="language-selector__option-button"
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
