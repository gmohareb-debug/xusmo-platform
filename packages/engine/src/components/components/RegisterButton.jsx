export function RegisterButton({ label = 'Sign up', href = '#' }) {
  return (
    <a
      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      href={href}
      role="button"
      style={{
        backgroundColor: 'var(--accent, #3b82f6)',
        boxShadow: '0 4px 14px -2px var(--accent, #3b82f6)',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 3v10M3 8h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </a>
  )
}
