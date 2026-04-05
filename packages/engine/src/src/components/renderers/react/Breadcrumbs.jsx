import React from "react";

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap gap-2 list-none p-0 m-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center gap-2">
              {!isLast ? (
                <>
                  <a
                    href={item.href || "#"}
                    className="text-[var(--muted,#6b7280)] no-underline transition-colors duration-200"
                    style={{ '--hover-color': 'var(--accent, #3b82f6)' }}
                    onMouseEnter={(e) => { e.target.style.color = 'var(--accent, #3b82f6)'; }}
                    onMouseLeave={(e) => { e.target.style.color = ''; }}
                  >
                    {item.label}
                  </a>
                  <span className="text-gray-300 select-none" aria-hidden="true">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </>
              ) : (
                <span className="font-medium text-[var(--text,#1c1c1c)]" aria-current="page">
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
