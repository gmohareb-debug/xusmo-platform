import { useState } from 'react';

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
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <button
            key={index}
            className="overflow-hidden rounded-lg border-0 p-0 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image: ${img.alt || ''}`}
            style={{ backgroundColor: 'var(--border, #e5e7eb)' }}
          >
            <img
              className="w-full aspect-square object-cover block"
              src={img.src}
              alt={img.alt || ''}
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={close}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white text-2xl bg-transparent border-0 cursor-pointer rounded-full transition-opacity hover:opacity-70"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>

          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white text-3xl bg-transparent border-0 cursor-pointer rounded-full transition-opacity hover:opacity-70"
            onClick={prev}
            aria-label="Previous image"
          >
            &#8249;
          </button>

          <img
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            src={images[openIndex]?.src || ''}
            alt={images[openIndex]?.alt || ''}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white text-3xl bg-transparent border-0 cursor-pointer rounded-full transition-opacity hover:opacity-70"
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
