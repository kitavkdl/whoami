/**
 * Theme with three states: follow the system, or pin light or dark.
 *
 * The resolved value lives on <html data-theme>, written by a blocking script
 * in the head before first paint, so there is no flash and no hydration gap.
 * This module keeps that attribute in sync afterwards and, where the browser
 * supports it, hands the swap to the View Transition API so the new palette
 * wipes out of whatever the reader just pressed.
 *
 * Every path into a swap animates. A change fired from the keyboard, the
 * palette or the console has no click to grow out of, so it borrows the
 * position of whichever toggle is on screen; a browser without view
 * transitions gets a short cross-fade on the tokens instead of a hard cut.
 */

export type ThemePref = "system" | "light" | "dark";
export type Resolved = "light" | "dark";

export const THEME_KEY = "theme";

/** Marks a toggle button, so a swap fired from elsewhere can start from it. */
export const THEME_ANCHOR = "data-theme-anchor";

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

type Origin = { x: number; y: number };

function onScreen(el: HTMLElement): boolean {
  const box = el.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return false;
  // A toggle in a top bar that has slid away is still laid out; ask the
  // browser whether it is actually painted before growing a circle from it.
  if (typeof el.checkVisibility === "function" && !el.checkVisibility({ visibilityProperty: true }))
    return false;
  return box.bottom > 0 && box.top < window.innerHeight;
}

/**
 * Where to grow the wipe from when the caller has no click to offer. The
 * on-screen toggle if there is one, the top-right corner otherwise — which is
 * where the toggle would be if the reader scrolled up.
 */
function anchorOrigin(): Origin {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>(`[${THEME_ANCHOR}]`));
  const target = anchors.find(onScreen);

  if (target) {
    const box = target.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return { x: window.innerWidth - 44, y: 44 };
}

export function originOf(el: Element): Origin {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/** Identifies the swap that currently owns the transition attributes. */
let swapToken = 0;

/**
 * Applies a preference. When the browser has view transitions and the reader
 * has not asked for reduced motion, the repaint is clipped to a circle growing
 * from `origin` — far enough to cover the furthest corner of the viewport.
 * Without an origin it grows from the nearest toggle instead of cutting.
 */
export function setThemePref(pref: ThemePref, origin?: Origin) {
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
    // No snapshot to wipe, so ease the tokens themselves for a moment. The
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

  const { x, y } = origin ?? anchorOrigin();
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  root.dataset.vt = "theme";

  const mine = ++swapToken;
  const transition = startViewTransition.call(document, () => {
    commit(pref);
  });

  transition.finished
    .catch(() => undefined)
    .finally(() => {
      // A faster second press starts its own transition and takes ownership of
      // these; clearing them here would strand it mid-wipe.
      if (swapToken !== mine) return;
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

export const THEME_LABEL: Record<ThemePref, string> = {
  system: "Following the system",
  light: "Light",
  dark: "Dark",
};

/**
 * Advances the rotation and reports where it landed.
 *
 * Exactly one place may call this per press. Reading the preference back out
 * of the DOM is only correct until a swap is in flight: under a view
 * transition the commit is deferred to the next frame, so a second caller in
 * the same tick would read the old value and start a competing transition.
 */
export function cycleTheme(origin?: Origin): ThemePref {
  const next = nextPref(readPref());
  setThemePref(next, origin);
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
