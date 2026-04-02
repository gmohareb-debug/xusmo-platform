import React from "react";

export function ActivityTimeline({ title = "Activity", events = [] }) {
  if (events.length === 0) {
    return (
      <div className="activity-timeline">
        <h2 className="activity-timeline-title">{title}</h2>
        <p className="activity-timeline-empty">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      <h2 className="activity-timeline-title">{title}</h2>
      <ul className="activity-timeline-list">
        {events.map((event, index) => (
          <li key={index} className="activity-timeline-item">
            <div className="activity-timeline-marker" aria-hidden="true" />
            <div className="activity-timeline-content">
              <div className="activity-timeline-header">
                <span className="activity-timeline-action">{event.action}</span>
                <span className="activity-timeline-date">{event.date}</span>
              </div>
              {event.description && (
                <p className="activity-timeline-description">
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
