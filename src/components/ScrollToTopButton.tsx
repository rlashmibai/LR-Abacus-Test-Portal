"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

/** Floating "back to top" button, mounted once near the root so it shows
 * up consistently across every page. Stays hidden until the visitor has
 * scrolled down a bit, then smooth-scrolls back to the top on click. */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-[10%] right-[10%] z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-lg transition hover:bg-brand-dark print:hidden"
    >
      <ChevronUp size={26} strokeWidth={2.75} />
    </button>
  );
}
