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
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {title && (
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
            style={{
              backgroundColor: 'var(--surface, #fff)',
              color: 'var(--text, #1c1c1c)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--accent, #3b82f6)',
              color: 'var(--surface, #fff)',
            }}
            type="submit"
          >
            Search
          </button>
          {filters.length > 0 && (
            <button
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:brightness-95"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
                border: '1px solid var(--border, #e5e7eb)',
              }}
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </button>
          )}
        </div>
        {filtersOpen && filters.length > 0 && (
          <div
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--surface, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            {filters.map((filter) => (
              <div className="flex flex-col gap-1.5" key={filter.name}>
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--muted, #6b7280)' }}
                >
                  {filter.name}
                </label>
                {filter.type === "select" && filter.options ? (
                  <select
                    className="px-3 py-2 rounded-md text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--surface, #fff)',
                      color: 'var(--text, #1c1c1c)',
                      border: '1px solid var(--border, #e5e7eb)',
                    }}
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
                    className="px-3 py-2 rounded-md text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--surface, #fff)',
                      color: 'var(--text, #1c1c1c)',
                      border: '1px solid var(--border, #e5e7eb)',
                    }}
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
