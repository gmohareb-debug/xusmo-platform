"use client";

// =============================================================================
// Settings Page — Profile, notifications, data export, account deletion
// =============================================================================

import { useState } from "react";

interface ProfileData {
  name: string;
  email: string;
}

interface NotificationPrefs {
  siteStatus: boolean;
  billing: boolean;
  promotions: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    siteStatus: true,
    billing: true,
    promotions: false,
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — would PATCH /api/user/profile
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  function handleNotifSave() {
    // Placeholder — would PATCH /api/user/notifications
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
        Manage your profile, preferences, and account.
      </p>

      {/* Profile section */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Profile Photo</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                Avatar is generated from your name
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#4F46E5" }}
            >
              Save Changes
            </button>
            {profileSaved && (
              <span className="text-xs font-medium" style={{ color: "#16A34A" }}>
                Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-2">
          Password
        </h2>
        <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
          Update your password to keep your account secure.
        </p>
        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#64748B" }}
            >
              Current Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
              }}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#64748B" }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Notification preferences */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            {
              key: "siteStatus" as const,
              label: "Site Status Updates",
              desc: "Get notified when your site build completes, goes live, or has issues",
            },
            {
              key: "billing" as const,
              label: "Billing Alerts",
              desc: "Payment confirmations, upcoming charges, and billing issues",
            },
            {
              key: "promotions" as const,
              label: "Product Updates",
              desc: "New features, tips, and special offers",
            },
          ].map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">{pref.label}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {pref.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotifications({
                    ...notifications,
                    [pref.key]: !notifications[pref.key],
                  });
                }}
                className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: notifications[pref.key] ? "#4F46E5" : "#E2E8F0",
                }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{
                    left: notifications[pref.key] ? "calc(100% - 22px)" : "2px",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleNotifSave}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Save Preferences
          </button>
          {notifSaved && (
            <span className="text-xs font-medium" style={{ color: "#16A34A" }}>
              Saved!
            </span>
          )}
        </div>
      </div>

      {/* Connected services */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-2">
          Connected Services
        </h2>
        <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
          Connect third-party services to enhance your website.
        </p>
        <div className="space-y-3">
          {[
            { name: "Google Analytics", desc: "Track website traffic and visitor behavior", connected: false },
            { name: "Google Search Console", desc: "Monitor search performance and indexing", connected: false },
          ].map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between rounded-xl p-4"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{svc.name}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {svc.desc}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: svc.connected ? "#F0FDF4" : "#EEF2FF",
                  color: svc.connected ? "#16A34A" : "#4F46E5",
                }}
              >
                {svc.connected ? "Connected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data & Account */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0" }}
      >
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
          Data & Account
        </h2>

        {/* Export */}
        <div className="flex items-center justify-between mb-5 pb-5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <p className="text-sm font-medium text-neutral-900">Export Your Data</p>
            <p className="text-xs" style={{ color: "#94A3B8" }}>
              Download all your account data, sites, and content
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "#F1F5F9",
              color: "#475569",
            }}
          >
            Export Data
          </button>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">Delete Account</p>
            <p className="text-xs" style={{ color: "#94A3B8" }}>
              Permanently delete your account and all associated data
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
              }}
            >
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "#DC2626" }}
              >
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
