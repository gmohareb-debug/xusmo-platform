import { onImgError } from './imgFallback'

export function TrustBadges({ title, logos }) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="trust-badges">
      {title && <h2 className="trust-badges-title">{title}</h2>}
      <div className="trust-badges-row">
        {logos.map((logo, index) => (
          <div key={index} className="trust-badges-item">
            <img
              className="trust-badges-logo"
              src={logo.src}
              alt={logo.alt || "Partner logo"}
              onError={e => onImgError(e, 120, 40)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
