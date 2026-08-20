import { useEffect } from "react";

/**
 * A hairline at the top of the window showing how far down the page you are.
 *
 * Where the browser supports scroll-driven animations the whole thing runs on
 * the compositor with no JavaScript at all (see .progress-bar in styles.css).
 * The effect below only wakes up on browsers that lack them.
 */
export function ReadingProgress() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;

    const bar = document.getElementById("reading-progress");
    if (!bar) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const travel = doc.scrollHeight - window.innerHeight;
      const ratio = travel > 0 ? Math.min(1, window.scrollY / travel) : 0;
      bar.style.setProperty("--progress", ratio.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      data-print="hide"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]"
    >
      <div id="reading-progress" className="progress-bar h-full w-full bg-mark/70" />
    </div>
  );
}
