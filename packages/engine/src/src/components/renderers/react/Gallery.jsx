import { onImgError } from './imgFallback'

export function Gallery({ title, images = [] }) {
  return (
    <section>
      {title && (
        <div className="text-center mb-14">
          <h3
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h3>
        </div>
      )}

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
            {/* Hover overlay with zoom icon */}
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
    </section>
  )
}
