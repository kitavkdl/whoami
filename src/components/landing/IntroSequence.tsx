import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Cinematic intro: a lone silhouette walks toward the camera down a
 * receding perspective corridor, then the camera zooms through them and
 * the site is revealed. Inspired by the Razorpay Sprint 26 opener.
 *
 * Plays once per session (sessionStorage flag). Sits above the Preloader
 * and hands off to the site with a fast whiteout/blur.
 */
const KEY = "ja-intro-played-v1";

export function IntroSequence() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");

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
    // Preloader is ~2s; start just before it exits so the handoff is seamless.
    const t = setTimeout(() => setPhase("playing"), 1800);
    return () => clearTimeout(t);
  }, []);

  // total duration ~5.4s
  useEffect(() => {
    if (phase !== "playing") return;
    // lock scroll during the intro
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      sessionStorage.setItem(KEY, "1");
      setPhase("done");
    }, 5400);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const skip = () => {
    sessionStorage.setItem(KEY, "1");
    setPhase("done");
  };

  return (
    <AnimatePresence>
      {phase === "playing" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(24px)", scale: 1.08 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[95] overflow-hidden bg-black"
          style={{ perspective: "1200px" }}
          onClick={skip}
        >
          {/* radial vignette / horizon glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 45% at 50% 55%, oklch(0.22 0.08 312 / 0.55), transparent 70%), radial-gradient(ellipse 90% 60% at 50% 100%, oklch(0.62 0.31 312 / 0.15), transparent 65%)",
            }}
          />

          {/* perspective floor grid pulled toward camera */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 0.8 }}
            className="absolute left-1/2 top-[62%] h-[220vh] w-[260vw] -translate-x-1/2 origin-top will-change-transform"
            style={{
              transform: "translateX(-50%) rotateX(72deg)",
              backgroundImage:
                "linear-gradient(to right, oklch(0.62 0.31 312 / 0.55) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.62 0.31 312 / 0.55) 1px, transparent 1px)",
              backgroundSize: "6vw 6vw",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
            }}
          >
            <motion.div
              animate={{ backgroundPositionY: ["0px", "600px"] }}
              transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, oklch(0.62 0.31 312 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.62 0.31 312 / 0.9) 1px, transparent 1px)",
                backgroundSize: "6vw 6vw",
              }}
            />
          </motion.div>

          {/* horizon rule + sun disk */}
          <div className="absolute left-0 right-0 top-[62%] h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
          <motion.div
            initial={{ opacity: 0.2, scale: 0.6 }}
            animate={{ opacity: [0.2, 0.5, 0.15], scale: [0.6, 1.4, 0.9] }}
            transition={{ duration: 5.4, ease: "easeInOut" }}
            className="absolute left-1/2 top-[54%] h-40 w-40 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl"
          />

          {/* walking silhouette — scales from tiny to huge, subtle bob & sway */}
          <motion.div
            initial={{ scale: 0.05, y: 0, opacity: 0 }}
            animate={{
              scale: [0.05, 0.18, 0.55, 1.6, 5.5],
              y: [0, -2, -4, -6, -10],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 5.2,
              times: [0, 0.2, 0.55, 0.85, 1],
              ease: [0.5, 0, 0.75, 0],
            }}
            className="absolute left-1/2 top-[62%] -translate-x-1/2 will-change-transform"
          >
            <motion.div
              animate={{ x: [-2, 2, -2], rotate: [-0.6, 0.6, -0.6] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="120"
                height="220"
                viewBox="0 0 120 220"
                fill="black"
                style={{
                  filter:
                    "drop-shadow(0 0 22px oklch(0.62 0.31 312 / 0.9)) drop-shadow(0 20px 30px rgba(0,0,0,0.9))",
                }}
              >
                {/* head */}
                <circle cx="60" cy="30" r="18" />
                {/* torso */}
                <path d="M42 50 Q60 46 78 50 L82 130 Q60 138 38 130 Z" />
                {/* arms swinging */}
                <path d="M40 60 Q28 100 34 140 L44 138 Q40 100 50 66 Z" />
                <path d="M80 60 Q92 100 86 140 L76 138 Q80 100 70 66 Z" />
                {/* legs */}
                <path d="M46 128 Q42 170 46 210 L58 210 Q60 172 58 128 Z" />
                <path d="M74 128 Q78 170 74 210 L62 210 Q60 172 62 128 Z" />
              </svg>
            </motion.div>
          </motion.div>

          {/* layered kinetic captions */}
          <Caption at={0} out={0.9} text="2026." align="center" small />
          <Caption at={1.0} out={2.1} text="JIYUL AHN" align="center" />
          <Caption at={2.2} out={3.5} text="// systems, shipped." align="center" small />
          <Caption at={3.6} out={4.9} text="ENTER →" align="center" />

          {/* corner HUD */}
          <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2 font-mono text-[10px] uppercase tracking-[0.35em] text-accent/70 md:inset-10">
            <div>◤ rec 00:00</div>
            <div className="text-right">seq_01 / walk_in</div>
            <div className="self-end">jiyul.ahn</div>
            <div className="self-end text-right">skip ▸ click</div>
          </div>

          {/* letterbox bars */}
          <motion.div
            initial={{ height: "18vh" }}
            animate={{ height: ["18vh", "10vh", "0vh"] }}
            transition={{ duration: 5.2, times: [0, 0.6, 1], ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-0 bg-black"
          />
          <motion.div
            initial={{ height: "18vh" }}
            animate={{ height: ["18vh", "10vh", "0vh"] }}
            transition={{ duration: 5.2, times: [0, 0.6, 1], ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 bg-black"
          />

          {/* grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")",
            }}
          />

          {/* final flash whiteout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 5.4, times: [0, 0.94, 1], ease: "easeIn" }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Caption({
  at,
  out,
  text,
  align = "center",
  small = false,
}: {
  at: number;
  out: number;
  text: string;
  align?: "center" | "left";
  small?: boolean;
}) {
  const duration = 5.4;
  const inT = at / duration;
  const holdT = Math.min(1, (at + 0.25) / duration);
  const outStart = Math.max(holdT, (out - 0.3) / duration);
  const outEnd = Math.min(1, out / duration);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(16px)" }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [20, 0, 0, -10],
        filter: ["blur(16px)", "blur(0px)", "blur(0px)", "blur(12px)"],
      }}
      transition={{
        duration,
        times: [inT, holdT, outStart, outEnd],
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`pointer-events-none absolute inset-x-0 top-[18%] flex ${
        align === "center" ? "justify-center" : "justify-start pl-10"
      }`}
    >
      <span
        className={
          small
            ? "font-mono text-xs uppercase tracking-[0.5em] text-accent"
            : "font-display text-5xl font-extrabold uppercase tracking-tighter text-foreground md:text-7xl"
        }
      >
        {text}
      </span>
    </motion.div>
  );
}
