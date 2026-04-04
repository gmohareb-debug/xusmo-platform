import React from "react";

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs py-4" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list flex items-center flex-wrap gap-1 list-none p-0 m-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumbs-item flex items-center gap-1">
              {!isLast ? (
                <>
                  <a href={item.href || "#"} className="breadcrumbs-link text-[var(--muted,#6b7280)] hover:text-[var(--accent,#1f4dff)] no-underline transition-colors duration-200">
                    {item.label}
                  </a>
                  <span className="breadcrumbs-separator text-gray-300 mx-1" aria-hidden="true">
                    /
                  </span>
                </>
              ) : (
                <span className="breadcrumbs-current font-medium text-[var(--text,#1c1c1c)]" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
