import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

type Part = {
  label: string;
  sub: string;
  // exploded position (start)
  x: string;
  y: string;
  rot: number;
  // assembled grid position (end)
  col: number;
  row: number;
};

const PARTS: Part[] = [
  { label: "TypeScript", sub: "core",     x: "-60vw", y: "-40vh", rot: -20, col: 0, row: 0 },
  { label: "Next.js",    sub: "frame",    x: " 55vw", y: "-45vh", rot:  18, col: 1, row: 0 },
  { label: "React",      sub: "ui",       x: "-30vw", y: " 50vh", rot:  35, col: 2, row: 0 },
  { label: "Supabase",   sub: "data",     x: " 50vw", y: " 40vh", rot: -25, col: 0, row: 1 },
  { label: "PostgreSQL", sub: "db",       x: "-55vw", y: "  5vh", rot:  10, col: 1, row: 1 },
  { label: "Node",       sub: "runtime",  x: " 60vw", y: " -5vh", rot: -12, col: 2, row: 1 },
  { label: "PHP",        sub: "legacy",   x: "-15vw", y: "-55vh", rot:  22, col: 0, row: 2 },
  { label: "Tailwind",   sub: "style",    x: " 18vw", y: " 55vh", rot: -18, col: 1, row: 2 },
  { label: "Odoo",       sub: "ops",      x: "-45vw", y: " 30vh", rot:  28, col: 2, row: 2 },
];

function PartCard({
  part,
  progress,
  index,
}: {
  part: Part;
  progress: MotionValue<number>;
  index: number;
}) {
  const start = 0.05 + (index % 9) * 0.02;
  const end = 0.55;
  const x = useTransform(progress, [start, end], [part.x, "0vw"]);
  const y = useTransform(progress, [start, end], [part.y, "0vh"]);
  const rotate = useTransform(progress, [start, end], [part.rot, 0]);
  const scale = useTransform(progress, [start, end], [0.6, 1]);
  const opacity = useTransform(progress, [0, start, end, 0.95, 1], [0, 1, 1, 1, 0.85]);

  // assembled grid offset (3x3 grid centered)
  const cell = 150;
  const gridX = (part.col - 1) * cell;
  const gridY = (part.row - 1) * cell;

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity }}
      className="absolute left-1/2 top-1/2"
    >
      <motion.div
        style={{ x: gridX, y: gridY }}
        className="relative -translate-x-1/2 -translate-y-1/2"
      >
        <div className="group relative h-[130px] w-[130px] overflow-hidden border border-accent/40 bg-surface/80 p-3 backdrop-blur shadow-[0_0_30px_-10px_oklch(0.62_0.31_312_/_0.6)]">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between text-[9px] uppercase tracking-[0.25em] text-accent">
              <span>0{index + 1}</span>
              <span>◇</span>
            </div>
            <div>
              <div className="font-display text-base font-bold leading-tight">{part.label}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                / {part.sub}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExplodedSkills() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.5, 0.7], [0, 1, 1, 0]);
  const finalOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const coreScale = useTransform(scrollYProgress, [0.4, 0.7], [0.5, 1]);
  const coreOpacity = useTransform(scrollYProgress, [0.4, 0.6, 0.95], [0, 1, 1]);

  return (
    <section ref={ref} id="skills" className="relative h-[400vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* grid floor */}
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(oklch(1_0_0_/_0.05)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.05)_1px,transparent_1px)] [background-size:60px_60px]" />

        {/* glow core */}
        <motion.div
          style={{ scale: coreScale, opacity: coreOpacity }}
          className="absolute h-[500px] w-[500px] rounded-full bg-accent/30 blur-[120px]"
        />

        {/* heading */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute left-1/2 top-16 -translate-x-1/2 text-center md:top-24"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            ⟢ 03 — Stack assembly
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tighter md:text-5xl">
            Scroll to <span className="text-outline-accent">assemble</span>
          </h2>
        </motion.div>

        {/* parts */}
        {PARTS.map((p, i) => (
          <PartCard key={p.label} part={p} index={i} progress={scrollYProgress} />
        ))}

        {/* assembled label */}
        <motion.div
          style={{ opacity: finalOpacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center md:bottom-24"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            ✓ system online
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold tracking-tighter md:text-4xl">
            One product. Nine systems.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
