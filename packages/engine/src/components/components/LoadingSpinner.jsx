const sizeMap = {
  sm: 20,
  md: 40,
  lg: 64,
};

export function LoadingSpinner({ size = 'md', label }) {
  const dimension = sizeMap[size] || sizeMap.md;
  const borderWidth = dimension >= 64 ? 5 : dimension >= 40 ? 4 : 3;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <style>{`@keyframes xusmo-spin { to { transform: rotate(360deg) } }`}</style>
      <div
        className="rounded-full"
        role="status"
        style={{
          width: dimension,
          height: dimension,
          border: `${borderWidth}px solid var(--border, #e5e7eb)`,
          borderTopColor: 'var(--accent, #3b82f6)',
          animation: 'xusmo-spin 0.8s linear infinite',
        }}
      />
      {label && (
        <span className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
