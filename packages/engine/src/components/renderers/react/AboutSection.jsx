import { onImgError } from './imgFallback'

export function AboutSection({ title, description, image, stats }) {
  return (
    <section className="about-section">
      <div className="about-section-inner">
        {image && (
          <div className="about-section-media">
            <img
              className="about-section-image"
              src={image}
              alt={title || "About"}
              onError={e => onImgError(e, 800, 600)}
            />
          </div>
        )}
        <div className="about-section-content">
          {title && <h2 className="about-section-title">{title}</h2>}
          {description && (
            <p className="about-section-description">{description}</p>
          )}
          {stats && stats.length > 0 && (
            <div className="about-section-stats">
              {stats.map((stat, index) => (
                <div key={index} className="about-section-stat">
                  <span className="about-section-stat-value">
                    {stat.value}
                  </span>
                  <span className="about-section-stat-label">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
