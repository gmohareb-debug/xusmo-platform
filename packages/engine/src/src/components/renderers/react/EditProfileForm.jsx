import React, { useState } from "react";

export function EditProfileForm({ fields = [], submitLabel = "Save Changes" }) {
  const initialValues = {};
  fields.forEach((field) => {
    initialValues[field.name] = field.value || "";
  });

  const [formValues, setFormValues] = useState(initialValues);

  function handleChange(fieldName, newValue) {
    setFormValues((prev) => ({ ...prev, [fieldName]: newValue }));
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="edit-profile-form-group">
          <label className="edit-profile-form-label" htmlFor={field.name}>
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className="edit-profile-form-textarea"
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : (
            <input
              className="edit-profile-form-input"
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={formValues[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <button className="edit-profile-form-submit" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
