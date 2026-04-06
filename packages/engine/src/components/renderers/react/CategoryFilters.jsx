import React, { useState } from "react";

export function CategoryFilters({ categories = [] }) {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="w-full max-w-xs">
      <ul className="flex flex-col gap-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <li key={cat.name}>
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-95"
                style={{
                  backgroundColor: isActive ? 'var(--accent, #3b82f6)' : 'transparent',
                  color: isActive ? 'var(--surface, #fff)' : 'var(--text, #1c1c1c)',
                }}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span
                    className="text-xs"
                    style={{ color: isActive ? 'var(--surface, #fff)' : 'var(--muted, #6b7280)' }}
                  >
                    ({cat.count})
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
