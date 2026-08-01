import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlitchText } from "./GlitchText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const roles = [
  {
    date: "Jul 2025 · Present",
    role: "Founder & Lead Developer",
    company: "SeekOnce",
    location: "Incheon, KR",
    bullets: [
      "Built and shipped an academic management platform for SUNY Korea, gated by @stonybrook.edu, reaching 100 users within 20 days of launch.",
      "Architected a 20+ table PostgreSQL schema spanning users, clubs, transcripts, courses, evaluations, and geolocation modules.",
      "Continuously improved architecture decisions · replaced polling with Supabase Realtime and refactored curriculum-path animations with Framer Motion across 15+ releases.",
    ],
    tags: ["React", "Supabase", "PostgreSQL", "Realtime"],
  },
  {
    date: "Mar 2026 · Jun 2026",
    role: "Research Intern (Paid Contract)",
    company: "KOPRI (Korea Polar Research Institute) · Life Sciences Research Division",
    location: "Incheon, KR",
    bullets: [
      "Built an offline software program for internal use under a paid development contract.",
      "Engagement is governed by a signed non-disclosure agreement · scope and details are confidential.",
    ],
    tags: ["Paid Contract", "NDA", "Government Institute"],
  },
  {
    date: "Jun 2025 · Present",
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
    date: "Feb 2025 · Present",
    role: "Founder & Lead Developer",
    company: "Stealth · B2B Export Infra",
    location: "Incheon, KR",
    bullets: [
      "Planned a B2B export transaction infrastructure connecting domestic sellers with overseas buyers.",
      "Architected hybrid data structures · NoSQL for high-volume behavior and social signals · tuned to data nature.",
      "Led functional definition and MVP build, automating customs and logistics across the export pipeline.",
    ],
    tags: ["Founder", "B2B", "Architecture"],
  },
  {
    date: "Apr 2023 · Dec 2024",
    role: "Developer",
    company: "BADA",
    location: "Cheonan, KR",
    bullets: [
      "Digitized an offline student application pipeline into a website using PHP, HTML, and JavaScript · improving access and processing.",
      "Designed cross-platform (Mobile + PC) UI/UX and led end-to-end deployment on Cafe24, including server config and release.",
    ],
    tags: ["PHP", "Full-stack", "Deployment"],
  },
];

export function ExperienceTimeline() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // vertical line draws on scroll
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "bottom 80%",
              scrub: true,
            },
          },
        );
      }

      // stagger cards
      const items = section.querySelectorAll<HTMLElement>("[data-exp-item]");
      items.forEach((item) => {
        gsap.fromTo(
          item.querySelectorAll<HTMLElement>("[data-exp-anim]"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="work" className="relative px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20">
          <p
            data-exp-anim
            className="mb-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
          >
            <GlitchText text="⟢ 03 · Experience" />
          </p>
          <h2
            data-exp-anim
            className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl"
          >
            A track record of <br className="hidden md:block" />
            <span className="italic">shipping</span>
            <span className="text-accent">.</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-y-24 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-32">
          {/* progress line · sits in the gap between col-4 and col-8 */}
          <div
            className="pointer-events-none absolute top-0 hidden h-full w-px bg-border lg:block"
            style={{ left: "calc((100% - 15 * 1rem) / 12 * 4 + 8 * 1rem)" }}
          >
            <div ref={lineRef} className="h-full w-px bg-accent" />
          </div>

          {roles.map((r, i) => (
            <div key={i} data-exp-item className="contents">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32 lg:pr-8">
                  <div data-exp-anim className="flex items-start gap-4">
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
                </div>
              </div>

              <div className="lg:col-span-8 lg:pl-8">
                <ul
                  data-exp-anim
                  className="space-y-4 border-l border-border pl-6 lg:border-l-0 lg:pl-0"
                >
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
                <div data-exp-anim className="mt-6 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
