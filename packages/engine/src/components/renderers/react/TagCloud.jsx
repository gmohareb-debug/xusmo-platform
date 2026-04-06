export function TagCloud({ title, tags }) {
  return (
    <section className="w-full px-4 py-6">
      {title && (
        <h2
          className="text-xl md:text-2xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1.5 text-xs font-medium rounded-full cursor-default transition-opacity hover:opacity-80"
              style={{
                color: 'var(--accent, #3b82f6)',
                backgroundColor: 'var(--surface, #fff)',
                border: '1px solid var(--accent, #3b82f6)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
