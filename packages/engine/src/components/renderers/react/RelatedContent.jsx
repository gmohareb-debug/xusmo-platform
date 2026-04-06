export function RelatedContent({ title, items }) {
  return (
    <section className="w-full px-4 py-8">
      {title && (
        <h2
          className="text-xl md:text-2xl font-bold mb-6"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <a
              key={index}
              className="block rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
              href={item.href || '#'}
              style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
            >
              {item.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    src={item.image}
                    alt={item.title || ''}
                  />
                </div>
              )}
              {item.title && (
                <h3
                  className="px-4 py-3 text-sm font-semibold"
                  style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {item.title}
                </h3>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
