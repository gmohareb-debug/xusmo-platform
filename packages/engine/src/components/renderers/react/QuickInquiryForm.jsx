import React, { useState } from "react";

export function QuickInquiryForm({
  title,
  fields = [],
  submitLabel = "Send",
}) {
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
    <div className="quick-inquiry-form">
      {title && <h3 className="quick-inquiry-form-title">{title}</h3>}
      {submitted ? (
        <p className="quick-inquiry-form-success">Inquiry sent!</p>
      ) : (
        <form className="quick-inquiry-form-body" onSubmit={handleSubmit}>
          <div className="quick-inquiry-form-fields">
            {fields.map((field) => (
              <input
                className="quick-inquiry-form-input"
                key={field.name}
                type="text"
                name={field.name}
                placeholder={field.placeholder || field.name}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ))}
          </div>
          <button className="quick-inquiry-form-submit" type="submit">
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
