import React from "react";

export function ProductDetail({ images = [], name, price, description, specs = [], inStock }) {
  return (
    <div className="product-detail">
      <div className="product-detail-gallery">
        {images.length > 0 && (
          <img
            className="product-detail-main-image"
            src={images[0]}
            alt={name}
          />
        )}
        {images.length > 1 && (
          <div className="product-detail-thumbnails">
            {images.map((src, index) => (
              <img
                key={index}
                className="product-detail-thumbnail"
                src={src}
                alt={`${name} ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="product-detail-info">
        <h1 className="product-detail-name">{name}</h1>
        <p className="product-detail-price">{price}</p>
        <div className="product-detail-stock">
          <span
            className={
              inStock
                ? "product-detail-stock-in"
                : "product-detail-stock-out"
            }
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        {description && (
          <div className="product-detail-description">
            <h3>Description</h3>
            <p>{description}</p>
          </div>
        )}
        {specs.length > 0 && (
          <div className="product-detail-specs">
            <h3>Specifications</h3>
            <table className="product-detail-specs-table">
              <tbody>
                {specs.map((spec, index) => (
                  <tr key={index}>
                    <td className="product-detail-spec-label">{spec.label}</td>
                    <td className="product-detail-spec-value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
