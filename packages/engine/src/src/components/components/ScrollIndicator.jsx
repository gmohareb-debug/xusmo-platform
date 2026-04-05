export function ScrollIndicator({ targetId }) {
  return (
    <a
      className="scroll-indicator"
      href={targetId ? `#${targetId}` : "#"}
      aria-label="Scroll down"
    >
      <span className="scroll-indicator-chevron" />
    </a>
  );
}
