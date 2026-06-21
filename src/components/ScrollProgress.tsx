import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const v = h > 0 ? window.scrollY / h : 0;
      setP(Math.min(1, Math.max(0, v)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pct = Math.round(p * 100);
  const label = String(pct).padStart(3, "0");

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <div className="relative h-[40vh] w-px bg-border">
        <div
          className="absolute left-0 top-0 w-px bg-accent transition-[height] duration-75"
          style={{ height: `${pct}%` }}
        />
        <div
          className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] transition-[top] duration-75"
          style={{ top: `calc(${pct}% - 3px)` }}
        />
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
        depth ▸ ∞
      </div>
    </div>
  );
}
