import React from "react";

export function ActivityTimeline({ title = "Activity", events = [] }) {
  if (events.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
      >
        {title}
      </h2>
      <ul className="relative space-y-6" style={{ borderLeftColor: 'var(--border, #e5e7eb)', borderLeftWidth: '2px' }}>
        {events.map((event, index) => (
          <li key={index} className="relative pl-8">
            <div
              className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: 'var(--accent, #3b82f6)',
                borderColor: 'var(--surface, #fff)',
              }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--text, #1c1c1c)' }}>
                  {event.action}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted, #6b7280)' }}>
                  {event.date}
                </span>
              </div>
              {event.description && (
                <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
                  {event.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
