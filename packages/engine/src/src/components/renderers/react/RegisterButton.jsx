export function RegisterButton({ label = 'Sign up', href = '#' }) {
  return (
    <a className="register-button" href={href} role="button">
      <svg
        className="register-button__icon"
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
      <span className="register-button__label">{label}</span>
    </a>
  )
}
