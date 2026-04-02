import { onImgError } from './imgFallback'

export function ProductGrid({ title, products = [] }) {
  return (
    <section className="product-grid">
      {title && <h2 className="product-grid-title">{title}</h2>}
      {products.length === 0 && (
        <p className="product-grid-empty">No products to display.</p>
      )}
      {products.length > 0 && (
        <div className="product-grid-items">
          {products.map((product, index) => (
            <a key={index} className="product-grid-card" href={product.href || '#'}>
              {product.image && (
                <div className="product-grid-image-wrap">
                  <img
                    className="product-grid-image"
                    src={product.image}
                    alt={product.name || ''}
                    onError={e => onImgError(e, 400, 400)}
                  />
                </div>
              )}
              <div className="product-grid-info">
                {product.name && (
                  <h3 className="product-grid-name">{product.name}</h3>
                )}
                {product.price && (
                  <span className="product-grid-price">{product.price}</span>
                )}
                {product.description && (
                  <p className="product-grid-desc">{product.description}</p>
                )}
                <div className="product-grid-actions">
                  <span className="product-grid-cta">{product.ctaLabel || 'View Details'} &rarr;</span>
                  {product.cartLabel && (
                    <button
                      className="product-grid-cart"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    >
                      {product.cartLabel}
                    </button>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
