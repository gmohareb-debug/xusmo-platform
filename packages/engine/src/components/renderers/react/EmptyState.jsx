export function EmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {icon && (
        <div className="text-4xl mb-4" style={{ color: 'var(--muted, #6b7280)' }}>
          {icon}
        </div>
      )}
      {title && (
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--muted, #6b7280)' }}>
          {description}
        </p>
      )}
      {actionLabel && (
        <a
          href={actionHref || '#'}
          className="inline-block px-5 py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-80"
          style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
