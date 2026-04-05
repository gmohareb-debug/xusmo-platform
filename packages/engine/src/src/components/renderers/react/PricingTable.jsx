export function PricingTable({ title, plans = [] }) {
  return (
    <section className="pricing-table">
      {title && <h2 className="pricing-table-title">{title}</h2>}
      <div className="pricing-table-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={'pricing-plan' + (plan.highlighted ? ' pricing-plan-highlighted' : '')}
          >
            {plan.highlighted && (
              <span className="pricing-plan-badge">{plan.badge || 'Recommended'}</span>
            )}
            <h3 className="pricing-plan-name">{plan.name}</h3>
            <div className="pricing-plan-price">
              <span className="pricing-plan-amount">{plan.price}</span>
              {plan.period && (
                <span className="pricing-plan-period">{plan.period}</span>
              )}
            </div>
            {plan.features && plan.features.length > 0 && (
              <ul className="pricing-plan-features">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="pricing-plan-feature">
                    <span className="pricing-plan-check">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            {plan.cta && (
              <a
                className={'pricing-plan-cta' + (plan.highlighted ? ' pricing-plan-cta--primary' : '')}
                href={plan.ctaHref || '#contact'}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
