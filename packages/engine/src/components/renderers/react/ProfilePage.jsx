import React from "react";

export function ProfilePage({ name, email, avatar, bio, memberSince }) {
  return (
    <div
      className="w-full max-w-2xl mx-auto px-4 py-8"
      style={{ color: 'var(--text, #1c1c1c)' }}
    >
      {/* Header card */}
      <div
        className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-xl"
        style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        {avatar && (
          <img
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shrink-0"
            style={{ border: '3px solid var(--accent, #3b82f6)' }}
            src={avatar}
            alt={`${name}'s avatar`}
          />
        )}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {name}
          </h2>
          {email && (
            <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>{email}</p>
          )}
          {memberSince && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted, #6b7280)' }}>
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      {/* Bio section */}
      {bio && (
        <div className="mt-6">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            About
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted, #6b7280)' }}>
            {bio}
          </p>
        </div>
      )}
    </div>
  );
}
