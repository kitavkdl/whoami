import { sections } from "@/lib/content";

export const sectionIds = sections.map((s) => s.id);

/**
 * Scrolls a section into view and hands it focus, so the keyboard carries on
 * from where the eye just landed instead of from the top of the document.
 */
export function gotoSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
}
