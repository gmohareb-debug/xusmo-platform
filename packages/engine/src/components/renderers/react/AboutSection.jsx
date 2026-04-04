import { onImgError } from './imgFallback'

export function AboutSection({ title, description, image, stats }) {
  return (
    <section className="about-section">
      <div className="about-section-inner grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {image && (
          <div className="about-section-media overflow-hidden rounded-2xl shadow-lg">
            <img
              className="about-section-image w-full h-auto object-cover aspect-[4/3]"
              src={image}
              alt={title || "About"}
              onError={e => onImgError(e, 800, 600)}
            />
          </div>
        )}
        <div className="about-section-content space-y-6">
          {title && (
            <h2 className="about-section-title text-3xl md:text-4xl font-bold tracking-tight m-0"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              {title}
            </h2>
          )}
          {description && (
            <p className="about-section-description text-base md:text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0">
              {description}
            </p>
          )}
          {stats && stats.length > 0 && (
            <div className="about-section-stats grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="about-section-stat flex flex-col">
                  <span className="about-section-stat-value text-3xl md:text-4xl font-bold text-[var(--accent,#1f4dff)] leading-none">
                    {stat.value}
                  </span>
                  <span className="about-section-stat-label text-sm text-[var(--muted,#6b7280)] mt-1">
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
