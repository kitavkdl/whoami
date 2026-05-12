import { Reveal } from "./Reveal";

export function Education() {
  return (
    <section className="relative border-y border-border bg-surface/30 px-6 py-32 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              ⟢ 04 — Education
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-8">
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
        </div>
      </div>
    </section>
  );
}
