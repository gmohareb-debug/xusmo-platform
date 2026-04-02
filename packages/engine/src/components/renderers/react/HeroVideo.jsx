export function HeroVideo({ title, subtitle, videoUrl, cta }) {
  return (
    <section className="hero-video">
      <div className="hero-video-bg">
        {videoUrl && (
          <video
            className="hero-video-element"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            crossOrigin="anonymous"
          />
        )}
      </div>
      <div className="hero-video-overlay" />
      <div className="hero-video-content">
        {title && <h1 className="hero-video-title">{title}</h1>}
        {subtitle && <p className="hero-video-subtitle">{subtitle}</p>}
        {cta && (
          <a href="#cta" className="hero-video-cta">
            {cta}
          </a>
        )}
      </div>
    </section>
  );
}
