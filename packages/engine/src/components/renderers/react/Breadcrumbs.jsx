import React from "react";

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumbs-item">
              {!isLast ? (
                <>
                  <a href={item.href || "#"} className="breadcrumbs-link">
                    {item.label}
                  </a>
                  <span className="breadcrumbs-separator" aria-hidden="true">
                    /
                  </span>
                </>
              ) : (
                <span className="breadcrumbs-current" aria-current="page">
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
