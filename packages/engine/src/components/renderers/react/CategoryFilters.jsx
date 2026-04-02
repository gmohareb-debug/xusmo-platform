import React, { useState } from "react";

export function CategoryFilters({ categories = [] }) {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="category-filters">
      <ul className="category-filters-list">
        {categories.map((cat) => (
          <li className="category-filters-item" key={cat.name}>
            <button
              className={
                "category-filters-link" +
                (activeCategory === cat.name
                  ? " category-filters-link-active"
                  : "")
              }
              type="button"
              onClick={() => setActiveCategory(cat.name)}
            >
              <span className="category-filters-name">{cat.name}</span>
              {cat.count !== undefined && (
                <span className="category-filters-count">({cat.count})</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
