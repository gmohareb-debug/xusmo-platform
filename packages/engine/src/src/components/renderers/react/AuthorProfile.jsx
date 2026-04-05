export function AuthorProfile({ name, avatar, bio, socialLinks }) {
  return (
    <div className="author-profile">
      {avatar && (
        <img className="author-profile-avatar" src={avatar} alt={name || ""} />
      )}
      <div className="author-profile-info">
        {name && <h3 className="author-profile-name">{name}</h3>}
        {bio && <p className="author-profile-bio">{bio}</p>}
        {socialLinks && socialLinks.length > 0 && (
          <div className="author-profile-socials">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                className="author-profile-social-link"
                href={link?.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
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
