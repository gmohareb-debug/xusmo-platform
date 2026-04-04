import { onImgError } from './imgFallback'

export function ProductGrid({ title, products = [] }) {
  return (
    <section className="product-grid">
      {title && (
        <h2 className="product-grid-title text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      {products.length === 0 && (
        <p className="product-grid-empty text-center text-[var(--muted,#6b7280)] py-12">No products to display.</p>
      )}
      {products.length > 0 && (
        <div className="product-grid-items grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <a
              key={index}
              className="product-grid-card group block bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] overflow-hidden no-underline text-[var(--text,#1c1c1c)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              href={product.href || '#'}
            >
              {product.image && (
                <div className="product-grid-image-wrap aspect-square overflow-hidden bg-gray-50">
                  <img
                    className="product-grid-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.image}
                    alt={product.name || ''}
                    onError={e => onImgError(e, 400, 400)}
                  />
                </div>
              )}
              <div className="product-grid-info p-5 space-y-2">
                {product.name && (
                  <h3 className="product-grid-name text-base font-semibold leading-snug m-0">{product.name}</h3>
                )}
                {product.price && (
                  <span className="product-grid-price block text-lg font-bold text-[var(--accent,#1f4dff)]">{product.price}</span>
                )}
                {product.description && (
                  <p className="product-grid-desc text-sm text-[var(--muted,#6b7280)] leading-relaxed m-0 line-clamp-2">{product.description}</p>
                )}
                <div className="product-grid-actions flex items-center justify-between pt-2">
                  <span className="product-grid-cta text-sm font-semibold text-[var(--accent,#1f4dff)] group-hover:translate-x-1 inline-flex transition-transform duration-200">
                    {product.ctaLabel || 'View Details'} &rarr;
                  </span>
                  {product.cartLabel && (
                    <button
                      className="product-grid-cart text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--accent,#1f4dff)]/10 text-[var(--accent,#1f4dff)] border-none cursor-pointer hover:bg-[var(--accent,#1f4dff)] hover:text-white transition-all duration-200"
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
