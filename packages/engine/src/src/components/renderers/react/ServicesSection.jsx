import { onImgError } from './imgFallback'

export function ServicesSection({ title, services }) {
  return (
    <section className="services-section">
      {title && (
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)] mb-4"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          <div className="mx-auto w-12 h-1 rounded-full mt-4" style={{ background: 'var(--accent, #3b82f6)' }} />
        </div>
      )}
      {services && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            /* First card spans full width on 2-col, acts as hero card */
            const isHero = index === 0 && services.length > 2
            return (
              <a
                key={index}
                className={`group block bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden no-underline text-[var(--text,#1c1c1c)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${isHero ? 'md:col-span-2 lg:col-span-1' : ''}`}
                href={service.href || '#services'}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                {service.image && (
                  <div className={`overflow-hidden ${isHero ? 'aspect-[16/9] md:aspect-[21/9] lg:aspect-[4/3]' : 'aspect-[4/3]'}`}>
                    <img
                      src={service.image}
                      alt={service.title || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={e => onImgError(e, 400, 300)}
                    />
                  </div>
                )}
                <div className="p-8 lg:p-10">
                  {service.icon && !service.image && (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                      style={{
                        background: 'var(--accent, #3b82f6)',
                        opacity: 0.1,
                        position: 'relative',
                      }}
                    >
                      <span className="relative" style={{ opacity: 1 }}>{service.icon}</span>
                    </div>
                  )}
                  {service.icon && !service.image && (
                    <span className="block text-3xl mb-5">{service.icon}</span>
                  )}
                  {service.title && (
                    <h3 className="text-xl font-semibold mb-3 leading-snug m-0 text-[var(--text,#1c1c1c)]">
                      {service.title}
                    </h3>
                  )}
                  {service.description && (
                    <p className="text-[15px] text-[var(--muted,#6b7280)] leading-relaxed mb-6 m-0">
                      {service.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent,#3b82f6)] group-hover:gap-3 transition-all duration-300">
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
