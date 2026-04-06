import React, { useState } from "react";

export function ProductGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div
          className="flex items-center justify-center rounded-xl h-64 text-sm"
          style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--muted, #6b7280)' }}
        >
          No images available
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      {/* Main image */}
      <div
        className="w-full overflow-hidden rounded-xl"
        style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <img
          className="w-full h-auto max-h-[500px] object-contain"
          src={currentImage.src}
          alt={currentImage.alt || "Product image"}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={index}
                className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 p-0"
                style={{
                  border: isActive ? '2px solid var(--accent, #3b82f6)' : '2px solid var(--border, #e5e7eb)',
                  opacity: isActive ? 1 : 0.6,
                  background: 'none',
                }}
                type="button"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  className="w-full h-full object-cover"
                  src={img.src}
                  alt={img.alt || `Thumbnail ${index + 1}`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
