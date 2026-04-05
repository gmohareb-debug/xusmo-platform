import React from "react";

export function AddToCartButton({ label = "Add to Cart", disabled = false }) {
  return (
    <button
      className={`add-to-cart-button${disabled ? " add-to-cart-button-disabled" : ""}`}
      disabled={disabled}
      type="button"
    >
      <span className="add-to-cart-icon" aria-hidden="true">
        &#x1F6D2;
      </span>
      <span className="add-to-cart-label">{label}</span>
    </button>
  );
}
