import React, { useState } from "react";

export function ProductGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="product-gallery">
        <div className="product-gallery-empty">No images available</div>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <img
          className="product-gallery-main-image"
          src={currentImage.src}
          alt={currentImage.alt || "Product image"}
        />
      </div>
      {images.length > 1 && (
        <div className="product-gallery-thumbnails">
          {images.map((img, index) => (
            <button
              key={index}
              className={`product-gallery-thumb${
                index === selectedIndex ? " product-gallery-thumb-active" : ""
              }`}
              type="button"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                className="product-gallery-thumb-image"
                src={img.src}
                alt={img.alt || `Thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
