import React, { useState } from "react";

export function ContactForm({ title, fields = [], submitLabel = "Submit" }) {
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
    <div className="max-w-xl mx-auto" id="contact">
      {title && (
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-center mb-10 text-[var(--text,#1c1c1c)]"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}

      {submitted ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-green-200" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2 m-0">Thank you!</h3>
          <p className="text-green-600 m-0">We'll get back to you shortly.</p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="relative" key={field.name}>
              {field.label && (
                <label className="block text-sm font-medium text-[var(--text,#1c1c1c)] mb-2">
                  {field.label}
                  {field.required && <span className="ml-0.5" style={{ color: 'var(--accent, #3b82f6)' }}>*</span>}
                </label>
              )}
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-5 py-3.5 text-base rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] placeholder:text-gray-400 outline-none transition-all duration-200 resize-y"
                  name={field.name}
                  placeholder={field.placeholder || field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={4}
                  style={{ '--tw-ring-color': 'var(--accent, #3b82f6)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent, #3b82f6)'; e.target.style.boxShadow = '0 0 0 3px var(--accent, #3b82f6)20'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
              ) : (
                <input
                  className="w-full h-12 px-5 text-base rounded-xl bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] text-[var(--text,#1c1c1c)] placeholder:text-gray-400 outline-none transition-all duration-200"
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder || field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent, #3b82f6)'; e.target.style.boxShadow = '0 0 0 3px var(--accent, #3b82f6)20'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
              )}
            </div>
          ))}
          <button
            className="mt-3 w-full sm:w-auto sm:px-12 h-12 text-base font-semibold rounded-xl text-white border-none cursor-pointer hover:-translate-y-0.5 transition-all duration-300"
            type="submit"
            style={{
              background: 'var(--accent, #3b82f6)',
              boxShadow: '0 6px 20px -4px var(--accent, #3b82f6)',
            }}
          >
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
