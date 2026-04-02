import React, { useState } from "react";

export function FeedbackForm({ title, options = [] }) {
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (selected !== null) {
      setSubmitted(true);
    }
  }

  return (
    <div className="feedback-form">
      {title && <h2 className="feedback-form-title">{title}</h2>}
      {submitted ? (
        <p className="feedback-form-success">Thank you for your feedback!</p>
      ) : (
        <form className="feedback-form-body" onSubmit={handleSubmit}>
          <div className="feedback-form-options">
            {options.map((option) => (
              <label className="feedback-form-option" key={option.value}>
                <input
                  className="feedback-form-radio"
                  type="radio"
                  name="feedback"
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() => setSelected(option.value)}
                />
                <span className="feedback-form-option-label">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <textarea
            className="feedback-form-textarea"
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <button
            className="feedback-form-submit"
            type="submit"
            disabled={selected === null}
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}
