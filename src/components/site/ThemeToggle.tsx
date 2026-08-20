import { useEffect, useState } from "react";
import { nextPref, readPref, setThemePref, subscribeTheme, type ThemePref } from "@/lib/theme";
import { on } from "@/lib/bus";

const LABEL: Record<ThemePref, string> = {
  system: "Following the system",
  light: "Light",
  dark: "Dark",
};

function Glyph({ pref }: { pref: ThemePref }) {
  if (pref === "light") {
    return (
      <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="8"
            y1="1.4"
            x2="8"
            y2="3.1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${deg} 8 8)`}
          />
        ))}
      </svg>
    );
  }

  if (pref === "dark") {
    return (
      <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" aria-hidden>
        <path
          d="M13 9.6A5.6 5.6 0 0 1 6.4 3a5.6 5.6 0 1 0 6.6 6.6Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 2.8a5.2 5.2 0 0 1 0 10.4Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Rotates system → light → dark. The swap itself is handed to the View
 * Transition API in lib/theme, which clips the repaint to a circle growing out
 * of this button, so the new palette arrives from where you pressed.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(readPref());
    return subscribeTheme((next) => setPref(next));
  }, []);

  useEffect(
    () =>
      on("theme:cycle", (origin) => {
        const current = readPref();
        setThemePref(nextPref(current), origin ?? { x: window.innerWidth - 48, y: 48 });
      }),
    [],
  );

  return (
    <button
      type="button"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        setThemePref(nextPref(pref), {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        });
      }}
      title={`Theme · ${LABEL[pref]}`}
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[nextPref(pref)].toLowerCase()}.`}
      className={
        "inline-flex size-8 items-center justify-center rounded-[3px] border border-rule text-soft transition-colors hover:border-mark/50 hover:text-mark " +
        className
      }
    >
      <Glyph pref={pref} />
    </button>
  );
}
