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
    <div className="contact-form">
      {title && <h2 className="contact-form-title">{title}</h2>}
      {submitted ? (
        <p className="contact-form-success">Thank you for your submission!</p>
      ) : (
        <form className="contact-form-body" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="contact-form-field" key={field.name}>
              {field.type === "textarea" ? (
                <textarea
                  className="contact-form-textarea"
                  name={field.name}
                  placeholder={field.placeholder || field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  className="contact-form-input"
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
          <button className="contact-form-submit" type="submit">
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
