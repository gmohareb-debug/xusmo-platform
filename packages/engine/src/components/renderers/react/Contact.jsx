export function Contact({ title, description, email, phone, address, button }) {
  function handleScrollToForm() {
    const form = document.getElementById('contact') || document.querySelector('.contact-form')
    if (form) form.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="contact max-w-2xl mx-auto text-center">
      {title && (
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h3>
      )}
      {description && <p className="text-base text-[var(--muted,#6b7280)] leading-relaxed mb-8">{description}</p>}
      <div className="contact__details flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 mb-8">
        {email && (
          <a href={`mailto:${email}`} className="contact__detail inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-sm text-[var(--text,#1c1c1c)] no-underline hover:border-[var(--accent,#1f4dff)]/30 hover:shadow-md transition-all duration-200">
            <strong className="text-[var(--accent,#1f4dff)]">Email:</strong> {email}
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="contact__detail inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-sm text-[var(--text,#1c1c1c)] no-underline hover:border-[var(--accent,#1f4dff)]/30 hover:shadow-md transition-all duration-200">
            <strong className="text-[var(--accent,#1f4dff)]">Phone:</strong> {phone}
          </a>
        )}
        {address && (
          <p className="contact__detail inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-sm text-[var(--text,#1c1c1c)] m-0">
            <strong className="text-[var(--accent,#1f4dff)]">Address:</strong> {address}
          </p>
        )}
      </div>
      <div className="contact__actions">
        {button && (
          <button
            className="button button--secondary inline-flex items-center px-8 py-3 text-base font-semibold rounded-full bg-gray-100 text-[var(--text,#1c1c1c)] border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
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
