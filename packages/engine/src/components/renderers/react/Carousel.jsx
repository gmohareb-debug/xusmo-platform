import { useState } from "react";

export function Carousel({ items }) {
  const [current, setCurrent] = useState(0);

  if (!items || items.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[var(--surface,#f8f9fa)]">
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          src={items[current]?.image || ""}
          alt={items[current]?.caption || ""}
        />
        {items[current]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-lg md:text-xl font-medium m-0 max-w-2xl">
              {items[current].caption}
            </p>
          </div>
        )}
      </div>

      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur text-[var(--text,#1c1c1c)] shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 border-none cursor-pointer text-xl"
        onClick={prev}
        aria-label="Previous"
      >
        &#8249;
      </button>
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur text-[var(--text,#1c1c1c)] shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 border-none cursor-pointer text-xl"
        onClick={next}
        aria-label="Next"
      >
        &#8250;
      </button>

      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all duration-300 ${
                index === current
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
