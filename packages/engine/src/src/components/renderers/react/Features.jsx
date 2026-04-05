export function Features({ title, items = [] }) {
  const isRich = items.length > 0 && typeof items[0] === 'object'

  return (
    <section className="section features">
      {title && <h3 className="features__title">{title}</h3>}
      {isRich ? (
        <div className="features__grid">
          {items.map((item, i) => (
            <div key={i} className="features__card">
              {item.icon && <span className="features__icon">{item.icon}</span>}
              {item.title && <h4 className="features__card-title">{item.title}</h4>}
              {item.description && <p className="features__card-desc">{item.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <ul className="features__list">
          {items.map((item, i) => (
            <li key={i} className="features__item">
              <span className="features__check">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
