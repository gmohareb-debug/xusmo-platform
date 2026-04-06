export function MaintenanceNotice({
  title = 'Under Maintenance',
  message,
  estimatedTime,
}) {
  return (
    <div className="flex items-center justify-center min-h-[40vh] px-4 py-12">
      <div
        className="w-full max-w-md p-8 rounded-xl text-center"
        style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <h2
          className="text-xl md:text-2xl font-bold mb-3"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        {message && (
          <p className="text-sm mb-4" style={{ color: 'var(--muted, #6b7280)' }}>
            {message}
          </p>
        )}
        {estimatedTime && (
          <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
            Estimated time: <strong style={{ color: 'var(--text, #1c1c1c)' }}>{estimatedTime}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
