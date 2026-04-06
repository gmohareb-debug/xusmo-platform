import React from "react";

export function CompareButton({ label = "Compare", active = false }) {
  return (
    <button
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-95 active:scale-95"
      style={{
        backgroundColor: active ? 'var(--accent, #3b82f6)' : 'var(--surface, #fff)',
        color: active ? 'var(--surface, #fff)' : 'var(--text, #1c1c1c)',
        border: active ? '1px solid var(--accent, #3b82f6)' : '1px solid var(--border, #e5e7eb)',
      }}
      type="button"
      aria-pressed={active}
    >
      <span aria-hidden="true">&#x21C6;</span>
      <span>{label}</span>
    </button>
  );
}
