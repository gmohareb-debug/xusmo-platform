import React from "react";

export function SearchResults({ query, results = [], total }) {
  const displayTotal = total !== undefined ? total : results.length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
      <div className="mb-6">
        {query && (
          <p className="text-sm mb-1" style={{ color: 'var(--muted, #6b7280)' }}>
            Results for: <strong style={{ color: 'var(--text, #1c1c1c)' }}>{query}</strong>
          </p>
        )}
        <p className="text-xs font-medium" style={{ color: 'var(--muted, #6b7280)' }}>
          {displayTotal} result{displayTotal !== 1 ? "s" : ""} found
        </p>
      </div>

      {results.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--muted, #6b7280)' }}>
          No results found.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-4">
          {results.map((result, i) => (
            <li
              key={i}
              className="p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
            >
              <a
                className="text-base font-semibold no-underline hover:underline"
                href={result.href}
                style={{ color: 'var(--accent, #3b82f6)' }}
              >
                {result.title}
              </a>
              {result.description && (
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted, #6b7280)' }}>
                  {result.description}
                </p>
              )}
              {result.href && (
                <span className="block text-xs mt-2 truncate" style={{ color: 'var(--muted, #6b7280)', opacity: 0.7 }}>
                  {result.href}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
