import React, { useState } from "react";

export function ReviewForm({ title, ratingEnabled = true }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const maxStars = 5;

  function handleSubmit(e) {
    e.preventDefault();
    if (review.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <div className="review-form">
      {title && <h2 className="review-form-title">{title}</h2>}
      {submitted ? (
        <p className="review-form-success">Thank you for your review!</p>
      ) : (
        <form className="review-form-body" onSubmit={handleSubmit}>
          {ratingEnabled && (
            <div className="review-form-rating">
              {Array.from({ length: maxStars }, (_, i) => {
                const starIndex = i + 1;
                const filled = starIndex <= (hovered || rating);
                return (
                  <span
                    className={
                      "review-form-star" +
                      (filled ? " review-form-star-filled" : "")
                    }
                    key={starIndex}
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHovered(starIndex)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ cursor: "pointer", fontSize: "24px" }}
                    role="button"
                    aria-label={`Rate ${starIndex} of ${maxStars}`}
                  >
                    {filled ? "\u2605" : "\u2606"}
                  </span>
                );
              })}
            </div>
          )}
          <textarea
            className="review-form-textarea"
            placeholder="Write your review..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            required
          />
          <button className="review-form-submit" type="submit">
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}
