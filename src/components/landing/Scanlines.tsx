import { useEffect, useState } from "react";

/**
 * CRT-style scanlines overlay.
 * Fixed, pointer-events: none, extremely subtle.
 * Lower opacity on mobile to save battery and avoid visual noise on small screens.
 */
export function Scanlines() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[56]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "overlay",
        opacity: mobile ? 0.25 : 0.5,
      }}
    />
  );
}
