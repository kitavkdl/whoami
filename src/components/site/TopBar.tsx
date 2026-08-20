import { useEffect, useState } from "react";
import { sections } from "@/lib/content";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { emit } from "@/lib/bus";

/**
 * Appears once the masthead has scrolled away, carrying the name and whichever
 * section you are currently in. Driven by an observer on a sentinel rather than
 * a scroll handler, so it costs nothing while you read.
 */
export function TopBar({ active, sentinelId }: { active: string; sentinelId: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(([record]) => setShown(!record.isIntersecting), {
      rootMargin: "0px 0px 0px 0px",
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  const label = sections.find((s) => s.id === active)?.label;

  return (
    <div
      data-print="hide"
      className="fixed inset-x-0 top-0 z-40 border-b border-rule bg-paper/80 backdrop-blur-md transition-[transform,opacity] duration-300 ease-out"
      style={{
        transform: shown ? "none" : "translate3d(0, -100%, 0)",
        opacity: shown ? 1 : 0,
        visibility: shown ? "visible" : "hidden",
      }}
    >
      <div className="mx-auto flex h-12 w-full max-w-[56rem] items-center gap-3 px-6">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-sans text-[13px] font-medium no-underline"
        >
          Jiyul Ahn
        </a>

        {label && (
          <>
            <span aria-hidden className="text-soft/50">
              /
            </span>
            <span className="font-sans text-[13px] text-soft">{label}</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => emit("palette:open")}
            className="hidden items-center gap-[6px] rounded-[3px] border border-rule px-2 py-[5px] font-mono text-[10.5px] text-soft transition-colors hover:border-mark/50 hover:text-mark sm:flex"
          >
            <span>⌘K</span>
            <span className="text-soft/70">search</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
