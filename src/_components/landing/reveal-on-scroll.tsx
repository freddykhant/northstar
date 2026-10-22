"use client";

import { useEffect } from "react";

/**
 * Adds `.is-revealed` to every `.reveal` as it enters view, once.
 *
 * The CSS in globals.css makes `.reveal` unconditionally visible under
 * prefers-reduced-motion, and the hiding half of the rule only applies under
 * `@media (scripting: enabled)`, so this component is a progressive
 * enhancement — if it never runs, no content is hidden.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((n) => n.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return null;
}
