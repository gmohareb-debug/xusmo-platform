export function TagCloud({ title, tags }) {
  return (
    <section className="tag-cloud">
      {title && <h2 className="tag-cloud-title">{title}</h2>}
      {tags && tags.length > 0 && (
        <div className="tag-cloud-list">
          {tags.map((tag, index) => (
            <span key={index} className="tag-cloud-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
