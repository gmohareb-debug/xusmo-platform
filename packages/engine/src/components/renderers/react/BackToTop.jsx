import { useState, useEffect } from "react";

export function BackToTop({ label = "Back to top" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`back-to-top ${visible ? "back-to-top--visible" : ""}`}
      onClick={handleClick}
      aria-label={label}
    >
      &#x2191;
    </button>
  );
}
