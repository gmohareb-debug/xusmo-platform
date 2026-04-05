export function CopyrightNotice({ text, year }) {
  return (
    <p className="text-center text-xs text-[var(--muted,#6b7280)] py-4 m-0">
      &copy; {year || new Date().getFullYear()} {text}
    </p>
  );
}
