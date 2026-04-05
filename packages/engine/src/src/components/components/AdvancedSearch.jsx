import React, { useState } from "react";

export function AdvancedSearch({
  title,
  filters = [],
  placeholder = "Search...",
}) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterValues, setFilterValues] = useState(() => {
    const initial = {};
    filters.forEach((f) => {
      initial[f.name] = "";
    });
    return initial;
  });

  function handleFilterChange(name, value) {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="advanced-search">
      {title && <h2 className="advanced-search-title">{title}</h2>}
      <form className="advanced-search-form" onSubmit={handleSubmit}>
        <div className="advanced-search-bar">
          <input
            className="advanced-search-input"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="advanced-search-submit" type="submit">
            Search
          </button>
          {filters.length > 0 && (
            <button
              className="advanced-search-toggle-filters"
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>
        {filtersOpen && filters.length > 0 && (
          <div className="advanced-search-filters">
            {filters.map((filter) => (
              <div className="advanced-search-filter" key={filter.name}>
                <label className="advanced-search-filter-label">
                  {filter.name}
                </label>
                {filter.type === "select" && filter.options ? (
                  <select
                    className="advanced-search-filter-select"
                    value={filterValues[filter.name] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                  >
                    <option value="">All</option>
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="advanced-search-filter-input"
                    type={filter.type || "text"}
                    value={filterValues[filter.name] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
