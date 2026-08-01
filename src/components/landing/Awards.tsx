import { Reveal } from "./Reveal";
import { GlitchText } from "./GlitchText";

export function Awards() {
  return (
    <section id="awards" className="relative px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
            <GlitchText text="⟢ 02 · Awards" />
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-12 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
            Recognized <em className="not-italic text-accent">work</em>.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <article className="group relative overflow-hidden rounded-sm border border-border bg-surface/40 p-6 transition-all hover:border-accent md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/0 transition-all group-hover:from-accent/10" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  ★ Grand Prize · 1st Place
                </p>
                <h3 className="font-display text-3xl font-extrabold tracking-tighter md:text-5xl">
                  CODEGATE 2026 AI Startup Hackathon
                </h3>
                <div className="mt-5 flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.2em] md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:gap-y-2">
                  <span className="inline-flex w-fit items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
                    Product Planner &amp; Presenter
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-accent md:block" />
                  <span className="text-muted-foreground">July 2026</span>
                </div>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
                  Led product planning and delivered the final pitch for an AI knowledge-succession platform for manufacturing SMBs, winning 1st place out of all competing teams.
                </p>
              </div>

              <div className="md:pl-6 md:text-right">
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-mono text-xs font-medium tracking-[0.2em] text-amber-300">
                  ₩ 20,000,000
                </span>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Prize
                </p>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
