import { useState } from 'react';

export function SearchBar({ placeholder = 'Search...', onSearch }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  }

  return (
    <form className="w-full max-w-xl mx-auto px-4" role="search" onSubmit={handleSubmit}>
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--border, #e5e7eb)', backgroundColor: 'var(--surface, #fff)' }}
      >
        <svg
          className="ml-3 shrink-0"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--muted, #6b7280)' }}
        >
          <path
            d="M16.5 16.5l-4.15-4.15M11 7a4 4 0 11-8 0 4 4 0 018 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none border-none"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={placeholder}
          style={{ color: 'var(--text, #1c1c1c)' }}
        />

        <button
          className="px-4 py-2.5 text-sm font-medium shrink-0 transition-opacity hover:opacity-80"
          type="submit"
          aria-label="Submit search"
          style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
        >
          Search
        </button>
      </div>
    </form>
  );
}
