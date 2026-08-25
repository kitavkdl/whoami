/**
 * Per-language document head.
 *
 * Both routes carry the same page in a different language, so each one points
 * at the other with hreflang and names itself as canonical. Without that a
 * crawler reads them as duplicates and picks one.
 */

import { getCopy } from "@/lib/copy";
import { HOME_PATH, HTML_LANG, LANGS, otherLang, type Lang } from "@/lib/i18n";

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
