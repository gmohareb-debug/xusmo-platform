import { useState } from 'react'

export function SearchBar({ placeholder = 'Search...', onSearch }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <div className="search-bar__inner">
        <svg
          className="search-bar__icon"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
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
          className="search-bar__input"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={placeholder}
        />

        <button className="search-bar__submit" type="submit" aria-label="Submit search">
          Search
        </button>
      </div>
    </form>
  )
}
