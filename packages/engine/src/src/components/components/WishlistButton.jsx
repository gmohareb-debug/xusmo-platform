import React from "react";

export function WishlistButton({ active = false, label = "Wishlist" }) {
  return (
    <button
      className={`wishlist-button${active ? " wishlist-button-active" : ""}`}
      type="button"
      aria-pressed={active}
    >
      <span className="wishlist-icon" aria-hidden="true">
        {active ? "\u2665" : "\u2661"}
      </span>
      <span className="wishlist-label">{label}</span>
    </button>
  );
}
