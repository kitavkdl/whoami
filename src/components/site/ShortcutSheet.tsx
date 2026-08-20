import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  {
    title: "Anywhere",
    rows: [
      [["⌘", "K"], "Open the command palette"],
      [["/"], "Same thing, one key"],
      [["?"], "This sheet"],
      [["t"], "Cycle the theme"],
      [["p"], "Print as a resume"],
      [["Esc"], "Close whatever is open"],
    ],
  },
  {
    title: "Moving around",
    rows: [
      [["j"], "Next section"],
      [["k"], "Previous section"],
      [["g", "h"], "Back to the top"],
      [["g", "n"], "Now"],
      [["g", "o"], "Overlap"],
      [["g", "b"], "Before"],
      [["g", "a"], "Awards"],
      [["g", "c"], "Contact"],
      [["g", "k"], "The console"],
    ],
  },
  {
    title: "In the console",
    rows: [
      [["Tab"], "Complete a command or a path"],
      [["↑", "↓"], "Walk back through history"],
      [["Ctrl", "L"], "Clear the scrollback"],
      [["Ctrl", "U"], "Kill the line"],
      [["Ctrl", "C"], "Cancel it"],
    ],
  },
];

function Key({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded-[3px] border border-rule bg-paper px-[5px] py-[2px] font-mono text-[10.5px] text-ink shadow-[0_1px_0_var(--rule)]">
      {children}
    </kbd>
  );
}

export function ShortcutSheet() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => on("shortcuts:toggle", () => setOpen((v) => !v)), []);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === "Tab") event.preventDefault();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      data-print="hide"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative max-h-[80vh] w-full max-w-[30rem] overflow-y-auto rounded-[6px] border border-rule bg-panel p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.6)]"
        style={{ animation: "sheet-in 180ms cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="shortcuts-title"
            className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft"
          >
            Keyboard
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="font-sans text-[12px] text-soft underline-offset-4 hover:text-mark hover:underline"
          >
            close
          </button>
        </div>

        {GROUPS.map((group) => (
          <div key={group.title} className="mt-5">
            <p className="font-sans text-[12px] text-soft/80">{group.title}</p>
            <dl className="mt-2">
              {group.rows.map(([keys, label]) => (
                <div
                  key={label}
                  className="flex items-baseline gap-3 border-t border-rule/70 py-[6px] first:border-t-0"
                >
                  <dt className="flex shrink-0 items-center gap-[3px]">
                    {keys.map((key) => (
                      <Key key={key}>{key}</Key>
                    ))}
                  </dt>
                  <dd className="ml-auto text-right font-sans text-[13px] text-ink/85">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sheet-in {
          from { opacity: 0; transform: translate3d(0, 8px, 0) scale(0.99) }
          to { opacity: 1; transform: none }
        }
      `}</style>
    </div>
  );
}
