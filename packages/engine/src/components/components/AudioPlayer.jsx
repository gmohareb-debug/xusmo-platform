export function AudioPlayer({ src, title }) {
  return (
    <div
      className="w-full max-w-xl mx-auto p-4 rounded-lg"
      style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
    >
      {title && (
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      <audio className="w-full block" src={src} controls preload="metadata">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
