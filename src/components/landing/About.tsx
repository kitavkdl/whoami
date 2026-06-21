import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import portrait from "@/assets/jiyul.png";
import { Reveal } from "./Reveal";
import { Counter } from "./Counter";
import { GlitchText } from "./GlitchText";

export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  return (
    <section ref={ref} id="about" className="relative px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <motion.div
            style={{ y: imgY }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-border bg-surface"
          >
            <motion.img
              style={{ scale: imgScale }}
              src={portrait}
              alt="Jiyul Ahn"
              width={832}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-foreground/80">
              <span className="text-accent">●</span> Jiyul Ahn / 2026
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <Reveal>
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              <GlitchText text="⟢ 01 — About" />
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
              Translating <span className="text-outline-accent">complex</span> systems into <em className="not-italic text-accent">scalable</em> products.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              I'm a systems-oriented developer with experience building and digitizing operational platforms — from end-to-end workflow architecture and UX, to backend data structures for administrative and B2B transaction processes.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              I work across data modeling, process automation, and production deployment, translating organizational complexity into technology that scales.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-10">
            <Reveal delay={0.1}>
              <div>
                <div className="font-display text-4xl font-extrabold tracking-tighter md:text-5xl">
                  <Counter to={5} suffix="+" />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Years building
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div>
                <div className="font-display text-4xl font-extrabold tracking-tighter md:text-5xl">
                  <Counter to={3} />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Active roles
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div>
                <div className="font-display text-4xl font-extrabold tracking-tighter md:text-5xl">
                  <Counter to={7} suffix="+" />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Cities operating
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
