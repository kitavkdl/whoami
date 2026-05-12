import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Scroll-pinned zoom-in transition — gives the feeling of being pulled
 * into a screen / portal between Hero and About.
 */
export function ZoomPortal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 8, 24]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const innerOpacity = useTransform(scrollYProgress, [0.3, 0.55, 0.8], [0, 1, 0]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.5, 0.9], [0.2, 1, 0]);
  const text1Opacity = useTransform(scrollYProgress, [0.0, 0.2, 0.45], [0, 1, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0.45, 0.6, 0.85], [0, 1, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-background">
        {/* expanding rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            style={{
              scale: useTransform(scrollYProgress, [0, 1], [0.2 + i * 0.15, 6 + i * 2]),
              opacity: ringOpacity,
              rotate,
            }}
            className="absolute h-[40vmin] w-[40vmin] rounded-full border border-accent/40"
          />
        ))}

        {/* portal core */}
        <motion.div
          style={{ scale, rotate }}
          className="relative h-[40vmin] w-[40vmin] rounded-full bg-gradient-to-br from-accent via-accent/40 to-background shadow-[0_0_120px_60px_oklch(0.62_0.31_312_/_0.45)]"
        >
          <motion.div
            style={{ opacity: innerOpacity }}
            className="absolute inset-[10%] rounded-full bg-background"
          />
        </motion.div>

        {/* layered text */}
        <motion.p
          style={{ opacity: text1Opacity }}
          className="absolute z-10 font-display text-5xl font-extrabold uppercase tracking-tighter md:text-8xl"
        >
          Enter the system
        </motion.p>
        <motion.p
          style={{ opacity: text2Opacity }}
          className="absolute z-10 font-mono text-xs uppercase tracking-[0.5em] text-accent md:text-sm"
        >
          // initializing identity.exe
        </motion.p>

        {/* HUD corners */}
        <div className="pointer-events-none absolute inset-6 z-10 grid grid-cols-2 grid-rows-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:inset-10">
          <div>◤ sector_01</div>
          <div className="text-right">depth ▸ ∞</div>
          <div className="self-end">▽ scroll to descend</div>
          <div className="self-end text-right">jiyul.ahn</div>
        </div>
      </div>
    </section>
  );
}
