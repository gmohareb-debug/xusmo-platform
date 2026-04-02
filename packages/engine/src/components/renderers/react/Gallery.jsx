import { onImgError } from './imgFallback'

export function Gallery({ title, images = [] }) {
  return (
    <section className="section gallery">
      <h3>{title}</h3>
      <div className="gallery__grid">
        {images.map((image) => (
          <div className="gallery__cell" key={image.alt || image.src}>
            <img src={image.src} alt={image.alt || 'Gallery image'} onError={e => onImgError(e, 600, 400)} />
          </div>
        ))}
      </div>
    </section>
  )
}
