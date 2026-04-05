import { useState, useEffect } from "react";

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
    <div className="cookie-consent">
      <div className="cookie-consent-inner">
        <p className="cookie-consent-message">
          {message}
          {privacyHref && (
            <>
              {" "}
              <a href={privacyHref} className="cookie-consent-privacy-link">
                Privacy Policy
              </a>
            </>
          )}
        </p>
        <div className="cookie-consent-actions">
          <button
            className="cookie-consent-btn cookie-consent-accept"
            onClick={handleAccept}
          >
            {acceptLabel}
          </button>
          <button
            className="cookie-consent-btn cookie-consent-decline"
            onClick={handleDecline}
          >
            {declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
