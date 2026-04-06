export function EmbeddedMedia({ url, title }) {
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
      <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={url}
          title={title || 'Embedded media'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
