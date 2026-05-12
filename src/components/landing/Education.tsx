import { Reveal } from "./Reveal";
import sbu from "@/assets/sbu.png";

export function Education() {
  return (
    <section className="relative border-y border-border bg-surface/30 px-6 py-32 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal>
            <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              ⟢ 06 — Education
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-sm border border-border bg-white transition-all hover:border-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 transition-all group-hover:from-accent/10 group-hover:to-transparent" />
              <img src={sbu} alt="Stony Brook University" className="relative h-full w-full object-cover opacity-95 transition-opacity group-hover:opacity-100" />
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-9">
          <Reveal delay={0.1}>
            <h3 className="font-display text-4xl font-extrabold tracking-tighter md:text-6xl">
              Stony Brook University
            </h3>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span>B.S. Computer Science</span>
              <span className="hidden h-1 w-1 rounded-full bg-accent md:block" />
              <span>New York, United States</span>
              <span className="hidden h-1 w-1 rounded-full bg-accent md:block" />
              <span>Undergraduate</span>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
              Studying computer science at SBU — focusing on systems thinking, distributed data, and the messy bridge between code and operations.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
