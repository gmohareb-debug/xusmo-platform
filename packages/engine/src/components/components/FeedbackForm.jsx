import { useState } from 'react';

export function FeedbackForm({ title, options = [] }) {
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (selected !== null) {
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
          Thank you for your feedback!
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: selected === option.value ? 'var(--accent, #3b82f6)' : 'var(--bg, #fff)',
                  color: selected === option.value ? 'var(--surface, #fff)' : 'var(--text, #1c1c1c)',
                  border: '1px solid var(--border, #e5e7eb)',
                }}
              >
                <input
                  className="accent-current"
                  type="radio"
                  name="feedback"
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() => setSelected(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          <textarea
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-vertical"
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{
              color: 'var(--text, #1c1c1c)',
              backgroundColor: 'var(--bg, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          />
          <button
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={selected === null}
            style={{ color: 'var(--surface, #fff)', backgroundColor: 'var(--accent, #3b82f6)' }}
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}
