import React from "react";

export function DiscountBadge({ text, type = "sale" }) {
  return (
    <span className={`discount-badge discount-badge-${type}`}>
      {text}
    </span>
  );
}
