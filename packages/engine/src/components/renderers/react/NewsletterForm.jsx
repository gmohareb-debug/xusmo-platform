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
    if (!trimmed) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError("Please enter a valid email address."); return; }
    setSubscribed(true);
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      {title && (
        <h2
          className="text-2xl md:text-3xl font-bold text-[var(--text,#1c1c1c)] mb-3"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>
      )}
      {description && (
        <p className="text-base text-[var(--muted,#6b7280)] mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {subscribed ? (
        <div className="py-6">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--accent, #3b82f6)", opacity: 0.1 }}>
            <svg className="w-7 h-7" style={{ color: "var(--accent, #3b82f6)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[var(--text,#1c1c1c)]">Thanks for subscribing!</p>
        </div>
      ) : (
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit} noValidate>
          <input
            className="flex-1 px-5 py-3.5 rounded-xl border border-[var(--border,#e5e7eb)] bg-[var(--surface,#fff)] text-[var(--text,#1c1c1c)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent,#3b82f6)]/30 focus:border-[var(--accent,#3b82f6)] transition-all placeholder:text-[var(--muted,#6b7280)]"
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
          />
          <button
            className="px-8 py-3.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shrink-0"
            style={{ background: "var(--accent, #3b82f6)" }}
            type="submit"
          >
            {buttonLabel}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
