import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Scroll-driven cinematic intro. No walking figure — the camera dives
 * through a violet aperture / tunnel of concentric rings while type
 * shatters into place. User scrolls (wheel / touch / space / arrow) to
 * push progress 0 → 1; at 1 we hand off to the site with a whiteout.
 * Plays once per session.
 */
const KEY = "ja-intro-played-v2";

export function IntroSequence() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const progress = useMotionValue(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  // gate
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) {
      setPhase("done");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      sessionStorage.setItem(KEY, "1");
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setPhase("playing"), 1800);
    return () => clearTimeout(t);
  }, []);

  // input → progress
  useEffect(() => {
    if (phase !== "playing") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // start at 0
    progress.set(0);
    targetRef.current = 0;

    let finishing = false;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      animate(progress, 1, {
        duration: 0.55,
        ease: [0.7, 0, 0.3, 1],
        onComplete: () => {
          sessionStorage.setItem(KEY, "1");
          setPhase("done");
        },
      });
    };

    const bump = (delta: number) => {
      if (finishing) return;
      targetRef.current = Math.max(0, Math.min(1.0001, targetRef.current + delta));
      if (targetRef.current >= 1) finish();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      bump(e.deltaY * 0.0009);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchY;
      bump((touchY - y) * 0.0035);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Space", " "].includes(e.key)) bump(0.08);
      if (e.key === "Enter") finish();
      if (e.key === "Escape") finish();
    };
    const onClick = () => bump(0.14);

    // smooth ease-toward target
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const cur = progress.get();
      const next = cur + (targetRef.current - cur) * Math.min(1, dt * 6);
      progress.set(next);
      if (!finishing && next >= 0.985) finish();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      document.body.style.overflow = prevOverflow;
    };
  }, [phase, progress]);

  const skip = () => {
    sessionStorage.setItem(KEY, "1");
    setPhase("done");
  };

  // derived transforms
  const tunnelScale = useTransform(progress, [0, 1], [1, 22]);
  const tunnelRotate = useTransform(progress, [0, 1], [0, 120]);
  const apertureScale = useTransform(progress, [0, 0.85, 1], [1, 6, 40]);
  const apertureOpacity = useTransform(progress, [0, 0.8, 1], [1, 1, 0]);
  const vignetteOpacity = useTransform(progress, [0, 1], [0.9, 0]);
  const whiteout = useTransform(progress, [0.88, 1], [0, 1]);
  const gridOpacity = useTransform(progress, [0, 0.2, 0.9, 1], [0, 0.55, 0.3, 0]);
  const wordmarkY = useTransform(progress, [0, 1], [0, -60]);
  const wordmarkBlur = useTransform(progress, [0, 0.6, 1], ["0px", "0px", "24px"]);
  const wordmarkFilter = useTransform(wordmarkBlur, (b) => `blur(${b})`);
  const wordmarkOpacity = useTransform(progress, [0, 0.55, 1], [1, 1, 0]);
  const wordmarkLetter = useTransform(progress, [0, 1], [0, 40]);
  const wordmarkLetterSpacing = useTransform(wordmarkLetter, (v) => `${v}px`);
  const subOpacity = useTransform(progress, [0, 0.15, 0.55], [0, 1, 0]);
  const enterOpacity = useTransform(progress, [0, 0.02, 0.7, 0.85], [0, 1, 1, 0]);
  const chromaX = useTransform(progress, [0, 1], [0, 8]);
  const chromaShadow = useTransform(
    chromaX,
    (v) => `${-v}px 0 0 oklch(0.65 0.28 20 / 0.6), ${v}px 0 0 oklch(0.7 0.25 220 / 0.6)`,
  );
  const barHeight = useTransform(progress, [0, 0.8, 1], ["14vh", "6vh", "0vh"]);
  const meterWidth = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  const meterLabel = useTransform(progress, (v) =>
    `${Math.min(100, Math.round(v * 100)).toString().padStart(3, "0")}`,
  );
  const shardOpacity = useTransform(progress, [0, 0.3, 1], [0, 0.7, 0]);

  return (
    <AnimatePresence>
      {phase === "playing" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[95] overflow-hidden bg-black select-none"
          style={{ perspective: "1400px", cursor: "ns-resize" }}
        >
          {/* deep vignette */}
          <motion.div
            style={{ opacity: vignetteOpacity }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 50% 50%, oklch(0.24 0.11 312 / 0.55), transparent 65%), radial-gradient(circle at 50% 50%, transparent 40%, black 78%)",
              }}
            />
          </motion.div>

          {/* concentric aperture rings — the "portal" */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              style={{ scale: apertureScale, opacity: apertureOpacity }}
              className="relative h-[70vmin] w-[70vmin] will-change-transform"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border"
                  style={{
                    borderColor: `oklch(0.62 0.31 312 / ${0.08 + i * 0.06})`,
                    scale: 1 - i * 0.09,
                    borderWidth: i === 0 ? 2 : 1,
                    boxShadow:
                      i === 0
                        ? "0 0 80px 12px oklch(0.62 0.31 312 / 0.35), inset 0 0 60px oklch(0.62 0.31 312 / 0.25)"
                        : undefined,
                  }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 30 + i * 4, ease: "linear", repeat: Infinity }}
                />
              ))}
              {/* iris blades */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`b${i}`}
                  className="absolute left-1/2 top-1/2 h-[46%] w-px origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${(i * 360) / 12}deg)`,
                    background:
                      "linear-gradient(to top, oklch(0.62 0.31 312 / 0.7), transparent)",
                  }}
                />
              ))}
              {/* hot core */}
              <div
                className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{
                  boxShadow:
                    "0 0 120px 40px oklch(0.62 0.31 312 / 0.9), 0 0 240px 80px oklch(0.62 0.31 312 / 0.4)",
                }}
              />
            </motion.div>
          </div>

          {/* tunnel grid rushing forward */}
          <motion.div
            style={{
              opacity: gridOpacity,
              scale: tunnelScale,
              rotate: tunnelRotate,
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at center, transparent 0 44px, oklch(0.62 0.31 312 / 0.55) 44px 45px)",
                maskImage:
                  "radial-gradient(circle at center, black 20%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 20%, transparent 75%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0 12deg, oklch(0.62 0.31 312 / 0.25) 12deg 14deg, transparent 14deg 30deg, oklch(0.62 0.31 312 / 0.15) 30deg 31deg, transparent 31deg 60deg)",
                maskImage:
                  "radial-gradient(circle at center, transparent 12%, black 30%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, transparent 12%, black 30%, transparent 70%)",
              }}
            />
          </motion.div>

          {/* streaking light shards */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i * 360) / 18;
              return (
                <motion.div
                  key={`s${i}`}
                  className="absolute left-1/2 top-1/2 h-px w-[90vmax] origin-left"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    background:
                      "linear-gradient(to right, transparent 0%, transparent 35%, oklch(0.85 0.2 312 / 0.9) 60%, transparent 100%)",
                    opacity: shardOpacity,
                  }}
                  animate={{ x: ["0%", "20%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.03 }}
                />
              );
            })}
          </div>

          {/* wordmark */}
          <motion.div
            style={{
              y: wordmarkY,
              filter: wordmarkFilter,
              opacity: wordmarkOpacity,
            }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.span
                style={{
                  letterSpacing: wordmarkLetterSpacing,
                  textShadow: chromaShadow,
                }}
                className="font-display text-6xl font-black uppercase leading-none text-white md:text-[9rem]"
              >
                JIYUL·AHN
              </motion.span>
              <motion.span
                style={{ opacity: subOpacity }}
                className="font-mono text-[10px] uppercase tracking-[0.6em] text-accent"
              >
                ── entering the system ──
              </motion.span>
            </div>
          </motion.div>

          {/* HUD */}
          <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2 font-mono text-[10px] uppercase tracking-[0.35em] text-accent/80 md:inset-10">
            <div>◤ seq_00 · portal</div>
            <div className="text-right">
              <motion.span>{meterLabel}</motion.span>
              <span className="text-accent/40"> / 100</span>
            </div>
            <div className="self-end">jiyul.ahn</div>
            <div className="self-end text-right">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skip();
                }}
                className="pointer-events-auto border border-accent/30 px-2 py-1 hover:border-accent hover:bg-accent/10"
              >
                skip ▸
              </button>
            </div>
          </div>

          {/* scroll cue */}
          <motion.div
            style={{ opacity: enterOpacity }}
            className="pointer-events-none absolute bottom-[14vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/80">
              scroll to enter
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 w-px bg-gradient-to-b from-accent to-transparent"
            />
          </motion.div>

          {/* progress meter */}
          <div className="pointer-events-none absolute bottom-[6vh] left-1/2 h-px w-[42vw] max-w-md -translate-x-1/2 overflow-hidden bg-white/10">
            <motion.div
              style={{ width: meterWidth }}
              className="h-full bg-accent shadow-[0_0_12px_var(--color-accent)]"
            />
          </div>

          {/* letterbox */}
          <motion.div
            style={{ height: barHeight }}
            className="pointer-events-none absolute inset-x-0 top-0 bg-black"
          />
          <motion.div
            style={{ height: barHeight }}
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-black"
          />

          {/* grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")",
            }}
          />

          {/* whiteout on entry */}
          <motion.div
            style={{ opacity: whiteout }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
