import React from "react";

export function AddToCartButton({ label = "Add to Cart", disabled = false }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:brightness-110 hover:shadow-md active:scale-95'
      }`}
      style={{
        backgroundColor: disabled ? 'var(--muted, #6b7280)' : 'var(--accent, #3b82f6)',
        color: 'var(--surface, #fff)',
      }}
      disabled={disabled}
      type="button"
    >
      <span aria-hidden="true">&#x1F6D2;</span>
      <span>{label}</span>
    </button>
  );
}
