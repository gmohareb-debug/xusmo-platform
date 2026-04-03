// Deterministic avatar from randomuser.me based on index
// Uses gender-neutral numbering: even = women, odd = men
function getRealisticAvatar(avatar, index) {
  if (avatar && !avatar.includes('placehold.co')) return avatar
  const gender = index % 2 === 0 ? 'women' : 'men'
  const id = 30 + ((index * 7 + 3) % 60) // varied but deterministic
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
}

// Deterministic color from name for initials fallback
const AVATAR_COLORS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316']
function getInitials(name) {
  if (!name) return '?'
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function Testimonials({ title, testimonials = [] }) {
  return (
    <section className="testimonials">
      {title && <h3 className="testimonials__title">{title}</h3>}
      <div className="testimonials__grid">
        {testimonials.map((record, index) => (
          <article key={index} className="testimonials__card">
            <p className="testimonials__quote">&ldquo;{record.quote}&rdquo;</p>
            <div className="testimonials__author">
              <img
                src={getRealisticAvatar(record.avatar, index)}
                alt={record.name}
                className="testimonials__avatar"
                onError={(e) => {
                  const initials = getInitials(record.name)
                  const color = getAvatarColor(record.name)
                  const div = document.createElement('div')
                  div.className = 'testimonials__avatar testimonials__avatar--initials'
                  div.style.cssText = `background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;border-radius:50%;width:48px;height:48px;flex-shrink:0;`
                  div.textContent = initials
                  e.currentTarget.replaceWith(div)
                }}
              />
              <div className="testimonials__author-info">
                <span className="testimonials__name">{record.name}</span>
                {record.role && <span className="testimonials__role">{record.role}</span>}
              </div>
            </div>
            {record.rating && (
              <div className="testimonials__stars">
                {'★'.repeat(Math.min(Math.max(Math.round(Number(record.rating)), 0), 5))}
                {'☆'.repeat(5 - Math.min(Math.max(Math.round(Number(record.rating)), 0), 5))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
