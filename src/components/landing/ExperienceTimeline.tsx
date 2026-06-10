import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "./Reveal";

const roles = [
  {
    date: "Mar 2026 — Jun 2026",
    role: "Short-term Development Researcher",
    company: "KOPRI (Korea Polar Research Institute)",
    location: "Incheon, KR",
    bullets: [
      "Developed and maintained internal research data management tools and web interfaces for polar science operations.",
      "Collaborated with research teams to digitize field data pipelines and streamline analytical workflows.",
      "Contributed to software architecture decisions supporting large-scale geospatial and environmental datasets.",
    ],
    tags: ["Research", "Data", "Web"],
  },
  {
    date: "Jun 2025 — Present",
    role: "Odoo Partner Project Manager",
    company: "DX Tech Company",
    location: "Incheon, KR",
    bullets: [
      "Manage multiple concurrent projects, prioritizing by urgency, resources, and organizational alignment.",
      "Define plans and resourcing required to meet project goals and milestones.",
      "Monitor performance to surface improvement areas and drive iterative adjustments.",
    ],
    tags: ["Odoo", "PM", "Operations"],
  },
  {
    date: "Feb 2025 — Present",
    role: "Founder & Lead Developer",
    company: "Stealth · B2B Export Infra",
    location: "Incheon, KR",
    bullets: [
      "Planned a B2B export transaction infrastructure connecting domestic sellers with overseas buyers.",
      "Architected hybrid data structures — NoSQL for high-volume behavior and social signals — tuned to data nature.",
      "Led functional definition and MVP build, automating customs and logistics across the export pipeline.",
    ],
    tags: ["Founder", "B2B", "Architecture"],
  },
  {
    date: "Apr 2023 — Dec 2024",
    role: "Developer",
    company: "BADA",
    location: "Cheonan, KR",
    bullets: [
      "Digitized an offline student application pipeline into a website using PHP, HTML, and JavaScript — improving access and processing.",
      "Designed cross-platform (Mobile + PC) UI/UX and led end-to-end deployment on Cafe24, including server config and release.",
    ],
    tags: ["PHP", "Full-stack", "Deployment"],
  },
];

export function ExperienceTimeline() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} id="work" className="relative px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20">
          <Reveal>
            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              ⟢ 03 — Experience
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
              A track record of <br className="hidden md:block" />
              <span className="italic">shipping</span><span className="text-accent">.</span>
            </h2>
          </Reveal>
        </div>

        <div className="relative grid grid-cols-1 gap-y-24 lg:grid-cols-12 lg:gap-12">
          {/* progress line */}
          <div className="absolute left-[7px] top-0 hidden h-full w-px bg-border lg:left-[calc(33.333%+24px)] lg:block">
            <motion.div style={{ height: lineH }} className="w-px bg-accent" />
          </div>

          {roles.map((r, i) => (
            <div key={i} className="contents">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <Reveal>
                    <div className="flex items-start gap-4">
                      <div className="relative mt-2 hidden h-4 w-4 lg:block">
                        <div className="absolute inset-0 rounded-full bg-accent" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                          {r.date}
                        </p>
                        <h3 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                          {r.role}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {r.company} · {r.location}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>

              <div className="lg:col-span-8">
                <Reveal delay={0.1}>
                  <ul className="space-y-4 border-l border-border pl-6 lg:border-l-0 lg:pl-0">
                    {r.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="relative pl-6 text-base leading-relaxed text-foreground/85 md:text-lg"
                      >
                        <span className="absolute left-0 top-[10px] h-px w-3 bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
