"use client";

// =============================================================================
// Hero Visual — Animated browser mockup with floating notification cards
// Creates the "wow" factor on first page load
// =============================================================================

import { useEffect, useState } from "react";
import {
  Search,
  Smartphone,
  Lock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function HeroVisual() {
  // Typing animation for the headline
  const fullText = "Toronto's Most Trusted Plumbing Service";
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow behind browser */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-200/40 via-primary-300/30 to-accent-200/40 blur-2xl" />

      {/* ============================================================
          Floating notification cards around the browser
          ============================================================ */}

      {/* SEO Score — top right */}
      <div
        className="absolute -right-3 sm:-right-6 top-[15%] z-20 animate-float hidden sm:block"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="glass-light rounded-xl px-4 py-3 shadow-lg animate-notification" style={{ animationDelay: "1.2s" }}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">SEO Score</p>
              <p className="text-sm font-bold text-green-600">95/100</p>
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-green-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-progress-fill" style={{ width: "95%" }} />
          </div>
        </div>
      </div>

      {/* Mobile Ready — bottom left */}
      <div
        className="absolute -left-2 sm:-left-4 bottom-[25%] z-20 animate-float hidden sm:block"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="glass-light rounded-xl px-3 py-2.5 shadow-lg animate-notification" style={{ animationDelay: "1.8s" }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Smartphone className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-semibold text-neutral-700">Mobile Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* SSL Secured — bottom right */}
      <div
        className="absolute -right-1 sm:-right-3 bottom-[10%] z-20 animate-float hidden sm:block"
        style={{ animationDelay: "2.5s" }}
      >
        <div className="glass-light rounded-xl px-3 py-2.5 shadow-lg animate-notification" style={{ animationDelay: "2.4s" }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-neutral-700">SSL Secured</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          Browser Chrome
          ============================================================ */}
      <div className="relative rounded-2xl border border-surface-border bg-white shadow-xl overflow-hidden">
        {/* Title Bar with shimmer */}
        <div className="relative flex items-center gap-2 border-b border-surface-border bg-surface-muted px-4 py-3 overflow-hidden">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer-bar pointer-events-none" />
          <div className="flex gap-1.5 relative">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center relative">
            <div className="rounded-md bg-white border border-surface-border px-4 py-1 text-xs text-neutral-400 min-w-[240px] text-center flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-green-500" />
              www.mikeys-plumbing.com
            </div>
          </div>
          <div className="w-[52px] relative" />
        </div>

        {/* Fake Website Content */}
        <div className="p-0">
          {/* Nav */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border">
            <div className="font-display font-bold text-sm text-neutral-800">
              Mikey&apos;s Plumbing
            </div>
            <div className="hidden sm:flex gap-4 text-[10px] text-neutral-400">
              <span>Services</span>
              <span>About</span>
              <span>Reviews</span>
              <span>Contact</span>
            </div>
            <div className="rounded-md bg-primary-600 px-3 py-1 text-[10px] text-white font-medium">
              Get a Quote
            </div>
          </div>

          {/* Hero area */}
          <div className="relative bg-gradient-to-br from-primary-50 to-white p-8 sm:p-12">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <div className="rounded-full bg-primary-100 text-primary-600 text-[10px] font-semibold px-3 py-1 inline-block mb-3">
                  Licensed & Insured
                </div>
                {/* Typing headline */}
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 mb-3 leading-snug min-h-[3.5rem]">
                  {displayedText}
                  {!typingDone && (
                    <span
                      className={`inline-block w-[2px] h-5 sm:h-6 ml-0.5 bg-primary-500 align-middle transition-opacity ${
                        showCursor ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  )}
                </h2>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                  24/7 emergency service. Residential & commercial. Free
                  estimates for all jobs over $200.
                </p>
                <div className="flex gap-2">
                  <div className="rounded-md bg-primary-600 px-4 py-2 text-[10px] text-white font-semibold">
                    Book a Service
                  </div>
                  <div className="rounded-md border border-neutral-300 px-4 py-2 text-[10px] text-neutral-600 font-medium">
                    Call Now
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                {/* Placeholder image area */}
                <div className="rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 aspect-[4/3] flex items-center justify-center">
                  <div className="text-primary-300 text-center">
                    <svg
                      className="h-12 w-12 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <p className="text-[10px]">Professional hero image</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status indicator — Site Live */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse-dot" />
              <span className="text-[9px] font-semibold text-green-700">
                Site Live
              </span>
            </div>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 py-4 px-6 bg-white border-t border-surface-border">
            {[
              "24/7 Emergency",
              "Licensed & Insured",
              "5-Star Reviews",
              "Free Estimates",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 text-[10px] text-neutral-400"
              >
                <svg
                  className="h-3 w-3 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </span>
            ))}
          </div>

          {/* Services preview */}
          <div className="p-6 sm:p-8 bg-surface-cream">
            <p className="text-[10px] font-semibold text-primary-500 uppercase tracking-wider mb-1">
              Our Services
            </p>
            <p className="font-display text-sm font-bold text-neutral-800 mb-4">
              What We Can Do For You
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[
                "Drain Cleaning",
                "Pipe Repair",
                "Water Heaters",
                "Bathroom Reno",
              ].map((s) => (
                <div
                  key={s}
                  className="rounded-lg bg-white border border-surface-border p-3 text-center"
                >
                  <div className="h-6 w-6 mx-auto mb-1 rounded-md bg-primary-50" />
                  <p className="text-[9px] text-neutral-600 font-medium">
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance bar — new */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-surface-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-[9px] text-neutral-500 font-medium">Performance: Excellent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Search className="h-3 w-3 text-primary-400" />
                <span className="text-[9px] text-neutral-500 font-medium">SEO: Optimized</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-12 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-progress-fill" />
              </div>
              <span className="text-[9px] font-semibold text-green-600">95</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements for depth */}
      <div className="absolute -right-4 top-1/4 h-20 w-20 rounded-2xl bg-accent-400/10 blur-xl animate-float" />
      <div
        className="absolute -left-6 bottom-1/3 h-16 w-16 rounded-full bg-primary-400/10 blur-xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute -left-8 top-1/5 h-12 w-12 rounded-full bg-coral-400/10 blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}
