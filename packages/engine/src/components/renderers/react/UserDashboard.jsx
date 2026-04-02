import React from "react";

export function UserDashboard({ userName, stats = [], recentActivity = [] }) {
  return (
    <div className="user-dashboard">
      <div className="user-dashboard-header">
        <h2 className="user-dashboard-greeting">
          Welcome back, {userName}
        </h2>
      </div>

      {stats.length > 0 && (
        <div className="user-dashboard-stats">
          {stats.map((stat, index) => (
            <div key={index} className="user-dashboard-stat-card">
              <span className="user-dashboard-stat-value">{stat.value}</span>
              <span className="user-dashboard-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {recentActivity.length > 0 && (
        <div className="user-dashboard-activity">
          <h3 className="user-dashboard-activity-title">Recent Activity</h3>
          <ul className="user-dashboard-activity-list">
            {recentActivity.map((item, index) => (
              <li key={index} className="user-dashboard-activity-item">
                <span className="user-dashboard-activity-action">
                  {item.action}
                </span>
                <span className="user-dashboard-activity-date">
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
