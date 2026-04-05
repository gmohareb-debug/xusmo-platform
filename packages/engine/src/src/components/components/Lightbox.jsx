import { useState } from "react";

export function Lightbox({ images }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const isOpen = openIndex !== null;

  const close = () => setOpenIndex(null);

  const prev = (e) => {
    e.stopPropagation();
    setOpenIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setOpenIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="lightbox">
      <div className="lightbox-grid">
        {images.map((img, index) => (
          <button
            key={index}
            className="lightbox-thumb-btn"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image: ${img.alt || ""}`}
          >
            <img
              className="lightbox-thumb"
              src={img.src}
              alt={img.alt || ""}
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="lightbox-overlay" onClick={close}>
          <button
            className="lightbox-close"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>

          <button
            className="lightbox-nav lightbox-nav-prev"
            onClick={prev}
            aria-label="Previous image"
          >
            &#8249;
          </button>

          <img
            className="lightbox-full"
            src={images[openIndex]?.src || ''}
            alt={images[openIndex]?.alt || ""}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="lightbox-nav lightbox-nav-next"
            onClick={next}
            aria-label="Next image"
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
}
