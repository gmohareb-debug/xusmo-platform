export function LoginButton({ label = 'Log in', href = '#' }) {
  return (
    <a
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
      style={{
        backgroundColor: 'var(--accent, #3b82f6)',
        color: 'var(--surface, #fff)',
      }}
      href={href}
      role="button"
    >
      <svg
        className="shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l3-3-3-3M10 8H2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </a>
  )
}
