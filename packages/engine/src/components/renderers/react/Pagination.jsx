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
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      <div className="pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            className={
              "pagination-page" +
              (page === currentPage ? " pagination-page-active" : "")
            }
            onClick={() => handleChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        className="pagination-btn pagination-next"
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}
