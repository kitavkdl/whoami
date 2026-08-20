/**
 * Theme with three states: follow the system, or pin light or dark.
 *
 * The resolved value lives on <html data-theme>, written by a blocking script
 * in the head before first paint, so there is no flash and no hydration gap.
 * This module keeps that attribute in sync afterwards and, where the browser
 * supports it, hands the swap to the View Transition API so the new palette
 * wipes out of whatever the reader just clicked.
 */

export type ThemePref = "system" | "light" | "dark";
export type Resolved = "light" | "dark";

export const THEME_KEY = "theme";

/** Runs before paint. Kept as a string because it is inlined into the head. */
export const themeBootScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var p=localStorage.getItem("${THEME_KEY}")||"system";var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=p==="system"?(m?"dark":"light"):p;d.dataset.theme=r;d.dataset.themePref=p}catch(e){d.dataset.theme="light";d.dataset.themePref="system"}})()`;

const listeners = new Set<(pref: ThemePref, resolved: Resolved) => void>();

function systemIsDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readPref(): ThemePref {
  if (typeof document === "undefined") return "system";
  const p = document.documentElement.dataset.themePref;
  return p === "light" || p === "dark" ? p : "system";
}

export function resolve(pref: ThemePref): Resolved {
  if (pref === "light" || pref === "dark") return pref;
  return systemIsDark() ? "dark" : "light";
}

export function readResolved(): Resolved {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function commit(pref: ThemePref) {
  const root = document.documentElement;
  const resolved = resolve(pref);
  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* private mode; the attribute is still correct for this page view */
  }
  listeners.forEach((fn) => fn(pref, resolved));
}

type Origin = { x: number; y: number };

/**
 * Applies a preference. When the browser has view transitions and the reader
 * has not asked for reduced motion, the repaint is clipped to a circle growing
 * from `origin` — far enough to cover the furthest corner of the viewport.
 */
export function setThemePref(pref: ThemePref, origin?: Origin) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startViewTransition = (
    document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }
  ).startViewTransition;

  if (!origin || reduced || typeof startViewTransition !== "function") {
    commit(pref);
    return;
  }

  const { x, y } = origin;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  root.dataset.vt = "theme";

  const transition = startViewTransition.call(document, () => {
    commit(pref);
  });

  transition.finished
    .catch(() => undefined)
    .finally(() => {
      delete root.dataset.vt;
      root.style.removeProperty("--vt-x");
      root.style.removeProperty("--vt-y");
      root.style.removeProperty("--vt-r");
    });
}

/** Next preference in the system → light → dark → system rotation. */
export function nextPref(current: ThemePref): ThemePref {
  return current === "system" ? "light" : current === "light" ? "dark" : "system";
}

export function subscribeTheme(fn: (pref: ThemePref, resolved: Resolved) => void) {
  listeners.add(fn);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readPref() === "system") commit("system");
  };
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(fn);
    media.removeEventListener("change", onSystemChange);
  };
}
