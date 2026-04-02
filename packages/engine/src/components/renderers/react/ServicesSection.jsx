import { onImgError } from './imgFallback'

export function ServicesSection({ title, services }) {
  return (
    <section className="services-section">
      {title && <h2 className="services-section-title">{title}</h2>}
      {services && services.length > 0 && (
        <div className="services-section-grid">
          {services.map((service, index) => (
            <a
              key={index}
              className="services-section-card"
              href={service.href || '#services'}
            >
              {service.image && (
                <div className="services-section-image-wrap">
                  <img src={service.image} alt={service.title || ''} className="services-section-image" onError={e => onImgError(e, 400, 300)} />
                </div>
              )}
              {service.icon && (
                <span className="services-section-icon">{service.icon}</span>
              )}
              {service.title && (
                <h3 className="services-section-card-title">
                  {service.title}
                </h3>
              )}
              {service.description && (
                <p className="services-section-card-desc">
                  {service.description}
                </p>
              )}
              <span className="services-section-card-link">Learn more &rarr;</span>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
