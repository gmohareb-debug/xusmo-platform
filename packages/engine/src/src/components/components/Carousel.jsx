import { useState } from "react";

export function Carousel({ items }) {
  const [current, setCurrent] = useState(0);

  if (!items || items.length === 0) return null;

  const prev = () => {
    setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  };

  const next = () => {
    setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));
  };

  return (
    <div className="carousel">
      <div className="carousel-viewport">
        <img
          className="carousel-image"
          src={items[current]?.image || ''}
          alt={items[current]?.caption || ""}
        />
        {items[current]?.caption && (
          <div className="carousel-caption">{items[current].caption}</div>
        )}
      </div>

      <button
        className="carousel-btn carousel-btn-prev"
        onClick={prev}
        aria-label="Previous"
      >
        &#8249;
      </button>
      <button
        className="carousel-btn carousel-btn-next"
        onClick={next}
        aria-label="Next"
      >
        &#8250;
      </button>

      <div className="carousel-dots">
        {items.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === current ? "carousel-dot-active" : ""}`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
