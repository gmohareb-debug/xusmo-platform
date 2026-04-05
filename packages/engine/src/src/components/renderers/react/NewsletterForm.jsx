import { useState } from "react";

export function NewsletterForm({
  title,
  description,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
  }

  return (
    <div className="newsletter-form">
      {title && <h2 className="newsletter-form-title">{title}</h2>}
      {description && (
        <p className="newsletter-form-description">{description}</p>
      )}
      {subscribed ? (
        <p className="newsletter-form-success">
          Thanks for subscribing!
        </p>
      ) : (
        <form className="newsletter-form-body" onSubmit={handleSubmit} noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            className="newsletter-form-input"
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
            aria-describedby={error ? "newsletter-error" : undefined}
          />
          <button
            className="newsletter-form-button"
            type="submit"
            aria-label="Subscribe to newsletter"
          >
            {buttonLabel}
          </button>
          {error && <p id="newsletter-error" className="newsletter-form-error">{error}</p>}
        </form>
      )}
    </div>
  );
}
