import React, { useState, useRef } from "react";

export function FileUploadForm({
  title,
  accept = "",
  maxSizeMb = 10,
  submitLabel = "Upload",
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef(null);

  function validateFile(f) {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      setError(`File exceeds maximum size of ${maxSizeMb}MB.`);
      setFile(null);
      return;
    }
    if (accept) {
      const allowed = accept.split(",").map((ext) => ext.trim().toLowerCase());
      const fileName = f.name.toLowerCase();
      const matches = allowed.some((ext) => fileName.endsWith(ext));
      if (!matches) {
        setError(`File type not allowed. Accepted: ${accept}`);
        setFile(null);
        return;
      }
    }
    setError("");
    setFile(f);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (file) {
      setUploaded(true);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      {title && (
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
      )}
      {uploaded ? (
        <p className="text-sm font-medium text-green-600">
          File uploaded successfully!
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div
            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl cursor-pointer transition-all duration-200 ${
              dragging ? 'scale-[1.02]' : ''
            }`}
            style={{
              backgroundColor: 'var(--surface, #fff)',
              border: dragging
                ? '2px dashed var(--accent, #3b82f6)'
                : '2px dashed var(--border, #e5e7eb)',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept={accept}
              onChange={handleFileChange}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text, #1c1c1c)' }}>
              {file
                ? file.name
                : "Drag & drop a file here, or click to browse"}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted, #6b7280)' }}>
              {accept && <span>Accepted: {accept}</span>}
              {accept && " | "}
              Max size: {maxSizeMb}MB
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            className={`self-end px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              !file ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-md active:scale-95'
            }`}
            style={{
              backgroundColor: 'var(--accent, #3b82f6)',
              color: 'var(--surface, #fff)',
            }}
            type="submit"
            disabled={!file}
          >
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
