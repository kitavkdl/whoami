import { sectionIds } from "@/lib/content";
import { HOME_PATH, langFromLocation } from "@/lib/i18n";

export { sectionIds };

/**
 * Scrolls a section into view and hands it focus, so the keyboard carries on
 * from where the eye just landed instead of from the top of the document.
 */
export function gotoSection(id: string) {
  const el = document.getElementById(id);

  // The sections are on the front page. Asked for one from somewhere else —
  // /study, through the palette — go there rather than doing nothing.
  if (!el) {
    const lang = langFromLocation(window.location.pathname, {
      lang: new URLSearchParams(window.location.search).get("lang") ?? undefined,
    });
    window.location.href = `${HOME_PATH[lang]}#${id}`;
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
}
