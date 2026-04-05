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

function StarIcon({ filled }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill={filled ? '#f59e0b' : '#e5e7eb'}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function AvatarImg({ src, name, index }) {
  return (
    <img
      src={getRealisticAvatar(src, index)}
      alt={name}
      className="w-12 h-12 rounded-full object-cover shrink-0"
      style={{ boxShadow: '0 0 0 3px var(--accent, #3b82f6)' }}
      onError={(e) => {
        const initials = getInitials(name)
        const color = getAvatarColor(name)
        const div = document.createElement('div')
        div.style.cssText = `background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;border-radius:50%;width:48px;height:48px;flex-shrink:0;`
        div.textContent = initials
        e.currentTarget.replaceWith(div)
      }}
    />
  )
}

export function Testimonials({ title, testimonials = [], layout = 'grid' }) {

  // ── Single featured quote ──
  if (layout === 'single' && testimonials.length > 0) {
    const t = testimonials[0]
    return (
      <section className="max-w-4xl mx-auto text-center">
        <div className="text-[8rem] leading-none font-serif opacity-[0.08] mb-[-3rem]" style={{ color: 'var(--accent, #3b82f6)' }}>&ldquo;</div>
        {title && <h3 className="text-2xl font-bold mb-10 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{title}</h3>}
        <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium leading-snug text-[var(--text,#1c1c1c)] mb-10 italic" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <AvatarImg src={t.avatar} name={t.name} index={0} />
          <div className="text-left">
            <div className="font-semibold text-[var(--text,#1c1c1c)]">{t.name}</div>
            {t.role && <div className="text-sm text-[var(--muted,#6b7280)]">{t.role}</div>}
          </div>
        </div>
      </section>
    )
  }

  // ── Marquee / horizontal scroll ─��
  if (layout === 'marquee') {
    return (
      <section>
        {title && (
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {title}
          </h3>
        )}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {testimonials.map((record, index) => (
            <article key={index} className="flex-none w-[340px] snap-center bg-[var(--surface,#fff)] rounded-2xl p-8 border border-[var(--border,#e5e7eb)] flex flex-col gap-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {record.rating && (
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(Number(record.rating))} />)}</div>
              )}
              <p className="text-sm leading-relaxed text-[var(--text,#1c1c1c)]/80 italic flex-1 m-0">&ldquo;{record.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border,#e5e7eb)]">
                <AvatarImg src={record.avatar} name={record.name} index={index} />
                <div>
                  <div className="text-sm font-semibold text-[var(--text,#1c1c1c)]">{record.name}</div>
                  {record.role && <div className="text-xs text-[var(--muted,#6b7280)]">{record.role}</div>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  // ── Grid (default) ──
  return (
    <section className="relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12rem] leading-none font-serif pointer-events-none select-none opacity-[0.06]" style={{ color: 'var(--accent, #3b82f6)' }}>&ldquo;</div>
      {title && (
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-14 tracking-tight m-0 relative z-10 text-[var(--text,#1c1c1c)]" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h3>
      )}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((record, index) => (
          <article key={index} className="relative bg-[var(--surface,#fff)] rounded-2xl p-8 lg:p-10 flex flex-col gap-6 hover:shadow-xl transition-all duration-500" style={{ borderLeft: '4px solid var(--accent, #3b82f6)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {record.rating && (
              <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(star => <StarIcon key={star} filled={star <= Math.round(Number(record.rating))} />)}</div>
            )}
            <p className="text-base lg:text-lg leading-relaxed text-[var(--text,#1c1c1c)]/80 italic flex-1 m-0">&ldquo;{record.quote}&rdquo;</p>
            <div className="flex items-center gap-4 pt-2 border-t border-[var(--border,#e5e7eb)]">
              <AvatarImg src={record.avatar} name={record.name} index={index} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--text,#1c1c1c)]">{record.name}</span>
                {record.role && <span className="text-xs text-[var(--muted,#6b7280)] mt-0.5">{record.role}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
