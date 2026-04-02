import { onImgError } from './imgFallback'

export function FeaturedContent({ title, description, image, reverse }) {
  return (
    <section
      className="featured-content"
      style={{ flexDirection: reverse ? "row-reverse" : "row" }}
    >
      <div className="featured-content-media">
        {image && (
          <img
            className="featured-content-image"
            src={image}
            alt={title || ""}
            onError={e => onImgError(e, 800, 600)}
          />
        )}
      </div>
      <div className="featured-content-text">
        {title && <h2 className="featured-content-title">{title}</h2>}
        {description && (
          <p className="featured-content-description">{description}</p>
        )}
      </div>
    </section>
  );
}
