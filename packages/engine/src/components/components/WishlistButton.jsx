import React from "react";

export function WishlistButton({ active = false, label = "Wishlist" }) {
  return (
    <button
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 border-none hover:scale-105"
      style={{
        backgroundColor: active ? '#fee2e2' : 'var(--surface, #fff)',
        color: active ? '#dc2626' : 'var(--muted, #6b7280)',
        boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--border, #e5e7eb)',
      }}
      type="button"
      aria-pressed={active}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {active ? "\u2665" : "\u2661"}
      </span>
      <span>{label}</span>
    </button>
  );
}
