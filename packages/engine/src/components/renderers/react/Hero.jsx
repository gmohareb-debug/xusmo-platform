import { onImgError } from './imgFallback'

export function Hero({ variant = 'text', title, subtitle, cta, ctaSecondary, ctaHref, ctaSecondaryHref, imageUrl, videoUrl, icon, eyebrow }) {
  const isMedia = variant === 'video' || variant === 'image'

  return (
    <section className={`hero-unified hero-unified--${variant}`}>
      {/* Background layer — video or image */}
      {isMedia && (
        <div className="hero-unified__bg">
          {variant === 'video' && videoUrl && (
            <video
              className="hero-unified__video"
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {variant === 'image' && imageUrl && (
            <img
              className="hero-unified__image"
              src={imageUrl}
              alt={title || ''}
              loading="eager"
              onError={e => onImgError(e, 1920, 800)}
            />
          )}
          <div className="hero-unified__overlay" />
        </div>
      )}

      {/* Content layer */}
      <div className="hero-unified__content">
        {icon && !isMedia && (
          <div className="hero-unified__icon" dangerouslySetInnerHTML={{ __html: icon }} />
        )}
        {eyebrow && <p className="hero-unified__eyebrow">{eyebrow}</p>}
        {title && <h1 className="hero-unified__title">{title}</h1>}
        {subtitle && <p className="hero-unified__subtitle">{subtitle}</p>}
        {(cta || ctaSecondary) && (
          <div className="hero-unified__actions">
            {cta && (
              <a href={ctaHref || '#products'} className="hero-unified__cta hero-unified__cta--primary">
                {cta}
              </a>
            )}
            {ctaSecondary && (
              <a href={ctaSecondaryHref || '#features'} className="hero-unified__cta hero-unified__cta--secondary">
                {ctaSecondary}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
