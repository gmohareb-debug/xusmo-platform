import React, { useState } from "react";

export function ContactForm({ title, fields = [], submitLabel = "Submit" }) {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = "";
    });
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
    <div className="contact-form max-w-xl mx-auto" id="contact">
      {title && (
        <h2 className="contact-form-title text-2xl md:text-3xl font-bold tracking-tight text-center mb-8"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      {submitted ? (
        <div className="flex items-center justify-center p-12 rounded-2xl bg-green-50 border border-green-200">
          <p className="contact-form-success text-base font-medium text-green-700 m-0">Thank you for your submission!</p>
        </div>
      ) : (
        <form className="contact-form-body flex flex-col gap-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="contact-form-field" key={field.name}>
              {field.type === "textarea" ? (
                <textarea
                  className="contact-form-textarea w-full px-4 py-3 text-base rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] placeholder:text-[var(--muted,#9ca3af)] outline-none focus:border-[var(--accent,#1f4dff)] focus:ring-2 focus:ring-[var(--accent,#1f4dff)]/20 transition-all duration-200 resize-y"
                  name={field.name}
                  placeholder={field.placeholder || field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  className="contact-form-input w-full px-4 py-3 text-base rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] placeholder:text-[var(--muted,#9ca3af)] outline-none focus:border-[var(--accent,#1f4dff)] focus:ring-2 focus:ring-[var(--accent,#1f4dff)]/20 transition-all duration-200"
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder || field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            className="contact-form-submit mt-2 w-full px-8 py-3.5 text-base font-semibold rounded-full bg-[var(--accent,#1f4dff)] text-white border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent,#1f4dff)]/25 transition-all duration-300"
            type="submit"
          >
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
