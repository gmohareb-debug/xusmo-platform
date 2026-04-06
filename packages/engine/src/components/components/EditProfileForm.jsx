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
    <form
      className="w-full max-w-lg mx-auto flex flex-col gap-5 px-4 py-8"
      onSubmit={handleSubmit}
    >
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold"
            style={{ color: 'var(--text, #1c1c1c)' }}
            htmlFor={field.name}
          >
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className="px-4 py-2.5 rounded-lg text-sm outline-none resize-y min-h-[100px]"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
                border: '1px solid var(--border, #e5e7eb)',
              }}
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : (
            <input
              className="px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
                border: '1px solid var(--border, #e5e7eb)',
              }}
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={formValues[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <button
        className="self-end px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
        style={{
          backgroundColor: 'var(--accent, #3b82f6)',
          color: 'var(--surface, #fff)',
        }}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
