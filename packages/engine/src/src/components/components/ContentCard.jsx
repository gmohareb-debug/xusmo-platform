import { onImgError } from './imgFallback'

export function ContentCard({ image, title, description, link }) {
  return (
    <div className="content-card">
      {image && (
        <div className="content-card-image-wrap">
          <img className="content-card-image" src={image} alt={title || ""} onError={e => onImgError(e, 400, 300)} />
        </div>
      )}
      <div className="content-card-body">
        {title && <h3 className="content-card-title">{title}</h3>}
        {description && (
          <p className="content-card-description">{description}</p>
        )}
        {link && link.href && (
          <a className="content-card-link" href={link.href}>
            {link.label || "Read more"} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
