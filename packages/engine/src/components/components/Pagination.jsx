import React from "react";

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handleChange = (page) => {
    if (onPageChange) onPageChange(page);
  };

  return (
    <nav className="flex items-center justify-center gap-2 px-4 py-6" aria-label="Pagination">
      <button
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          color: 'var(--text, #1c1c1c)',
          border: '1px solid var(--border, #e5e7eb)',
          backgroundColor: 'var(--surface, #fff)',
        }}
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--accent, #3b82f6)' : 'transparent',
                color: isActive ? '#fff' : 'var(--muted, #6b7280)',
                border: isActive ? 'none' : '1px solid transparent',
              }}
              onClick={() => handleChange(page)}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          color: 'var(--text, #1c1c1c)',
          border: '1px solid var(--border, #e5e7eb)',
          backgroundColor: 'var(--surface, #fff)',
        }}
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}
