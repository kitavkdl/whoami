/**
 * Two languages, one page.
 *
 * Each language is its own URL rather than a client-side switch, so the
 * server always renders the language that was asked for. A stored preference
 * read after hydration would mean every Korean reader watches the page arrive
 * in English and then change under them.
 */

import { createContext, useContext } from "react";

export type Lang = "en" | "ko";

export const LANGS = ["en", "ko"] as const;

/** A value that exists in both languages. */
export type L<T = string> = Record<Lang, T>;

/** The route each language lives at. */
export const HOME_PATH: L = { en: "/", ko: "/ko" };

/** What goes in <html lang>, and in hreflang. */
export const HTML_LANG: L = { en: "en", ko: "ko" };

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "ko" : "en";
}

/**
 * Reads the language out of a URL, for code that only has the URL. The front
 * page carries it in the path; /study carries it in a search param, because
 * there is one page there rather than two.
 */
export function langFromLocation(pathname: string, search?: Record<string, unknown>): Lang {
  if (pathname === HOME_PATH.ko || pathname.startsWith(`${HOME_PATH.ko}/`)) return "ko";
  if (pathname.startsWith("/study")) return search?.lang === "en" ? "en" : "ko";
  return "en";
}

/**
 * The section the reader is looking at, so a language switch puts them back
 * where they were rather than at the masthead. Read off the DOM because the
 * scroll spy lives in the page and both switch paths sit outside it.
 */
export function placeToKeep(): string | undefined {
  if (typeof document === "undefined" || window.scrollY <= 8) return undefined;
  return document.querySelector<HTMLElement>("[data-section-active]")?.dataset.sectionActive;
}

export const LangContext = createContext<Lang>("en");

export function useLang(): Lang {
  return useContext(LangContext);
}
