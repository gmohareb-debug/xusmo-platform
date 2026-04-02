import React from "react";

export function StockIndicator({ inStock = false, quantity }) {
  return (
    <div className={`stock-indicator${inStock ? " stock-indicator-in" : " stock-indicator-out"}`}>
      <span className="stock-indicator-dot" aria-hidden="true">
        {inStock ? "\u25CF" : "\u25CB"}
      </span>
      <span className="stock-indicator-text">
        {inStock ? "In Stock" : "Out of Stock"}
      </span>
      {inStock && quantity != null && (
        <span className="stock-indicator-quantity">
          ({quantity} available)
        </span>
      )}
    </div>
  );
}
