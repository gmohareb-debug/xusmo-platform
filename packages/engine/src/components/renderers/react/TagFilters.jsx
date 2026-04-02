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
    <div className="tag-filters">
      {tags.map((tag) => {
        const isActive = activeTags.has(tag);
        return (
          <button
            className={
              "tag-filters-pill" +
              (isActive ? " tag-filters-pill-active" : "")
            }
            key={tag}
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
