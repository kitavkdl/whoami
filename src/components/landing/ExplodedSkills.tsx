import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Part = {
  label: string;
  sub: string;
  x: string;
  y: string;
  rot: number;
  col: number;
  row: number;
};

const PARTS: Part[] = [
  { label: "TypeScript", sub: "core",    x: "-60vw", y: "-40vh", rot: -20, col: 0, row: 0 },
  { label: "Next.js",    sub: "frame",   x: "55vw",  y: "-45vh", rot:  18, col: 1, row: 0 },
  { label: "React",      sub: "ui",      x: "-30vw", y: "50vh",  rot:  35, col: 2, row: 0 },
  { label: "Supabase",   sub: "data",    x: "50vw",  y: "40vh",  rot: -25, col: 0, row: 1 },
  { label: "PostgreSQL", sub: "db",      x: "-55vw", y: "5vh",   rot:  10, col: 1, row: 1 },
  { label: "Node",       sub: "runtime", x: "60vw",  y: "-5vh",  rot: -12, col: 2, row: 1 },
  { label: "PHP",        sub: "legacy",  x: "-15vw", y: "-55vh", rot:  22, col: 0, row: 2 },
  { label: "Tailwind",   sub: "style",   x: "18vw",  y: "55vh",  rot: -18, col: 1, row: 2 },
  { label: "Odoo",       sub: "ops",     x: "-45vw", y: "30vh",  rot:  28, col: 2, row: 2 },
];

const CELL = 150;
const VB = 1000;
const CENTER = VB / 2;

export function ExplodedSkills() {
  const ref = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const ctx = gsap.context(() => {
      const parts = gsap.utils.toArray<HTMLElement>("[data-part]", sticky);
      const lines = gsap.utils.toArray<SVGPathElement>("[data-line]", sticky);
      const title = sticky.querySelector("[data-title]");
      const finalLabel = sticky.querySelector("[data-final]");
      const core = sticky.querySelector("[data-core]");

      // Prep stroke dash for circuit lines
      lines.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
        defaults: { ease: "none" },
      });

      // Title fades in then out
      tl.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0)
        .to(title, { opacity: 0, duration: 0.1 }, 0.55);

      // Parts assemble
      parts.forEach((el) => {
        const fx = el.dataset.x!;
        const fy = el.dataset.y!;
        const fr = Number(el.dataset.rot);
        tl.fromTo(
          el,
          { x: fx, y: fy, rotate: fr, scale: 0.6, opacity: 0 },
          { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.55 },
          0.05,
        );
      });

      // Circuit lines draw
      tl.to(lines, { strokeDashoffset: 0, duration: 0.4, stagger: 0.02 }, 0.45);

      // Core glow
      tl.fromTo(core, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, 0.5);

      // Final label
      tl.fromTo(
        finalLabel,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.15 },
        0.7,
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Build SVG line coords (center -> grid cell center)
  const lineCoords = PARTS.map((p) => ({
    x1: CENTER,
    y1: CENTER,
    x2: CENTER + (p.col - 1) * CELL,
    y2: CENTER + (p.row - 1) * CELL,
  }));

  return (
    <section ref={ref} id="skills" className="relative h-[400vh] bg-background">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
      >
        {/* grid floor */}
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(oklch(1_0_0_/_0.05)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.05)_1px,transparent_1px)] [background-size:60px_60px]" />

        {/* glow core */}
        <div
          data-core
          className="absolute h-[500px] w-[500px] rounded-full bg-accent/30 blur-[120px] opacity-0"
        />

        {/* heading */}
        <div
          data-title
          className="absolute left-1/2 top-16 -translate-x-1/2 text-center md:top-24 opacity-0"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            ⟢ 03 — Stack assembly
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tighter md:text-5xl">
            Scroll to <span className="text-outline-accent">assemble</span>
          </h2>
        </div>

        {/* circuit lines svg */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          viewBox={`0 0 ${VB} ${VB}`}
          fill="none"
          aria-hidden
        >
          {lineCoords.map((c, i) => {
            // L-shaped path for "circuit" feel
            const midX = c.x2;
            const midY = c.y1;
            const d = `M ${c.x1} ${c.y1} L ${midX} ${midY} L ${c.x2} ${c.y2}`;
            return (
              <path
                key={i}
                data-line
                d={d}
                stroke="var(--color-accent)"
                strokeWidth="1.2"
                strokeOpacity="0.7"
              />
            );
          })}
        </svg>

        {/* parts */}
        {PARTS.map((p, i) => {
          const gridX = (p.col - 1) * CELL;
          const gridY = (p.row - 1) * CELL;
          return (
            <div
              key={p.label}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(${gridX}px, ${gridY}px)` }}
            >
              <div
                data-part
                data-x={p.x}
                data-y={p.y}
                data-rot={p.rot}
                className="-translate-x-1/2 -translate-y-1/2 will-change-transform"
              >
                <div className="group relative h-[110px] w-[110px] overflow-hidden border border-accent/40 bg-surface/80 p-3 backdrop-blur shadow-[0_0_30px_-10px_oklch(0.62_0.31_312_/_0.6)] md:h-[130px] md:w-[130px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between text-[9px] uppercase tracking-[0.25em] text-accent">
                      <span>0{i + 1}</span>
                      <span>◇</span>
                    </div>
                    <div>
                      <div className="font-display text-base font-bold leading-tight">
                        {p.label}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        / {p.sub}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* assembled label */}
        <div
          data-final
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center opacity-0 md:bottom-24"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            ✓ system online
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold tracking-tighter md:text-4xl">
            One product. Nine systems.
          </div>
        </div>
      </div>
    </section>
  );
}
