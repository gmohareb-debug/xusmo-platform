"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Button from "../ui/Button";

const NAV_LINKS = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Features", href: "/#industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "Examples", href: "/examples" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl border-b border-surface-border shadow-sm"
              : "bg-transparent"
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 py-4">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            Xus<span className="text-primary-600">mo</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                href="/studio"
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
              >
                My Sites
              </Link>
            )}
            {session && (session.user as Record<string, unknown>)?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <Link href="/studio">
                <Button variant="primary" size="sm">
                  Studio
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/interview">
                  <Button variant="primary" size="sm" arrow>
                    Build My Free Website
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`
            absolute top-0 right-0 h-full w-80 max-w-[85vw]
            bg-white shadow-2xl
            transition-transform duration-300 ease-out
            ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex flex-col h-full pt-20 px-6 pb-8">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <Link
                  href="/studio"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  My Sites
                </Link>
              )}
              {session && (session.user as Record<string, unknown>)?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {session ? (
                <Link href="/studio" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">
                    Studio
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/interview" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="lg" className="w-full" arrow>
                      Build My Free Website
                    </Button>
                  </Link>
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="lg" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
