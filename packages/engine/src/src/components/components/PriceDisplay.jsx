import React from "react";

export function PriceDisplay({ price, originalPrice, currency = "$", period }) {
  return (
    <div className="price-display">
      <span className="price-display-current">
        <span className="price-display-currency">{currency}</span>
        <span className="price-display-amount">{price}</span>
      </span>
      {originalPrice && (
        <span className="price-display-original">
          <span className="price-display-currency">{currency}</span>
          <span className="price-display-original-amount">{originalPrice}</span>
        </span>
      )}
      {period && <span className="price-display-period">/{period}</span>}
    </div>
  );
}
