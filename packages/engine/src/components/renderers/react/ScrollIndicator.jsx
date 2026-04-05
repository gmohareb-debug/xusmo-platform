export function ScrollIndicator({ targetId }) {
  return (
    <a
      className="flex flex-col items-center gap-2 py-4 no-underline opacity-60 hover:opacity-100 transition-opacity duration-300"
      href={targetId ? `#${targetId}` : "#"}
      aria-label="Scroll down"
    >
      <svg
        className="w-6 h-6 text-[var(--text,#1c1c1c)] animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  );
}
