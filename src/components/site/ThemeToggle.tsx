import { useEffect, useState } from "react";
import { readTheme, subscribeTheme, toggleTheme, type Theme } from "@/lib/theme";
import { useCopy } from "@/lib/copy";

function Glyph({ theme }: { theme: Theme }) {
  if (theme === "light") {
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

/**
 * Flips light ↔ dark, instantly. The first visit follows the system (set by
 * the boot script in the head); a press pins the choice.
 *
 * This renders in two places at once — the masthead and the top bar — so it
 * owns no bus subscription; a toggle fired from the keyboard or the palette is
 * handled once, in Chrome.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const LABEL = useCopy().theme;
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(readTheme());
    return subscribeTheme(setThemeState);
  }, []);

  const other: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      title={`Theme · ${LABEL[theme]}`}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[other].toLowerCase()}.`}
      className={
        "inline-flex size-8 items-center justify-center rounded-[3px] border border-rule text-soft hover:border-mark/50 hover:text-mark " +
        className
      }
    >
      <Glyph theme={theme} />
    </button>
  );
}
