import { useNavigate } from "@tanstack/react-router";
import { HOME_PATH, LANGS, placeToKeep, useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/copy";

const SHORT = { en: "EN", ko: "KO" } as const;

/**
 * Each language is a URL, so this is a pair of real links — crawlers and a
 * middle click both get what they expect. The click is intercepted only to
 * keep the reader's place: switching language halfway down the page and
 * landing back at the masthead is the sort of thing that stops people trying
 * the other language at all.
 */
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const copy = useCopy();
  const navigate = useNavigate();

  return (
    <div
      role="group"
      aria-label={copy.language}
      className={
        "inline-flex h-8 items-center overflow-hidden rounded-[3px] border border-rule " + className
      }
    >
      {LANGS.map((code) => {
        const current = code === lang;
        return (
          <a
            key={code}
            href={HOME_PATH[code]}
            hrefLang={code}
            aria-current={current ? "true" : undefined}
            onClick={(event) => {
              if (current) {
                event.preventDefault();
                return;
              }
              // Let the browser have modified clicks: new tab, new window.
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

              event.preventDefault();
              void navigate({ to: HOME_PATH[code], hash: placeToKeep() });
            }}
            className={
              "px-[9px] py-[5px] font-mono text-[10.5px] tracking-[0.06em] no-underline transition-colors duration-200 " +
              (current ? "bg-panel-2 text-ink" : "text-soft hover:bg-panel hover:text-mark")
            }
          >
            {SHORT[code]}
          </a>
        );
      })}
    </div>
  );
}
