import { useEffect } from "react";

/**
 * Marks [data-reveal] elements as shown the first time they cross into view,
 * then stops watching them. One observer for the whole document rather than
 * one per element, and it unhooks itself once everything has fired.
 *
 * Two things this has to survive, because the cost of getting them wrong is a
 * blank page rather than a missing animation:
 *
 *  - A hidden tab. IntersectionObserver reports nothing while the document is
 *    hidden, so setup waits for the first moment anyone could actually see it.
 *  - An observer that never reports at all. A working one always delivers an
 *    initial callback, so if none arrives the failsafe reveals everything.
 *
 * The CSS that hides them is scoped to html.js, so with scripting off the page
 * simply renders as a static document.
 */
export function useReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const showAll = () => targets.forEach((el) => (el.dataset.shown = "1"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    let observer: IntersectionObserver | null = null;
    let failsafe: ReturnType<typeof setTimeout> | undefined;
    let heard = false;
    let disposed = false;

    const start = () => {
      if (disposed) return;

      let remaining = targets.filter((el) => el.dataset.shown !== "1").length;
      if (remaining === 0) return;

      observer = new IntersectionObserver(
        (records) => {
          if (!heard) {
            heard = true;
            clearTimeout(failsafe);
          }

          for (const record of records) {
            if (!record.isIntersecting) continue;
            const el = record.target as HTMLElement;
            el.dataset.shown = "1";
            observer?.unobserve(el);
            remaining -= 1;
          }

          if (remaining <= 0) observer?.disconnect();
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
      );

      targets.forEach((el) => observer!.observe(el));
      failsafe = setTimeout(() => {
        if (!heard) showAll();
      }, 2500);
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onVisibility);
      start();
    };

    if (document.visibilityState === "visible") start();
    else document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      clearTimeout(failsafe);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
