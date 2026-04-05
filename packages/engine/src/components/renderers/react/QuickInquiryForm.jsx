import { useState } from "react";

export function QuickInquiryForm({
  title,
  fields = [],
  submitLabel = "Send",
}) {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => { initial[f.name] = ""; });
    return initial;
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] rounded-2xl p-8 md:p-10 shadow-lg">
      {title && (
        <h3
          className="text-2xl md:text-3xl font-bold text-[var(--text,#1c1c1c)] mb-6 text-center"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h3>
      )}
      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--accent, #3b82f6)", opacity: 0.1 }}>
            <svg className="w-8 h-8" style={{ color: "var(--accent, #3b82f6)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[var(--text,#1c1c1c)]">Inquiry sent!</p>
          <p className="text-sm text-[var(--muted,#6b7280)] mt-1">We'll get back to you shortly.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <input
              className="w-full px-4 py-3 rounded-xl border border-[var(--border,#e5e7eb)] bg-[var(--background,#fff)] text-[var(--text,#1c1c1c)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent,#3b82f6)]/30 focus:border-[var(--accent,#3b82f6)] transition-all duration-200 placeholder:text-[var(--muted,#6b7280)]/60"
              key={field.name}
              type="text"
              name={field.name}
              placeholder={field.placeholder || field.name}
              value={values[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ))}
          <button
            className="w-full py-3 rounded-xl text-white text-sm font-semibold border-none cursor-pointer hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            style={{ background: "var(--accent, #3b82f6)" }}
            type="submit"
          >
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
