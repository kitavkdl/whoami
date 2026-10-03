/**
 * Light or dark. A first visit follows the system; once the reader presses the
 * toggle, their choice is stored and pinned from then on.
 *
 * The resolved value lives on <html data-theme>, written by a blocking script
 * in the head before first paint, so there is no flash and no hydration gap.
 * Swaps are instant — no transition, no animation.
 */

export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/** Runs before paint. Kept as a string because it is inlined into the head. */
export const themeBootScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var p=localStorage.getItem("${THEME_KEY}");d.dataset.theme=p==="light"||p==="dark"?p:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){d.dataset.theme="light"}})()`;

const listeners = new Set<(theme: Theme) => void>();

function stored(): Theme | null {
  try {
    const p = localStorage.getItem(THEME_KEY);
    return p === "light" || p === "dark" ? p : null;
  } catch {
    return null;
  }
}

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  // Hold every hover transition still for the swap, so colours cut over in a
  // single frame instead of trailing behind. Forcing a style read before the
  // attribute comes off commits the new values with transitions disabled.
  root.dataset.themeSwap = "";
  root.dataset.theme = theme;
  void getComputedStyle(root).color;
  delete root.dataset.themeSwap;
  listeners.forEach((fn) => fn(theme));
}

/** Pins a theme and remembers it. */
export function setTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode; the attribute is still correct for this page view */
  }
  apply(theme);
}

/** Flips light ↔ dark and reports where it landed. */
export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function subscribeTheme(fn: (theme: Theme) => void) {
  listeners.add(fn);

  // Until the reader has picked one, keep following the system.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (!stored()) apply(media.matches ? "dark" : "light");
  };
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(fn);
    media.removeEventListener("change", onSystemChange);
  };
}
