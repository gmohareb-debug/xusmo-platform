import React from "react";

export function StockIndicator({ inStock = false, quantity }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{
        backgroundColor: inStock ? '#dcfce7' : '#fee2e2',
        color: inStock ? '#166534' : '#991b1b',
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: inStock ? '#22c55e' : '#ef4444' }}
        aria-hidden="true"
      />
      <span>{inStock ? "In Stock" : "Out of Stock"}</span>
      {inStock && quantity != null && (
        <span style={{ opacity: 0.7 }}>({quantity} available)</span>
      )}
    </div>
  );
}
