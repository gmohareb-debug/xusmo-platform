import React from "react";

export function SearchResults({ query, results = [], total }) {
  const displayTotal = total !== undefined ? total : results.length;

  return (
    <div className="search-results">
      <div className="search-results-header">
        {query && (
          <p className="search-results-query">
            Results for: <strong>{query}</strong>
          </p>
        )}
        <p className="search-results-total">
          {displayTotal} result{displayTotal !== 1 ? "s" : ""} found
        </p>
      </div>
      {results.length === 0 ? (
        <p className="search-results-empty">No results found.</p>
      ) : (
        <ul className="search-results-list">
          {results.map((result, i) => (
            <li className="search-results-item" key={i}>
              <a className="search-results-item-title" href={result.href}>
                {result.title}
              </a>
              {result.description && (
                <p className="search-results-item-description">
                  {result.description}
                </p>
              )}
              {result.href && (
                <span className="search-results-item-url">{result.href}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
