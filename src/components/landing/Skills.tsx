import { Reveal } from "./Reveal";

const skills = [
  { n: "01", t: "Project Management", d: "Prioritizing across urgency, resources, and goals." },
  { n: "02", t: "System Workflow Architecture", d: "End-to-end pipelines for B2B and admin processes." },
  { n: "03", t: "Programming", d: "PHP, JavaScript, and modern web stacks." },
  { n: "04", t: "Web Development", d: "Cross-platform UI/UX, mobile and PC." },
  { n: "05", t: "Technical Support", d: "Server config, deployment, production release." },
  { n: "06", t: "Team Collaboration", d: "Functional specs to MVP delivery." },
];

export function Skills() {
  return (
    <section id="skills" className="relative border-y border-border bg-surface/30 px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                ⟢ 02 — Capabilities
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
                Built for the <br className="hidden md:block" />
                <span className="text-outline-accent">technical layer.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-sm text-muted-foreground md:text-right">
              A toolkit shaped by shipping operational platforms in production — not toy projects.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div
                data-magnetic
                className="group relative h-full overflow-hidden bg-background p-8 transition-colors hover:bg-surface/60 md:p-10"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/0 blur-3xl transition-all duration-700 group-hover:bg-accent/40" />
                <div className="relative">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs text-accent">{s.n}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-foreground">
                      ⟶
                    </span>
                  </div>
                  <h3 className="mt-12 font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {s.t}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
