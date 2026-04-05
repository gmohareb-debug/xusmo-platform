// =============================================================================
// Sign In / Sign Up Page — Email + Password, Google OAuth when configured
// Reads callbackUrl and mode from query params for post-login redirect
// =============================================================================

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function SignInForm() {
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get("callbackUrl");
  const callbackUrl = explicitCallback || "/studio";
  const mode = searchParams.get("mode"); // "signup" | "signin" | null

  const fromInterview = explicitCallback?.includes("/interview");

  const [isSignUp, setIsSignUp] = useState(mode === "signin" ? false : true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      name: isSignUp ? name.trim() : "",
      isSignUp: String(isSignUp),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === "CredentialsSignin"
        ? isSignUp
          ? "An account with this email may already exist. Try signing in."
          : "Invalid email or password."
        : result.error
      );
      setLoading(false);
    } else if (result?.ok) {
      // Successful auth — role-based redirect
      if (explicitCallback) {
        // Respect explicit callbackUrl (e.g. middleware redirect from a protected page)
        window.location.href = explicitCallback;
      } else {
        // No explicit callback — route by role
        try {
          const sess = await fetch("/api/auth/session").then((r) => r.json());
          window.location.href = sess?.user?.role === "ADMIN" ? "/admin" : "/studio";
        } catch {
          window.location.href = "/studio";
        }
      }
    }
  }

  const inputStyle = {
    backgroundColor: "#ffffff",
    border: "1.5px solid #E2E8F0",
    color: "#1E293B",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#818CF8";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#E2E8F0";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-3xl font-bold tracking-tight text-neutral-900"
          >
            Xus<span style={{ color: "#4F46E5" }}>mo</span>
          </Link>
          <p className="mt-2 text-neutral-500">
            {isSignUp ? "Create your free account" : "Welcome back"}
          </p>
        </div>

        {/* Interview context banner */}
        {fromInterview && isSignUp && (
          <div
            className="mb-4 rounded-xl p-4 text-center"
            style={{
              backgroundColor: "#EEF2FF",
              border: "1px solid #C7D2FE",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#4338CA" }}>
              Almost there! Create an account to generate your website.
            </p>
            <p className="mt-1 text-xs" style={{ color: "#6366F1" }}>
              Your interview answers are saved and ready to go.
            </p>
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Google OAuth (when configured) */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E2E8F0",
                  color: "#1E293B",
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid #E2E8F0" }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-neutral-400">or</span>
                </div>
              </div>
            </>
          )}

          {/* Email + Password form */}
          <form onSubmit={handleSubmit}>
            {/* Name field — signup only */}
            {isSignUp && (
              <>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoFocus
                />
              </>
            )}

            <label className={`mb-2 block text-sm font-medium text-neutral-700 ${isSignUp ? "mt-4" : ""}`}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />

            <label className="mb-2 mt-4 block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              minLength={6}
            />

            {error && (
              <p className="mt-2 text-sm" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              style={{ backgroundColor: "#4F46E5" }}
            >
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                  ? "Create Free Account"
                  : "Sign In"}
            </button>
          </form>

          {/* Toggle sign-up / sign-in */}
          <p className="mt-4 text-center text-sm text-neutral-500">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setIsSignUp(false); setError(""); }}
                  className="font-medium transition-colors"
                  style={{ color: "#4F46E5" }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setIsSignUp(true); setError(""); }}
                  className="font-medium transition-colors"
                  style={{ color: "#4F46E5" }}
                >
                  Create one free
                </button>
              </>
            )}
          </p>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-600"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
          <div className="text-neutral-400">Loading...</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
