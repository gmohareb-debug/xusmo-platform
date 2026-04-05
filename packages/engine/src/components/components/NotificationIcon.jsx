export function NotificationIcon({ count = 0 }) {
  return (
    <button
      className="notification-icon"
      type="button"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
    >
      <svg
        className="notification-icon__bell"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 2a5 5 0 00-5 5v3l-1.3 2.6a.5.5 0 00.45.7h11.7a.5.5 0 00.45-.7L15 10V7a5 5 0 00-5-5zM8 15a2 2 0 104 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {count > 0 && (
        <span className="notification-icon__badge" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
