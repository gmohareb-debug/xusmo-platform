import React from "react";

export function ProfilePage({ name, email, avatar, bio, memberSince }) {
  return (
    <div className="profile-page">
      <div className="profile-page-header">
        {avatar && (
          <img
            className="profile-page-avatar"
            src={avatar}
            alt={`${name}'s avatar`}
          />
        )}
        <div className="profile-page-info">
          <h2 className="profile-page-name">{name}</h2>
          {email && <p className="profile-page-email">{email}</p>}
          {memberSince && (
            <p className="profile-page-member-since">
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>
      {bio && (
        <div className="profile-page-bio">
          <h3 className="profile-page-bio-title">About</h3>
          <p className="profile-page-bio-text">{bio}</p>
        </div>
      )}
    </div>
  );
}
