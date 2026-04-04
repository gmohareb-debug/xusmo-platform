function getRealisticAvatar(avatar, index) {
  if (avatar && !avatar.includes('placehold.co')) return avatar
  const gender = index % 2 === 0 ? 'women' : 'men'
  const id = 30 + ((index * 7 + 3) % 60)
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
}

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
      {title && (
        <h3 className="testimonials__title text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight m-0"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h3>
      )}
      <div className="testimonials__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((record, index) => (
          <article
            key={index}
            className="testimonials__card bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border,#e5e7eb)] p-8 flex flex-col gap-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <p className="testimonials__quote text-base leading-relaxed text-[var(--text,#1c1c1c)]/80 italic flex-1 m-0">
              &ldquo;{record.quote}&rdquo;
            </p>
            <div className="testimonials__author flex items-center gap-3">
              <img
                src={getRealisticAvatar(record.avatar, index)}
                alt={record.name}
                className="testimonials__avatar w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-[var(--border,#e5e7eb)]"
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
              <div className="testimonials__author-info flex flex-col">
                <span className="testimonials__name text-sm font-semibold text-[var(--text,#1c1c1c)]">{record.name}</span>
                {record.role && <span className="testimonials__role text-xs text-[var(--muted,#6b7280)]">{record.role}</span>}
              </div>
            </div>
            {record.rating && (
              <div className="testimonials__stars text-amber-400 text-base tracking-wide">
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
