import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { GlitchText } from "./GlitchText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Project = {
  n: string;
  title: string;
  tag: string;
  desc: string;
  color: string;
  metrics?: string[];
  tags?: string[];
  link?: string;
};

const PROJECTS: Project[] = [
  {
    n: "P/01",
    title: "SeekOnce",
    tag: "Founder & Lead Developer · 2025–Present · seek-once.com",
    desc: "Academic management platform for SUNY Korea — gated by @stonybrook.edu. 100 users in 20 days of launch. Currently v3.7.1, actively shipped.\n\nGPA simulation, curriculum path mapping, friend schedule overlay, anonymous course evaluations, and campus café geolocation (Outstanding partnership). Transcript-based auto-ingestion across all features.",
    color: "from-emerald-500/30 to-teal-500/10",
    metrics: ["100 users — 20 days", "v3.7.1 — 15+ releases", "20+ table schema", "10+ DAU"],
    tags: ["React", "Supabase", "PostgreSQL", "Framer Motion", "React Query", "Supabase Realtime"],
    link: "https://www.seek-once.com/",
  },
  {
    n: "P/02",
    title: "B2B Export Infra",
    tag: "Founder · 2025",
    desc: "Hybrid SQL + NoSQL pipeline connecting Korean sellers with overseas buyers — automating customs, logistics, and settlement.",
    color: "from-purple-500/30 to-fuchsia-500/10",
  },
  {
    n: "P/03",
    title: "Odoo Operations",
    tag: "PM · DX Tech",
    desc: "Multi-project orchestration: scoping, resourcing, and KPI instrumentation for Odoo-based enterprise rollouts.",
    color: "from-violet-500/30 to-indigo-500/10",
  },
  {
    n: "P/04",
    title: "BADA Admissions",
    tag: "Developer · 2023–24",
    desc: "Digitized an offline student pipeline into a cross-platform site — PHP / JS, server config, and full deployment on Cafe24.",
    color: "from-pink-500/30 to-rose-500/10",
  },
  {
    n: "P/05",
    title: "Internal Tools",
    tag: "Always shipping",
    desc: "A trail of small, sharp tools — admin dashboards, dataset cleaners, automation hooks. Boring on purpose, fast by design.",
    color: "from-cyan-500/20 to-sky-500/10",
  },
];

function ProjectCard({
  p,
  i,
  onShowLabel,
  onHideLabel,
}: {
  p: (typeof PROJECTS)[number];
  i: number;
  onShowLabel: (x: number, y: number) => void;
  onHideLabel: () => void;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    onShowLabel(e.clientX, e.clientY);
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleLeave = () => {
    onHideLabel();
    const el = tiltRef.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative h-[60vh] w-[70vw] shrink-0 md:w-[42vw] [perspective:900px]"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={tiltRef}
        className="relative h-full w-full overflow-hidden border border-border bg-surface/50 backdrop-blur transition-transform duration-150 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
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
            <p className="mt-6 max-w-md whitespace-pre-line text-sm leading-relaxed text-foreground/80 md:text-base">
              {p.desc}
            </p>
            {p.metrics && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {p.metrics.map((m) => (
                  <div
                    key={m}
                    className="border border-border/60 bg-background/40 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur-sm"
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
            {p.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {p.link ? (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-1 text-[11px] uppercase tracking-[0.3em] text-accent transition-colors hover:text-foreground"
              >
                Case study <span>↗</span>
              </a>
            ) : (
              <div className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-1 text-[11px] uppercase tracking-[0.3em] text-accent">
                Case study <span>↗</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[80px] font-black text-foreground/5 md:text-[140px]">
            0{i + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectsHorizontal() {
  const ref = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const titleX = useTransform(scrollYProgress, [0, 1], ["0%", "-120%"]);

  // ScrollTrigger snap — momentum stops at each project boundary
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: [0, 0.25, 0.5, 0.75, 1],
          duration: { min: 0.2, max: 0.6 },
          ease: "power2.inOut",
          delay: 0.08,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const showLabel = (cx: number, cy: number) => {
    const el = labelRef.current;
    if (!el) return;
    el.style.opacity = "1";
    el.style.transform = `translate3d(${cx + 18}px, ${cy + 18}px, 0)`;
  };
  const hideLabel = () => {
    const el = labelRef.current;
    if (el) el.style.opacity = "0";
  };

  return (
    <section ref={ref} id="projects" className="relative h-[500vh] bg-background">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <motion.div
          style={{ x: bgX }}
          className="pointer-events-none absolute inset-y-0 left-0 w-[300%] opacity-40 [background-image:radial-gradient(oklch(0.62_0.31_312_/_0.25)_1px,transparent_1px)] [background-size:40px_40px]"
        />

        <motion.h2
          style={{ x: titleX }}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[28vw] font-extrabold uppercase leading-none tracking-tighter text-outline opacity-30"
        >
          Selected · Works · Selected · Works ·
        </motion.h2>

        <div className="relative z-20 flex items-center justify-between px-6 pt-8 md:px-12">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            <GlitchText text="⟢ 05 — Selected projects" />
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            ◀ scroll ▶
          </p>
        </div>

        <div className="relative flex flex-1 items-center">
          <motion.div
            style={{ x }}
            className="flex gap-8 pl-[10vw] pr-[40vw] will-change-transform"
          >
            {PROJECTS.map((p, i) => (
              <ProjectCard
                key={p.n}
                p={p}
                i={i}
                onShowLabel={showLabel}
                onHideLabel={hideLabel}
              />
            ))}
          </motion.div>
        </div>

        <div className="relative z-20 px-6 pb-8 md:px-12">
          <div className="h-px w-full bg-border">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
              className="h-px w-full bg-accent"
            />
          </div>
        </div>
      </div>

      {/* cursor-follow label (desktop only) */}
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[65] hidden border border-accent bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-accent backdrop-blur transition-opacity duration-150 md:block"
        style={{ opacity: 0 }}
      >
        Case study ↗
      </div>
    </section>
  );
}
