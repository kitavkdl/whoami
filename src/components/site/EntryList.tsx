import { Editable } from "@/components/site/Editable";
import type { Entry } from "@/lib/content";
import { bodyPath, entryPath } from "@/lib/edit";
import { highlightProps, useHighlight } from "@/lib/highlight";

function Tag({ children }: { children: string }) {
  return (
    <li className="rounded-[2px] border border-rule px-[6px] py-[1px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft transition-colors duration-200 group-hover:border-mark/35 group-hover:text-mark/90">
      {children}
    </li>
  );
}

export function EntryList({ items }: { items: Entry[] }) {
  const highlight = useHighlight();

  return (
    <ul className="space-y-10">
      {items.map((entry, i) => (
        <li
          key={entry.id}
          id={`entry-${entry.id}`}
          data-reveal
          style={{ "--reveal-delay": i * 70 } as React.CSSProperties}
          className="group relative -ml-4 pl-4 transition-opacity duration-300 data-[hot='0']:opacity-45 sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7"
          {...highlightProps(entry.id, highlight)}
        >
          <span
            aria-hidden
            className="absolute bottom-1 left-0 top-1 w-px origin-top scale-y-0 bg-mark/60 transition-transform duration-300 ease-out group-hover:scale-y-100"
          />

          <Editable
            as="p"
            path={entryPath(entry.id, "when")}
            className="tnum self-start font-sans text-[13px] leading-6 text-soft sm:pt-[5px]"
          >
            {entry.when}
          </Editable>

          <div>
            <h3 className="text-[19px] font-medium leading-snug">
              {entry.href ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  data-print-url={entry.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  className="no-underline decoration-mark/40 hover:underline"
                >
                  <Editable path={entryPath(entry.id, "title")}>{entry.title}</Editable>
                  <span
                    aria-hidden
                    className="ml-[3px] inline-block text-[13px] text-soft/70 transition-transform duration-200 group-hover:translate-x-[2px]"
                  >
                    ↗
                  </span>
                </a>
              ) : (
                <Editable path={entryPath(entry.id, "title")}>{entry.title}</Editable>
              )}
              {entry.where && (
                <span className="font-normal text-soft">
                  {" · "}
                  <Editable path={entryPath(entry.id, "where")}>{entry.where}</Editable>
                </span>
              )}
            </h3>

            {entry.altName && (
              <Editable
                as="p"
                path={entryPath(entry.id, "altName")}
                className="mt-1 font-sans text-[13px] leading-6 text-soft"
              >
                {entry.altName}
              </Editable>
            )}

            {entry.body.map((paragraph, k) => (
              <Editable as="p" key={k} path={bodyPath(entry.id, k)} className="mt-3">
                {paragraph}
              </Editable>
            ))}

            {entry.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-[6px]" data-print="hide">
                {entry.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
