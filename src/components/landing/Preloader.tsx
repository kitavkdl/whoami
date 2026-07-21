import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlitchText } from "./GlitchText";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const lite =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // lock scroll while loading
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(20px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          {/* huge rotating display ring */}
          {!lite && (
            <>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute h-[80vmin] w-[80vmin] rounded-full border border-accent/15 will-change-transform"
              />
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute h-[60vmin] w-[60vmin] rounded-full border border-accent/25 will-change-transform"
              />
            </>
          )}

          {/* central seed — same shape that morphs into hero core */}
          <motion.div
            layoutId="hero-seed"
            className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-accent via-accent/40 to-background shadow-[0_0_120px_40px_oklch(0.62_0.31_312_/_0.45)]"
          />

          {/* JA logo */}
          <div className="relative z-10 flex flex-col items-center gap-10">
            <span className="font-display text-6xl font-extrabold tracking-tighter md:text-8xl">
              JA<span className="text-accent">.</span>
            </span>

            {/* counter */}
            <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              <GlitchText
                text={progress.toString().padStart(3, "0")}
                mode="interval"
                intervalMs={1200}
                density={0.35}
                className="text-accent"
              />
              <GlitchText
                text="/ 100 — initializing"
                mode="typewriter"
                duration={900}
              />
            </div>

            {/* progress bar */}
            <div className="h-px w-72 overflow-hidden bg-border">
              <motion.div
                style={{ width: `${progress}%` }}
                className="h-full bg-accent shadow-[0_0_12px_var(--color-accent)]"
              />
            </div>
          </div>

          {/* corner HUD */}
          <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:inset-10">
            <div>◤ booting</div>
            <div className="text-right">v.2026.05</div>
            <div className="self-end">jiyul.ahn</div>
            <div className="self-end text-right">// please wait</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
