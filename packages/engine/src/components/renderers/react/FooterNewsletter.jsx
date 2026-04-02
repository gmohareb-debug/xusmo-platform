import React from "react";

export function FooterNewsletter({
  title,
  description,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="footer-newsletter">
      {title && <h3 className="footer-newsletter-title">{title}</h3>}
      {description && (
        <p className="footer-newsletter-description">{description}</p>
      )}
      <form className="footer-newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="footer-newsletter-input"
          placeholder={placeholder}
          required
        />
        <button type="submit" className="footer-newsletter-btn">
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
