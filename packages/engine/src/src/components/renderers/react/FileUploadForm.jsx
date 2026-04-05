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
    <div className="file-upload-form">
      {title && <h2 className="file-upload-form-title">{title}</h2>}
      {uploaded ? (
        <p className="file-upload-form-success">File uploaded successfully!</p>
      ) : (
        <form className="file-upload-form-body" onSubmit={handleSubmit}>
          <div
            className={
              "file-upload-form-dropzone" +
              (dragging ? " file-upload-form-dropzone-active" : "")
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            <input
              ref={inputRef}
              className="file-upload-form-input"
              type="file"
              accept={accept}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <p className="file-upload-form-dropzone-text">
              {file
                ? file.name
                : "Drag & drop a file here, or click to browse"}
            </p>
            <p className="file-upload-form-dropzone-hint">
              {accept && <span>Accepted: {accept}</span>}
              {accept && " | "}
              Max size: {maxSizeMb}MB
            </p>
          </div>
          {error && <p className="file-upload-form-error">{error}</p>}
          <button
            className="file-upload-form-submit"
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
