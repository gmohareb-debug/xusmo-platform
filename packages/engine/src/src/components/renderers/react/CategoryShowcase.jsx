import { onImgError } from './imgFallback'

export function CategoryShowcase({ title, categories }) {
  return (
    <section className="category-showcase">
      {title && <h2 className="category-showcase-title">{title}</h2>}
      {categories && categories.length > 0 && (
        <div className="category-showcase-grid">
          {categories.map((cat, index) => (
            <a
              key={index}
              className="category-showcase-card"
              href={cat.href || "#"}
            >
              {cat.image && (
                <img
                  className="category-showcase-bg"
                  src={cat.image}
                  alt={cat.name || ""}
                  onError={e => onImgError(e, 400, 300)}
                />
              )}
              <div className="category-showcase-overlay" />
              {cat.name && (
                <span className="category-showcase-name">{cat.name}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
