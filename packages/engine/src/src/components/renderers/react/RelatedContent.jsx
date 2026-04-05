export function RelatedContent({ title, items }) {
  return (
    <section className="related-content">
      {title && <h2 className="related-content-title">{title}</h2>}
      {items && items.length > 0 && (
        <div className="related-content-grid">
          {items.map((item, index) => (
            <a
              key={index}
              className="related-content-card"
              href={item.href || "#"}
            >
              {item.image && (
                <div className="related-content-image-wrap">
                  <img
                    className="related-content-image"
                    src={item.image}
                    alt={item.title || ""}
                  />
                </div>
              )}
              {item.title && (
                <h3 className="related-content-card-title">{item.title}</h3>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
