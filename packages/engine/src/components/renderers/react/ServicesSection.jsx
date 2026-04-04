import { onImgError } from './imgFallback'

export function ServicesSection({ title, services }) {
  return (
    <section className="services-section">
      {title && (
        <h2 className="services-section-title text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      {services && services.length > 0 && (
        <div className="services-section-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <a
              key={index}
              className="services-section-card group block bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden no-underline text-[var(--text,#1c1c1c)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              href={service.href || '#services'}
            >
              {service.image && (
                <div className="services-section-image-wrap aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title || ''}
                    className="services-section-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => onImgError(e, 400, 300)}
                  />
                </div>
              )}
              <div className="p-6 lg:p-8">
                {service.icon && (
                  <span className="services-section-icon block text-3xl mb-4">{service.icon}</span>
                )}
                {service.title && (
                  <h3 className="services-section-card-title text-lg font-semibold mb-2 leading-snug m-0">
                    {service.title}
                  </h3>
                )}
                {service.description && (
                  <p className="services-section-card-desc text-sm text-[var(--muted,#6b7280)] leading-relaxed mb-4 m-0">
                    {service.description}
                  </p>
                )}
                <span className="services-section-card-link text-sm font-semibold text-[var(--accent,#1f4dff)] group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform duration-200">
                  Learn more &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
