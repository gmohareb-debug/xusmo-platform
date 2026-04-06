export function VideoPlayer({ src, poster, title }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {title && (
        <h3
          className="text-lg md:text-xl font-semibold mb-3"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      <div className="relative w-full overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--border, #e5e7eb)' }}>
        <video
          className="w-full block"
          src={src}
          poster={poster}
          controls
          preload="metadata"
        >
          Your browser does not support the video element.
        </video>
      </div>
    </div>
  );
}
