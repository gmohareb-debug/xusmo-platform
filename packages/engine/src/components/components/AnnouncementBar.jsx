import { useState } from 'react'

export function AnnouncementBar({ text, link, dismissible = false }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="announcement-bar" role="banner">
      <div className="announcement-bar__inner">
        <p className="announcement-bar__text">
          {text}
          {link && (
            <a className="announcement-bar__link" href={link.href || '#'}>
              {link.label}
            </a>
          )}
        </p>

        {dismissible && (
          <button
            className="announcement-bar__close"
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setVisible(false)}
          >
            <svg
              className="announcement-bar__close-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
