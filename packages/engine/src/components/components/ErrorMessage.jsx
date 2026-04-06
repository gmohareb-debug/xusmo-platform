export function ErrorMessage({ title, description, retryLabel, onRetry }) {
  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-xl text-center"
      role="alert"
      style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid #fca5a5' }}
    >
      {title && (
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: '#dc2626', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--muted, #6b7280)' }}>
          {description}
        </p>
      )}
      {retryLabel && onRetry && (
        <button
          className="inline-block px-5 py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-80"
          onClick={onRetry}
          style={{ color: '#fff', backgroundColor: '#dc2626' }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
