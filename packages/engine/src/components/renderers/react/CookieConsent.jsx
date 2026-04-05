import { useState } from "react";

const STORAGE_KEY = "xusmo-cookie-consent";

export function CookieConsent({
  message,
  acceptLabel = "Accept",
  declineLabel = "Decline",
  privacyHref,
}) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  function handleAccept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setDismissed(true);
  }

  function handleDecline() {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch {}
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[var(--surface,#fff)] border border-[var(--border,#e5e7eb)] rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-[var(--muted,#6b7280)] m-0 leading-relaxed">
          {message}
          {privacyHref && (
            <>
              {" "}
              <a
                href={privacyHref}
                className="text-[var(--accent,#3b82f6)] underline hover:no-underline"
              >
                Privacy Policy
              </a>
            </>
          )}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity duration-200"
            style={{ background: "var(--accent, #3b82f6)" }}
            onClick={handleAccept}
          >
            {acceptLabel}
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--muted,#6b7280)] bg-transparent border border-[var(--border,#e5e7eb)] cursor-pointer hover:bg-[var(--border,#e5e7eb)]/30 transition-colors duration-200"
            onClick={handleDecline}
          >
            {declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
