import { onImgError } from './imgFallback'

export function Gallery({ title, subtitle, images = [], layout = 'grid' }) {
  const isMasonry = layout === 'masonry'

  return (
    <section>
      {title && (
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-base text-[var(--muted,#6b7280)] mt-4 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      )}

      {isMasonry ? (
        /* Masonry layout — staggered heights for visual drama */
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-5 space-y-4 md:space-y-5">
          {images.map((image, index) => (
            <div
              className="group relative overflow-hidden rounded-xl bg-gray-100 cursor-pointer break-inside-avoid"
              key={image.alt || image.src || index}
            >
              <img
                src={image.src}
                alt={image.alt || 'Gallery image'}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                onError={e => onImgError(e, 600, 400)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-end p-4">
                {image.alt && image.alt !== 'Gallery image' && (
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 drop-shadow-lg">
                    {image.alt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid layout — uniform cards */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {images.map((image, index) => (
            <div
              className="group relative overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
              key={image.alt || image.src || index}
              style={{ aspectRatio: index % 5 === 0 ? '1/1' : '3/2' }}
            >
              <img
                src={image.src}
                alt={image.alt || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={e => onImgError(e, 600, 400)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
