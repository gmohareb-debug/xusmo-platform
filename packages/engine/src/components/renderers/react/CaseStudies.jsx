import React from "react";
import { onImgError } from './imgFallback'

export function CaseStudies({ title, studies = [] }) {
  return (
    <section className="case-studies">
      {title && <h2 className="case-studies-title">{title}</h2>}
      <div className="case-studies-grid">
        {studies.map((study, index) => (
          <a
            key={index}
            href={study.href || "#"}
            className="case-study-card"
          >
            {study.image && (
              <div className="case-study-image-wrapper">
                <img
                  src={study.image}
                  alt={study.title || ""}
                  className="case-study-image"
                  onError={e => onImgError(e, 600, 400)}
                />
              </div>
            )}
            <div className="case-study-content">
              {study.client && (
                <span className="case-study-client">{study.client}</span>
              )}
              {study.title && (
                <h3 className="case-study-card-title">{study.title}</h3>
              )}
              {study.description && (
                <p className="case-study-description">{study.description}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
