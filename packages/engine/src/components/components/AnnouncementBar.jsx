import { useState } from 'react';

export function AnnouncementBar({ text, link, dismissible = false }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="w-full py-2.5 px-4"
      role="banner"
      style={{ backgroundColor: 'var(--accent, #3b82f6)', color: 'var(--surface, #fff)' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
        <p className="text-xs sm:text-sm font-medium text-center">
          {text}
          {link && (
            <a
              className="ml-2 underline font-semibold transition-opacity hover:opacity-80"
              href={link.href || '#'}
              style={{ color: 'inherit' }}
            >
              {link.label}
            </a>
          )}
        </p>

        {dismissible && (
          <button
            className="shrink-0 p-1 bg-transparent border-0 cursor-pointer transition-opacity hover:opacity-70"
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setVisible(false)}
            style={{ color: 'inherit' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
