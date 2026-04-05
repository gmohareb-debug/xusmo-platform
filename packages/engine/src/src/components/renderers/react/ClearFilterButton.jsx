import React from "react";

export function ClearFilterButton({ label = "Clear All Filters", onClick }) {
  return (
    <button
      className="clear-filter-button"
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
