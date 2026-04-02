import React from "react";

export function ProductCard({ image, name, price, originalPrice, badge, href }) {
  const cardContent = (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        {badge && <span className="product-card-badge">{badge}</span>}
        <img className="product-card-image" src={image} alt={name || 'Product'} />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{name}</h3>
        <div className="product-card-pricing">
          <span className="product-card-price">{price}</span>
          {originalPrice && (
            <span className="product-card-original-price">{originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a className="product-card-link" href={href}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
