import { onImgError } from './imgFallback'

export function AboutSection({ title, description, image, stats }) {
  return (
    <section className="about-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image with decorative accent */}
        {image && (
          <div className="relative">
            {/* Decorative background element */}
            <div
              className="absolute -top-4 -left-4 w-full h-full rounded-3xl opacity-[0.08]"
              style={{ background: 'var(--accent, #3b82f6)' }}
            />
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                className="w-full h-auto object-cover aspect-[4/3]"
                src={image}
                alt={title || 'About'}
                onError={e => onImgError(e, 800, 600)}
              />
            </div>
          </div>
        )}

        {/* Text content */}
        <div className="space-y-8">
          {title && (
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight m-0 text-[var(--text,#1c1c1c)]"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="text-base md:text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0">
              {description}
            </p>
          )}

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-[var(--border,#e5e7eb)]">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <span
                    className="text-3xl md:text-4xl font-bold leading-none tracking-tight"
                    style={{ color: 'var(--accent, #3b82f6)' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-sm text-[var(--muted,#6b7280)] mt-2 font-medium">
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
