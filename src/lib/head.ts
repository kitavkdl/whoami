/**
 * Per-language document head.
 *
 * Both routes carry the same page in a different language, so each one points
 * at the other with hreflang and names itself as canonical. Without that a
 * crawler reads them as duplicates and picks one.
 */

import type { Entry } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import { HOME_PATH, HTML_LANG, LANGS, NOTES_ROOT, otherLang, type Lang } from "@/lib/i18n";

export function headFor(lang: Lang) {
  const copy = getCopy(lang);
  const other = otherLang(lang);

  return {
    meta: [
      { title: copy.meta.title },
      { name: "description", content: copy.meta.description },
      { property: "og:title", content: copy.meta.title },
      { property: "og:description", content: copy.meta.ogDescription },
      { property: "og:locale", content: lang === "ko" ? "ko_KR" : "en_US" },
      { property: "og:locale:alternate", content: other === "ko" ? "ko_KR" : "en_US" },
    ],
    links: [
      { rel: "canonical", href: HOME_PATH[lang] },
      ...LANGS.map((code) => ({
        rel: "alternate",
        hrefLang: HTML_LANG[code],
        href: HOME_PATH[code],
      })),
      { rel: "alternate", hrefLang: "x-default", href: HOME_PATH.en },
    ],
  };
}

/**
 * The head for one entry's page. The description is the note's opening line
 * when there is one and the entry's first paragraph otherwise, so a link
 * shared before anything has been written still says something true.
 */
export function headForNote(lang: Lang, id: string, entry?: Entry) {
  const copy = getCopy(lang);
  if (!entry) return { meta: [{ title: copy.notFound.title }] };

  const title = `${entry.title} · ${copy.meta.title}`;
  const description = entry.note.lede || entry.body[0] || copy.meta.ogDescription;
  const path = `${NOTES_ROOT}/${id}`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:locale", content: lang === "ko" ? "ko_KR" : "en_US" },
    ],
    links: [
      { rel: "canonical", href: lang === "ko" ? `${path}?lang=ko` : path },
      { rel: "alternate", hrefLang: "en", href: path },
      { rel: "alternate", hrefLang: "ko", href: `${path}?lang=ko` },
      { rel: "alternate", hrefLang: "x-default", href: path },
    ],
  };
}
