import { onImgError } from './imgFallback'

// Deterministic avatar from randomuser.me based on index
// Uses gender-neutral numbering: even = women, odd = men
function getRealisticAvatar(avatar, index) {
  if (avatar && !avatar.includes('placehold.co')) return avatar
  const gender = index % 2 === 0 ? 'women' : 'men'
  const id = 30 + ((index * 7 + 3) % 60) // varied but deterministic
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
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
                onError={e => onImgError(e, 80, 80)}
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
