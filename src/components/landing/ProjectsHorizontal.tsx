import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const PROJECTS = [
  {
    n: "P/01",
    title: "B2B Export Infra",
    tag: "Founder · 2025",
    desc: "Hybrid SQL + NoSQL pipeline connecting Korean sellers with overseas buyers — automating customs, logistics, and settlement.",
    color: "from-purple-500/30 to-fuchsia-500/10",
  },
  {
    n: "P/02",
    title: "Odoo Operations",
    tag: "PM · DX Tech",
    desc: "Multi-project orchestration: scoping, resourcing, and KPI instrumentation for Odoo-based enterprise rollouts.",
    color: "from-violet-500/30 to-indigo-500/10",
  },
  {
    n: "P/03",
    title: "BADA Admissions",
    tag: "Developer · 2023–24",
    desc: "Digitized an offline student pipeline into a cross-platform site — PHP / JS, server config, and full deployment on Cafe24.",
    color: "from-pink-500/30 to-rose-500/10",
  },
  {
    n: "P/04",
    title: "Internal Tools",
    tag: "Always shipping",
    desc: "A trail of small, sharp tools — admin dashboards, dataset cleaners, automation hooks. Boring on purpose, fast by design.",
    color: "from-cyan-500/20 to-sky-500/10",
  },
];

export function ProjectsHorizontal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // total horizontal travel
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-78%"]);
  // background drifts slower (parallax)
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  // huge headline drifts opposite
  const titleX = useTransform(scrollYProgress, [0, 1], ["0%", "-120%"]);

  return (
    <section ref={ref} id="projects" className="relative h-[500vh] bg-background">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* slow background pattern */}
        <motion.div
          style={{ x: bgX }}
          className="pointer-events-none absolute inset-y-0 left-0 w-[300%] opacity-40 [background-image:radial-gradient(oklch(0.62_0.31_312_/_0.25)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        {/* huge background headline (parallax) */}
        <motion.h2
          style={{ x: titleX }}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[28vw] font-extrabold uppercase leading-none tracking-tighter text-outline opacity-30"
        >
          Selected · Works · Selected · Works ·
        </motion.h2>

        {/* section meta */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-8 md:px-12">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            ⟢ 05 — Selected projects
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            ◀ scroll ▶
          </p>
        </div>

        {/* horizontal track */}
        <div className="relative flex flex-1 items-center">
          <motion.div style={{ x }} className="flex gap-8 pl-[10vw] pr-[40vw] will-change-transform">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.n}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative h-[60vh] w-[70vw] shrink-0 overflow-hidden border border-border bg-surface/50 backdrop-blur md:w-[42vw]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.color}`} />
                <div className="absolute inset-0 [background-image:linear-gradient(oklch(1_0_0_/_0.04)_1px,transparent_1px)] [background-size:1px_28px]" />
                <div className="relative flex h-full flex-col justify-between p-8 md:p-12">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                      {p.n}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {p.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tighter md:text-6xl">
                      {p.title}
                    </h3>
                    <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">
                      {p.desc}
                    </p>
                    <div className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-1 text-[11px] uppercase tracking-[0.3em] text-accent">
                      Case study <span>↗</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[80px] font-black text-foreground/5 md:text-[140px]">
                    0{i + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* progress bar */}
        <div className="relative z-20 px-6 pb-8 md:px-12">
          <div className="h-px w-full bg-border">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
              className="h-px w-full bg-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
