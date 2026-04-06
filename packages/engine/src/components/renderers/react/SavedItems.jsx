import React from "react";

export function SavedItems({ title = "Saved Items", items = [] }) {
  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>No saved items yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
      <h2
        className="text-2xl md:text-3xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading, inherit)' }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => {
          const card = (
            <div
              key={index}
              className="group rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
            >
              {item.image && (
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={item.image}
                    alt={item.name}
                  />
                </div>
              )}
              <div className="p-4 flex flex-col gap-1">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text, #1c1c1c)' }}>
                  {item.name}
                </h3>
                {item.price && (
                  <span className="text-sm font-bold" style={{ color: 'var(--accent, #3b82f6)' }}>
                    {item.price}
                  </span>
                )}
              </div>
            </div>
          );

          if (item.href) {
            return (
              <a key={index} className="no-underline" href={item.href}>
                {card}
              </a>
            );
          }

          return card;
        })}
      </div>
    </div>
  );
}
