export function NotificationIcon({ count = 0 }) {
  return (
    <button
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:brightness-95 active:scale-95"
      style={{
        backgroundColor: 'var(--surface, #fff)',
        color: 'var(--text, #1c1c1c)',
      }}
      type="button"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
    >
      <svg
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
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold leading-none"
          style={{
            backgroundColor: '#ef4444',
            color: 'var(--surface, #fff)',
          }}
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
