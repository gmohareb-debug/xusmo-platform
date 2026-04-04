import { onImgError } from './imgFallback'

export function FeaturedContent({ title, description, image, reverse }) {
  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      {/* Image side */}
      <div className={`relative ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {/* Subtle accent glow behind image */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-[0.06] blur-2xl"
          style={{ background: 'var(--accent, #3b82f6)' }}
        />
        {image && (
          <div className="relative overflow-hidden rounded-2xl" style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)' }}>
            <img
              className="w-full h-auto object-cover aspect-[4/3]"
              src={image}
              alt={title || ""}
              onError={e => onImgError(e, 800, 600)}
            />
          </div>
        )}
      </div>

      {/* Text side */}
      <div className={`space-y-6 ${reverse ? 'lg:[direction:ltr]' : ''}`}>
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
      </div>
    </section>
  );
}
