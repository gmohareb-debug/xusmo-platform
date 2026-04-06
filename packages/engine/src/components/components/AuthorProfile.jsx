export function AuthorProfile({ name, avatar, bio, socialLinks }) {
  return (
    <div
      className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 rounded-xl"
      style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
    >
      {avatar && (
        <img
          className="w-16 h-16 rounded-full object-cover shrink-0"
          src={avatar}
          alt={name || ''}
        />
      )}
      <div className="text-center sm:text-left">
        {name && (
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
          >
            {name}
          </h3>
        )}
        {bio && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted, #6b7280)' }}>
            {bio}
          </p>
        )}
        {socialLinks && socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                className="inline-block text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                href={link?.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
              >
                {link?.platform || link?.label || 'Link'}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
