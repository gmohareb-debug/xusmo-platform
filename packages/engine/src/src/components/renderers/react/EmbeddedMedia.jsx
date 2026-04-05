export function EmbeddedMedia({ url, title }) {
  return (
    <div className="embedded-media">
      {title && <h3 className="embedded-media-title">{title}</h3>}
      <div className="embedded-media-wrap">
        <iframe
          className="embedded-media-iframe"
          src={url}
          title={title || "Embedded media"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
