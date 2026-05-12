import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden"
    >
      {/* glow blob */}
      <motion.div
        style={{ y: blobY }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="animate-glow-pulse h-full w-full rounded-full bg-accent/30 blur-[140px]" />
      </motion.div>

      {/* secondary blob */}
      <div className="pointer-events-none absolute -left-40 bottom-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />

      {/* status pill */}
      <div className="absolute left-6 top-24 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:left-10 md:top-28">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Available for collaboration
      </div>

      {/* meta corners */}
      <div className="absolute right-6 top-24 z-10 hidden text-right text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block md:right-10 md:top-28">
        <div>N 37.41° / E 127.51°</div>
        <div className="text-foreground/80">Gyeonggi-do, KR</div>
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 px-6 text-center">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:text-xs">
          ⟢ Portfolio · MMXXVI ⟢
        </p>
        <h1 className="font-display text-[18vw] font-extrabold uppercase leading-[0.85] tracking-tighter md:text-[14vw]">
          <motion.span
            initial={{ opacity: 0, y: 80, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            Jiyul
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 80, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-outline block transition-colors duration-700 hover:text-foreground hover:[-webkit-text-stroke:0]"
          >
            Ahn
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mt-8 max-w-md text-sm uppercase tracking-[0.35em] text-muted-foreground md:text-base"
        >
          Systems Developer<span className="text-accent"> · </span>Founder
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Scroll</span>
          <div className="h-16 w-px overflow-hidden bg-border">
            <motion.div
              animate={{ y: [-64, 64] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-16 w-px bg-accent"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
