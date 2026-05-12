import { useEffect, useRef, useState } from "react";

export function MagneticCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest("a, button, [data-magnetic]"));
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
      style={{
        width: hovering ? 56 : 0,
        height: hovering ? 56 : 0,
        background: "transparent",
        border: hovering ? "1.5px solid var(--color-accent)" : "none",
        borderRadius: 999,
        mixBlendMode: "difference",
        opacity: hovering ? 1 : 0,
        transition: "width .25s ease, height .25s ease, opacity .2s ease",
        boxShadow: hovering ? "0 0 30px var(--color-accent)" : "none",
      }}
    />
  );
}
