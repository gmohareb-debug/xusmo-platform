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
    <div className={`user-avatar-menu ${open ? 'user-avatar-menu--open' : ''}`} ref={menuRef}>
      <button
        className="user-avatar-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`User menu for ${name || 'user'}`}
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img
            className="user-avatar-menu__avatar"
            src={avatar}
            alt={name || 'User avatar'}
          />
        ) : (
          <span className="user-avatar-menu__initials">{initials}</span>
        )}
      </button>

      {open && (
        <div className="user-avatar-menu__dropdown" role="menu">
          <div className="user-avatar-menu__header">
            <span className="user-avatar-menu__name">{name}</span>
          </div>
          <ul className="user-avatar-menu__list">
            {menuItems.map((item) => (
              <li className="user-avatar-menu__item" key={item.label} role="menuitem">
                <a className="user-avatar-menu__link" href={item.href || '#'}>
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
