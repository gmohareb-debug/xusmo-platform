export function Pricing({ title, plans = [] }) {
  return (
    <section className="section pricing">
      <h3>{title}</h3>
      <div className="pricing__grid">
        {plans.map((plan) => (
          <article key={plan.name} className="pricing__card">
            <h4>{plan.name}</h4>
            <p className="pricing__price">{plan.price}</p>
            <p>{plan.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
