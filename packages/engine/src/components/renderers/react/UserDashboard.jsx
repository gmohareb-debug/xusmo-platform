import React from "react";

export function UserDashboard({ userName, stats = [], recentActivity = [] }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
      {/* Greeting */}
      <div className="mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          Welcome back, {userName}
        </h2>
      </div>

      {/* Stats grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 p-5 rounded-xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
            >
              <span
                className="text-2xl md:text-3xl font-bold"
                style={{ color: 'var(--accent, #3b82f6)' }}
              >
                {stat.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Recent Activity
          </h3>
          <ul
            className="list-none p-0 m-0 rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border, #e5e7eb)' }}
          >
            {recentActivity.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-4 py-3 transition-colors duration-150"
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--surface, #fff)' : 'transparent',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border, #e5e7eb)' : 'none',
                }}
              >
                <span className="text-sm">{item.action}</span>
                <span className="text-xs shrink-0 ml-4" style={{ color: 'var(--muted, #6b7280)' }}>
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
