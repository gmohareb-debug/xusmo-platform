import Link from "next/link";
import Container from "../ui/Container";

const FOOTER_LINKS = {
  Product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Industries", href: "/#industries" },
    { label: "Examples", href: "/examples" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "#" },
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "API", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-midnight text-neutral-300">
      <Container width="wide" className="pt-16 pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 pb-12 border-b border-surface-border-dark">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl font-bold text-white tracking-tight">
              Xus<span className="text-primary-400">mo</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              AI builds your professional website for free. Go live with hosting for $11.99/mo.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-primary-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Xusmo. All rights reserved. Built with AI, powered by WordPress.
          </p>
          <div className="flex items-center gap-6">
            {/* Social placeholders — small circle icons */}
            {["X", "LI", "GH"].map((s) => (
              <span
                key={s}
                className="h-8 w-8 rounded-full bg-surface-card flex items-center justify-center text-xs text-neutral-400 hover:bg-surface-card-hover hover:text-white transition-colors cursor-pointer"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
