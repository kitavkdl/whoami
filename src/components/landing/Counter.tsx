import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVal(to);
      return;
    }

    const obj = { v: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        if (played.current) return;
        played.current = true;
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => setVal(Math.floor(obj.v)),
          onComplete: () => setVal(to),
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [to]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span>{String(val).padStart(2, "0")}</span>
      <span className="text-accent">{suffix}</span>
    </span>
  );
}
