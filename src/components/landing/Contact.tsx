import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./Reveal";
import { GlitchText } from "./GlitchText";
import { Terminal } from "./Terminal";

function useKstClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const update = () => setTime(formatKst(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatKst(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(d);
}

function copy(text: string, label: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`Copied · ${label}`),
      () => toast.error("Copy failed"),
    );
  }
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const kst = useKstClock();

  return (
    <section
      ref={ref}
      id="contact"
      className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-24 md:px-10"
    >
      <motion.div
        style={{ x }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span className="font-display text-[28vw] font-extrabold uppercase leading-none tracking-tighter text-outline whitespace-nowrap opacity-40">
          LET'S TALK
        </span>
      </motion.div>

      <div className="relative z-10 max-w-3xl">
        <Reveal>
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            <GlitchText text="⟢ 05 — Contact" />
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
            Have a system worth <br className="hidden md:block" />
            <span className="text-accent italic">building?</span>
          </h2>
        </Reveal>
      </div>

      <div className="relative z-10 mt-20 grid grid-cols-1 gap-10 md:grid-cols-3">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</p>
          <a
            href="mailto:jiyul.ahn@stonybrook.edu"
            data-magnetic
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              copy("jiyul.ahn@stonybrook.edu", "email");
            }}
            className="mt-3 block break-all font-display text-xl font-bold tracking-tight transition-colors hover:text-accent md:text-2xl"
          >
            jiyul.ahn@stonybrook.edu
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Phone</p>
          <a
            href="tel:+821086859042"
            data-magnetic
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              copy("+82 10 8685 9042", "phone");
            }}
            className="mt-3 block font-display text-xl font-bold tracking-tight transition-colors hover:text-accent md:text-2xl"
          >
            +82 10 8685 9042
          </a>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Location</p>
          <p className="mt-3 font-display text-xl font-bold tracking-tight md:text-2xl">
            Songdo, Incheon
            <br />
            South Korea
          </p>
        </Reveal>
      </div>

      {/* interactive terminal widget */}
      <div className="relative z-10 mt-16 max-w-2xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <GlitchText text="⟢ ja-term" />
        </p>
        <Terminal />
      </div>


      <div className="relative z-10 mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:items-center">
        <span>© 2026 Jiyul Ahn — All rights reserved</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
              <span className="relative h-2 w-2 rounded-full bg-accent" />
            </span>
            Online · KR / EN
          </span>
          <span className="hidden text-muted-foreground/40 md:inline">·</span>
          <span className="font-mono text-accent tabular-nums tracking-[0.2em]">
            KST {kst}
          </span>
        </span>
      </div>
    </section>
  );
}
