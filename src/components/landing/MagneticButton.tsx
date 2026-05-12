import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Auto-magnetizes any element with [data-magnetic].
 * Smoothly translates the element toward the cursor when nearby.
 */
export function MagneticBinder() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const STRENGTH = 0.35;
    const RADIUS = 120;

    const handleEnter = (el: HTMLElement) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > RADIUS) {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
          window.removeEventListener("mousemove", move);
          return;
        }
        gsap.to(el, { x: dx * STRENGTH, y: dy * STRENGTH, duration: 0.4, ease: "power3.out" });
      };
      const leave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        window.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
      window.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-magnetic]");
      if (target && !target.dataset.magneticActive) {
        target.dataset.magneticActive = "1";
        target.style.display = target.style.display || "inline-block";
        target.style.willChange = "transform";
        handleEnter(target);
        target.addEventListener(
          "mouseleave",
          () => {
            delete target.dataset.magneticActive;
          },
          { once: true },
        );
      }
    };

    document.addEventListener("mouseover", onOver);
    cleanupRef.current = () => document.removeEventListener("mouseover", onOver);
    return cleanupRef.current;
  }, []);

  return null;
}
