import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!<>_\\/[]{}=+*^?#%$&▓▒░█";

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

type Props = {
  text: string;
  mode?: "oneshot" | "interval" | "typewriter";
  /** oneshot/typewriter total duration in ms */
  duration?: number;
  /** interval mode: avg ms between glitch bursts */
  intervalMs?: number;
  /** chance any char gets glitched during an interval burst (0..1) */
  density?: number;
  className?: string;
  as?: "span" | "div" | "p";
};

/**
 * Reusable glitch text effect.
 * - oneshot: triggers once when scrolled into view, then settles.
 * - interval: continuous, occasional short glitch bursts.
 * - typewriter: characters appear one-by-one with brief glitch before settling.
 *
 * Honors prefers-reduced-motion (renders plain text).
 */
export function GlitchText({
  text,
  mode = "oneshot",
  duration = 280,
  intervalMs = 1600,
  density = 0.15,
  className,
  as: Tag = "span",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(
    mode === "typewriter" ? "" : text,
  );
  const playedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(text);
      return;
    }

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const runOneshot = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= duration) {
          setDisplay(text);
          return;
        }
        const progress = elapsed / duration;
        const out = text
          .split("")
          .map((c, i) => {
            if (c === " ") return c;
            if (i / Math.max(text.length, 1) < progress) return c;
            return randomChar();
          })
          .join("");
        setDisplay(out);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const runTypewriter = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const shown = Math.floor(t * text.length);
        const out = text
          .split("")
          .map((c, i) => {
            if (i < shown) return c;
            if (i === shown && c !== " ") return randomChar();
            return "";
          })
          .join("");
        setDisplay(out);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setDisplay(text);
      };
      raf = requestAnimationFrame(tick);
    };

    const scheduleInterval = () => {
      const wait = intervalMs + Math.random() * intervalMs;
      timer = setTimeout(() => {
        const start = performance.now();
        const burstMs = 180;
        const tick = (now: number) => {
          const t = now - start;
          if (t >= burstMs) {
            setDisplay(text);
            scheduleInterval();
            return;
          }
          const out = text
            .split("")
            .map((c) => {
              if (c === " ") return c;
              if (Math.random() < density) return randomChar();
              return c;
            })
            .join("");
          setDisplay(out);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, wait);
    };

    if (mode === "interval") {
      scheduleInterval();
    } else if (mode === "typewriter") {
      runTypewriter();
    } else {
      // oneshot · start when scrolled into view, only once
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !playedRef.current) {
              playedRef.current = true;
              runOneshot();
              io.disconnect();
            }
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [mode, duration, intervalMs, density, text]);

  const Comp = Tag as "span";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      aria-label={text}
    >
      {display || "\u00A0"}
    </Comp>
  );
}
