import React from "react";

export function ClearFilterButton({ label = "Clear All Filters", onClick }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-95 active:scale-95"
      style={{
        backgroundColor: 'var(--surface, #fff)',
        color: 'var(--muted, #6b7280)',
        border: '1px solid var(--border, #e5e7eb)',
      }}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
