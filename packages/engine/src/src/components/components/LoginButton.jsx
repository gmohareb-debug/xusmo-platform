export function LoginButton({ label = 'Log in', href = '#' }) {
  return (
    <a className="login-button" href={href} role="button">
      <svg
        className="login-button__icon"
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
      <span className="login-button__label">{label}</span>
    </a>
  )
}
