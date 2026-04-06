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
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {title && (
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      <div className="space-y-4 mb-8">
        {allComments.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>
            No comments yet. Be the first to comment!
          </p>
        )}
        {allComments.map((comment, i) => (
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: 'var(--surface, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
            }}
            key={i}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text, #1c1c1c)' }}
              >
                {comment.author}
              </span>
              {comment.date && (
                <span className="text-xs" style={{ color: 'var(--muted, #6b7280)' }}>
                  {comment.date}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text, #1c1c1c)' }}>
              {comment.text}
            </p>
          </div>
        ))}
      </div>
      <form
        className="flex flex-col gap-3 p-5 rounded-xl"
        style={{
          backgroundColor: 'var(--surface, #fff)',
          border: '1px solid var(--border, #e5e7eb)',
        }}
        onSubmit={handleSubmit}
      >
        <h4
          className="text-base font-semibold"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          Add a Comment
        </h4>
        <input
          className="px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            color: 'var(--text, #1c1c1c)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <textarea
          className="px-4 py-2.5 rounded-lg text-sm outline-none resize-y"
          style={{
            backgroundColor: 'var(--surface, #fff)',
            color: 'var(--text, #1c1c1c)',
            border: '1px solid var(--border, #e5e7eb)',
          }}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          required
        />
        <button
          className="self-end px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95"
          style={{
            backgroundColor: 'var(--accent, #3b82f6)',
            color: 'var(--surface, #fff)',
          }}
          type="submit"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
}
