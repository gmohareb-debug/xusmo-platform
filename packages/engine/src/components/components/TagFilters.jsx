import React, { useState } from "react";

export function TagFilters({ tags = [], selected = [] }) {
  const [activeTags, setActiveTags] = useState(new Set(selected));

  function toggleTag(tag) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 py-4">
      {tags.map((tag) => {
        const isActive = activeTags.has(tag);
        return (
          <button
            key={tag}
            className="px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 border-none hover:-translate-y-0.5"
            style={{
              backgroundColor: isActive ? 'var(--accent, #3b82f6)' : 'var(--surface, #fff)',
              color: isActive ? '#fff' : 'var(--text, #1c1c1c)',
              boxShadow: isActive ? '0 4px 12px -2px var(--accent, #3b82f6)' : 'inset 0 0 0 1px var(--border, #e5e7eb)',
            }}
            type="button"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
