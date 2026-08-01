import { useEffect, useRef, useState } from "react";

/**
 * Site-wide custom cursor.
 * Desktop only · auto-disabled on touch devices.
 * Default state: small terminal block.
 * On hover over interactive elements: expanded ring.
 */
export function MagneticCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    // Hide native cursor only on desktop
    document.documentElement.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest("a, button, [role='button'], [data-magnetic], input, textarea, select, label"));
    };
    const onLeave = () => {
      target.current.x = -100;
      target.current.y = -100;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.22;
      pos.current.y += (target.current.y - pos.current.y) * 0.22;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
      style={{
        width: hovering ? 44 : 10,
        height: hovering ? 44 : 10,
        background: hovering ? "transparent" : "var(--color-accent)",
        border: hovering ? "1.5px solid var(--color-accent)" : "none",
        borderRadius: hovering ? 999 : 1,
        mixBlendMode: "difference",
        transition:
          "width .22s cubic-bezier(.16,1,.3,1), height .22s cubic-bezier(.16,1,.3,1), border-radius .2s ease, background .2s ease",
        boxShadow: hovering ? "0 0 24px var(--color-accent)" : "none",
      }}
    />
  );
}
