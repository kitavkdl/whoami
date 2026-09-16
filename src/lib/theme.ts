/**
 * Theme with three states: follow the system, or pin light or dark.
 *
 * The resolved value lives on <html data-theme>, written by a blocking script
 * in the head before first paint, so there is no flash and no hydration gap.
 * This module keeps that attribute in sync afterwards and, where the browser
 * supports it, hands the swap to the View Transition API so the whole page
 * drops out of frame and the new palette rises into the space it left.
 *
 * Every path into a swap animates the same way — the motion is the page's, not
 * the button's, so it does not matter whether the change came from a press, the
 * keyboard, the palette or the console. A browser without view transitions gets
 * a short cross-fade on the tokens instead of a hard cut.
 */

export type ThemePref = "system" | "light" | "dark";
export type Resolved = "light" | "dark";

export const THEME_KEY = "theme";

/** How long the token cross-fade runs where there is no view transition. */
const FALLBACK_MS = 300;

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

/** Identifies the swap that currently owns the transition attribute. */
let swapToken = 0;

/**
 * Applies a preference. When the browser has view transitions and the reader
 * has not asked for reduced motion, the outgoing page slides down out of frame
 * and the incoming one slides up into it — see the theme-drop/theme-rise pair
 * in styles.css, which the data-vt attribute below switches on.
 */
export function setThemePref(pref: ThemePref) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    commit(pref);
    return;
  }

  const startViewTransition = (
    document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }
  ).startViewTransition;

  if (typeof startViewTransition !== "function") {
    // No snapshot to slide, so ease the tokens themselves for a moment. The
    // attribute is removed afterwards; a permanent transition here would make
    // every hover on the page feel a beat late.
    const mine = ++swapToken;
    root.dataset.themeSwap = "1";
    commit(pref);
    window.setTimeout(() => {
      if (swapToken === mine) delete root.dataset.themeSwap;
    }, FALLBACK_MS);
    return;
  }

  root.dataset.vt = "theme";

  const mine = ++swapToken;
  const transition = startViewTransition.call(document, () => {
    commit(pref);
  });

  transition.finished
    .catch(() => undefined)
    .finally(() => {
      // A faster second press starts its own transition and takes ownership of
      // this; clearing it here would strand that one mid-slide.
      if (swapToken !== mine) return;
      delete root.dataset.vt;
    });
}

/** Next preference in the system → light → dark → system rotation. */
export function nextPref(current: ThemePref): ThemePref {
  return current === "system" ? "light" : current === "light" ? "dark" : "system";
}

/**
 * Advances the rotation and reports where it landed.
 *
 * Exactly one place may call this per press. Reading the preference back out
 * of the DOM is only correct until a swap is in flight: under a view
 * transition the commit is deferred to the next frame, so a second caller in
 * the same tick would read the old value and start a competing transition.
 */
export function cycleTheme(): ThemePref {
  const next = nextPref(readPref());
  setThemePref(next);
  return next;
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
