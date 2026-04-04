export function Contact({ title, description, email, phone, address, button }) {
  function handleScrollToForm() {
    const form = document.getElementById('contact') || document.querySelector('.contact-form')
    if (form) form.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        {title && (
          <h3
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p className="text-lg text-[var(--muted,#6b7280)] leading-relaxed max-w-xl mx-auto">{description}</p>
        )}
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {email && (
          <a
            href={`mailto:${email}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] no-underline text-[var(--text,#1c1c1c)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent, #3b82f6)', opacity: 0.1 }}>
              <svg className="w-5 h-5" style={{ color: 'var(--accent, #3b82f6)', opacity: 10 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted,#6b7280)] font-medium">Email</span>
            <span className="text-sm font-semibold text-center">{email}</span>
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] no-underline text-[var(--text,#1c1c1c)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent, #3b82f6)', opacity: 0.1 }}>
              <svg className="w-5 h-5" style={{ color: 'var(--accent, #3b82f6)', opacity: 10 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted,#6b7280)] font-medium">Phone</span>
            <span className="text-sm font-semibold text-center">{phone}</span>
          </a>
        )}
        {address && (
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent, #3b82f6)', opacity: 0.1 }}>
              <svg className="w-5 h-5" style={{ color: 'var(--accent, #3b82f6)', opacity: 10 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
            </div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted,#6b7280)] font-medium">Address</span>
            <span className="text-sm font-semibold text-center text-[var(--text,#1c1c1c)]">{address}</span>
          </div>
        )}
      </div>

      {button && (
        <div className="text-center">
          <button
            className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-full text-white border-none cursor-pointer hover:-translate-y-0.5 transition-all duration-300"
            type="button"
            onClick={handleScrollToForm}
            style={{
              background: 'var(--accent, #3b82f6)',
              boxShadow: '0 8px 30px -4px var(--accent, #3b82f6)',
            }}
          >
            {button}
          </button>
        </div>
      )}
    </section>
  )
}
