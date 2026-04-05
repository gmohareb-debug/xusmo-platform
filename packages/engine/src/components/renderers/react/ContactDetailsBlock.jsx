export function ContactDetailsBlock({ address, phone, email, hours }) {
  const items = [
    address && { label: "Address", value: address },
    phone && { label: "Phone", value: phone, href: `tel:${phone}` },
    email && { label: "Email", value: email, href: `mailto:${email}` },
    hours && { label: "Hours", value: hours },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted,#6b7280)]">
            {item.label}
          </span>
          {item.href ? (
            <a
              href={item.href}
              className="text-sm text-[var(--text,#1c1c1c)] no-underline hover:opacity-70 transition-opacity"
              style={{ color: "var(--accent, #3b82f6)" }}
            >
              {item.value}
            </a>
          ) : (
            <span className="text-sm text-[var(--text,#1c1c1c)]">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}
