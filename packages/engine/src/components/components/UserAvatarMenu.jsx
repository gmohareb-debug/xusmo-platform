import { useState, useEffect, useRef } from 'react'

export function UserAvatarMenu({ name, avatar, menuItems = [] }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?'

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg p-0 border-none"
        style={{
          backgroundColor: avatar ? 'transparent' : 'var(--accent, #3b82f6)',
          border: '2px solid var(--border, #e5e7eb)',
        }}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`User menu for ${name || 'user'}`}
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img
            className="w-full h-full object-cover"
            src={avatar}
            alt={name || 'User avatar'}
          />
        ) : (
          <span className="text-sm font-bold text-white">{initials}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
          role="menu"
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text, #1c1c1c)' }}>
              {name}
            </span>
          </div>
          <ul className="list-none p-0 m-0 py-1">
            {menuItems.map((item) => (
              <li key={item.label} role="menuitem">
                <a
                  className="block px-4 py-2.5 text-sm no-underline transition-colors duration-150"
                  href={item.href || '#'}
                  style={{ color: 'var(--text, #1c1c1c)' }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
