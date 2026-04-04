import { onImgError } from './imgFallback'

export function Gallery({ title, images = [] }) {
  return (
    <section className="section gallery">
      {title && (
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h3>
      )}
      <div className="gallery__grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            className="gallery__cell group overflow-hidden rounded-xl aspect-[3/2] bg-gray-100"
            key={image.alt || image.src}
          >
            <img
              src={image.src}
              alt={image.alt || 'Gallery image'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => onImgError(e, 600, 400)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
