export function Contact({ title, description, email, phone, address, button }) {
  function handleScrollToForm() {
    const form = document.getElementById('contact') || document.querySelector('.contact-form')
    if (form) form.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="contact">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div className="contact__details">
        {email && <a href={`mailto:${email}`} className="contact__detail">{email}</a>}
        {phone && <a href={`tel:${phone}`} className="contact__detail">{phone}</a>}
        {address && <p className="contact__detail">{address}</p>}
      </div>
      <div className="contact__actions">
        {button && (
          <button
            className="button button--secondary"
            type="button"
            onClick={handleScrollToForm}
          >
            {button}
          </button>
        )}
      </div>
    </section>
  )
}
