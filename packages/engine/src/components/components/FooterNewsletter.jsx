export function FooterNewsletter({
  title,
  description,
  placeholder = 'Enter your email',
  buttonLabel = 'Subscribe',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 text-center">
      {title && (
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--muted, #6b7280)' }}>
          {description}
        </p>
      )}
      <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          className="flex-1 px-3 py-2.5 text-sm rounded-lg outline-none"
          placeholder={placeholder}
          required
          style={{
            color: 'var(--text, #1c1c1c)',
            backgroundColor: 'var(--bg, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
        />
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-medium rounded-lg shrink-0 transition-opacity hover:opacity-80"
          style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
