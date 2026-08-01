import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import portrait from "@/assets/jiyul.png";
import extra2 from "@/assets/jiyul-2.jpg.asset.json";
import extra3 from "@/assets/jiyul-3.jpg.asset.json";
import extra4 from "@/assets/jiyul-4.jpg.asset.json";
import { Reveal } from "./Reveal";
import { Counter } from "./Counter";
import { GlitchText } from "./GlitchText";

const EXTRAS = [
  { src: extra2.url, label: "IMG_3641 · 2025", rot: -8, x: -46, y: -34 },
  { src: extra3.url, label: "IMG_3618 · archive", rot: 7, x: 48, y: -6 },
  { src: extra4.url, label: "IMG_4433 · night", rot: -4, x: -34, y: 40 },
];


export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);

  const [active, setActive] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  return (
    <section ref={ref} id="about" className="relative px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <motion.div
            style={{ y: imgY }}
            className="relative aspect-[4/5] w-full [perspective:1200px]"
            onMouseEnter={() => !isTouch && setActive(true)}
            onMouseLeave={() => !isTouch && setActive(false)}
            onPointerDown={() => isTouch && setActive(true)}
            onPointerUp={() => isTouch && setActive(false)}
            onPointerCancel={() => isTouch && setActive(false)}
          >
            {/* Extra photos · fanned out on hover/press */}
            {EXTRAS.map((e, i) => (
              <motion.div
                key={e.src}
                aria-hidden={!active}
                initial={false}
                animate={
                  active
                    ? {
                        opacity: 1,
                        x: `${e.x}%`,
                        y: `${e.y}%`,
                        rotate: e.rot,
                        scale: 0.5,
                        filter: "blur(0px)",
                      }
                    : {
                        opacity: 0,
                        x: "0%",
                        y: "0%",
                        rotate: 0,
                        scale: 0.4,
                        filter: "blur(8px)",
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  delay: active ? i * 0.06 : (EXTRAS.length - 1 - i) * 0.03,
                }}
                className="pointer-events-none absolute inset-0 z-[4] overflow-hidden rounded-sm border border-accent/40 bg-surface shadow-[0_20px_60px_-10px_oklch(0.62_0.31_312_/_0.5)]"
                style={{ transformOrigin: "center" }}
              >
                <img
                  src={e.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 mix-blend-overlay [background-image:linear-gradient(oklch(1_0_0_/_0.06)_1px,transparent_1px)] [background-size:1px_3px]" />
                <div className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
                  {e.label}
                </div>
                <div className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/70">
                  0{i + 2}
                </div>
              </motion.div>
            ))}

            {/* Main portrait */}
            <motion.div
              animate={{
                scale: active ? 0.82 : 1,
                rotate: active ? -1.5 : 0,
                x: active ? "-4%" : "0%",
                y: active ? "-3%" : "0%",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="relative z-[2] h-full w-full overflow-hidden rounded-sm border border-border bg-surface shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.6)]"
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

              {/* Hint */}
              <AnimatePresence>
                {!active && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 flex items-center gap-2 border border-accent/60 bg-background/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-accent backdrop-blur"
                  >
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    {isTouch ? "hold" : "hover"} · reveal
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Scanline flicker when active */}
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-[3] mix-blend-screen [background-image:linear-gradient(oklch(0.62_0.31_312_/_0.08)_1px,transparent_2px)] [background-size:1px_4px]"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <Reveal>
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              <GlitchText text="⟢ 01 · About" />
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
              Translating <span className="text-outline-accent">complex</span> systems into <em className="not-italic text-accent">scalable</em> products.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              I'm a systems-oriented developer with experience building and digitizing operational platforms · from end-to-end workflow architecture and UX, to backend data structures for administrative and B2B transaction processes.
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
