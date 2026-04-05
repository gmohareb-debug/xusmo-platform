import React from "react";

export function CopyrightNotice({ text, year }) {
  return (
    <p className="copyright-notice">
      &copy; {year || new Date().getFullYear()} {text}
    </p>
  );
}
