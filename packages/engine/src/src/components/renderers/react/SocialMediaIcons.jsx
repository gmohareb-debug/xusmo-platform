import React from "react";

const platformSymbols = {
  twitter: "\u{1D54F}",
  facebook: "f",
  instagram: "\u{1D540}",
  linkedin: "in",
  youtube: "\u25B6",
};

export function SocialMediaIcons({ links = [] }) {
  return (
    <div className="social-media-icons">
      {links.map((link, index) => {
        const symbol =
          platformSymbols[link.platform] || link.platform || "?";
        return (
          <a
            key={index}
            href={link.href || "#"}
            className={`social-media-link social-media-${link.platform || "unknown"}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
          >
            <span className="social-media-symbol">{symbol}</span>
          </a>
        );
      })}
    </div>
  );
}
