import { onImgError } from './imgFallback'

export function FeaturedContent({ title, description, image, reverse }) {
  return (
    <section className={`featured-content grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      <div className={`featured-content-media overflow-hidden rounded-2xl shadow-lg ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {image && (
          <img
            className="featured-content-image w-full h-auto object-cover aspect-[4/3]"
            src={image}
            alt={title || ""}
            onError={e => onImgError(e, 800, 600)}
          />
        )}
      </div>
      <div className={`featured-content-text space-y-6 ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {title && (
          <h2 className="featured-content-title text-3xl md:text-4xl font-bold tracking-tight m-0"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {title}
          </h2>
        )}
        {description && (
          <p className="featured-content-description text-base md:text-lg text-[var(--muted,#6b7280)] leading-relaxed m-0">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
