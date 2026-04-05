import React, { useState, useRef, useEffect } from "react";

function AccordionItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-[var(--border,#e5e7eb)]">
      <button
        className="w-full flex items-center justify-between gap-4 py-6 text-left bg-transparent border-none cursor-pointer text-[var(--text,#1c1c1c)] group"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-medium leading-snug group-hover:opacity-70 transition-opacity duration-200">
          {item.question}
        </span>
        <span className="shrink-0 w-6 h-6 flex items-center justify-center">
          <svg
            className={`w-4 h-4 text-[var(--muted,#6b7280)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="pb-6">
          <p className="text-base text-[var(--muted,#6b7280)] leading-relaxed m-0 pr-10">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ title, items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-3xl mx-auto">
      {title && (
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text,#1c1c1c)]"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
        </div>
      )}
      <div className="divide-y-0">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}
