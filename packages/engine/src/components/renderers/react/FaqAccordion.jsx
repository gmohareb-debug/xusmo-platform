import React, { useState } from "react";

export function FaqAccordion({ title, items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-accordion max-w-3xl mx-auto">
      {title && (
        <h2 className="faq-accordion-title text-3xl md:text-4xl font-bold tracking-tight text-center mb-12"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>
      )}
      <div className="faq-accordion-list flex flex-col gap-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`faq-accordion-item rounded-xl border transition-all duration-200 ${isOpen ? 'faq-accordion-item-open border-[var(--accent,#1f4dff)]/20 bg-[var(--accent,#1f4dff)]/[0.02] shadow-sm' : 'border-[var(--border,#e5e7eb)] bg-[var(--surface,#fff)]'}`}
            >
              <button
                className="faq-accordion-question w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-transparent border-none cursor-pointer text-[var(--text,#1c1c1c)]"
                onClick={() => handleToggle(index)}
                aria-expanded={isOpen}
              >
                <span className="faq-accordion-question-text text-base font-semibold leading-snug">
                  {item.question}
                </span>
                <span className={`faq-accordion-icon flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 transition-all duration-300 ${isOpen ? 'bg-[var(--accent,#1f4dff)] text-white rotate-45' : 'bg-gray-100 text-gray-500'}`}>
                  +
                </span>
              </button>
              {isOpen && (
                <div className="faq-accordion-answer px-6 pb-6">
                  <p className="text-base text-[var(--muted,#6b7280)] leading-relaxed m-0">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
