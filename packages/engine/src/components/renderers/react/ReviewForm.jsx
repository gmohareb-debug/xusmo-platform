import { useState } from 'react';

export function ReviewForm({ title, ratingEnabled = true }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const maxStars = 5;

  function handleSubmit(e) {
    e.preventDefault();
    if (review.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <div
      className="w-full max-w-lg mx-auto p-6 rounded-xl"
      style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
    >
      {title && (
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      {submitted ? (
        <p className="text-sm font-medium py-4 text-center" style={{ color: 'var(--accent, #3b82f6)' }}>
          Thank you for your review!
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {ratingEnabled && (
            <div className="flex gap-1">
              {Array.from({ length: maxStars }, (_, i) => {
                const starIndex = i + 1;
                const filled = starIndex <= (hovered || rating);
                return (
                  <span
                    key={starIndex}
                    className="cursor-pointer text-2xl select-none transition-transform hover:scale-110"
                    style={{ color: filled ? 'var(--accent, #3b82f6)' : 'var(--border, #e5e7eb)' }}
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHovered(starIndex)}
                    onMouseLeave={() => setHovered(0)}
                    role="button"
                    aria-label={`Rate ${starIndex} of ${maxStars}`}
                  >
                    {filled ? '\u2605' : '\u2606'}
                  </span>
                );
              })}
            </div>
          )}
          <textarea
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-vertical"
            placeholder="Write your review..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            required
            style={{
              color: 'var(--text, #1c1c1c)',
              backgroundColor: 'var(--bg, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          />
          <button
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-80"
            type="submit"
            style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}
