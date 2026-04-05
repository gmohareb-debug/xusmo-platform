import React, { useState } from "react";

export function CommentSection({ title, comments = [] }) {
  const [allComments, setAllComments] = useState(comments);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (author.trim() && text.trim()) {
      setAllComments((prev) => [
        ...prev,
        {
          author: author.trim(),
          text: text.trim(),
          date: new Date().toLocaleDateString(),
        },
      ]);
      setAuthor("");
      setText("");
    }
  }

  return (
    <div className="comment-section">
      {title && <h2 className="comment-section-title">{title}</h2>}
      <div className="comment-section-list">
        {allComments.length === 0 && (
          <p className="comment-section-empty">
            No comments yet. Be the first to comment!
          </p>
        )}
        {allComments.map((comment, i) => (
          <div className="comment-section-item" key={i}>
            <div className="comment-section-item-header">
              <span className="comment-section-item-author">
                {comment.author}
              </span>
              {comment.date && (
                <span className="comment-section-item-date">
                  {comment.date}
                </span>
              )}
            </div>
            <p className="comment-section-item-text">{comment.text}</p>
          </div>
        ))}
      </div>
      <form className="comment-section-form" onSubmit={handleSubmit}>
        <h4 className="comment-section-form-title">Add a Comment</h4>
        <input
          className="comment-section-form-author"
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <textarea
          className="comment-section-form-text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          required
        />
        <button className="comment-section-form-submit" type="submit">
          Post Comment
        </button>
      </form>
    </div>
  );
}
