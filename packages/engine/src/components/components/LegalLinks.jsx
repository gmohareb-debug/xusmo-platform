export function LegalLinks({ links = [] }) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 py-4" aria-label="Legal">
      {links.map((link, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <span className="text-sm select-none" aria-hidden="true" style={{ color: 'var(--border, #e5e7eb)' }}>
              |
            </span>
          )}
          <a
            href={link.href || '#'}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted, #6b7280)' }}
          >
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
