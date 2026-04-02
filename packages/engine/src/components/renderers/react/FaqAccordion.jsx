import React, { useState } from "react";

export function FaqAccordion({ title, items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-accordion">
      {title && <h2 className="faq-accordion-title">{title}</h2>}
      <div className="faq-accordion-list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={
                "faq-accordion-item" + (isOpen ? " faq-accordion-item-open" : "")
              }
            >
              <button
                className="faq-accordion-question"
                onClick={() => handleToggle(index)}
                aria-expanded={isOpen}
              >
                <span className="faq-accordion-question-text">
                  {item.question}
                </span>
                <span className="faq-accordion-icon">
                  {isOpen ? "\u2212" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="faq-accordion-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
