import { Editable } from "@/components/site/Editable";
import { EditableBlocks } from "@/components/site/EditableBlocks";
import type { Entry } from "@/lib/content";
import { entryPath, joinTags } from "@/lib/site-data";
import { useEditing } from "@/lib/edit";
import { useCopy } from "@/lib/copy";
import { highlightProps, useHighlight } from "@/lib/highlight";

function Tag({ children }: { children: string }) {
  return (
    <li className="rounded-[2px] border border-rule px-[6px] py-[1px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft transition-colors duration-200 group-hover:border-mark/35 group-hover:text-mark/90">
      {children}
    </li>
  );
}

/**
 * The tags, as a row of chips to read and as one line to write. A chip each
 * would mean a separate path per tag, and then no way to add a fourth one.
 */
function Tags({ entry }: { entry: Entry }) {
  const editing = useEditing();

  if (editing) {
    return (
      <Editable
        as="p"
        path={entryPath(entry.id, "tags")}
        placeholder="TypeScript, React"
        className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft"
      >
        {joinTags(entry.tags)}
      </Editable>
    );
  }

  if (entry.tags.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-[6px]" data-print="hide">
      {entry.tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </ul>
  );
}

export function EntryList({ items }: { items: Entry[] }) {
  const highlight = useHighlight();
  const editing = useEditing();
  const copy = useCopy();

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
              {/*
                The title is the title. The ↗ beside it is the project's own
                site, when there is one.
              */}
              <Editable path={entryPath(entry.id, "title")}>{entry.title}</Editable>

              {entry.href && !editing && (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  data-print-url={entry.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  aria-label={entry.title}
                  className="ml-[6px] align-baseline text-[13px] text-soft/70 no-underline hover:text-mark"
                >
                  ↗
                </a>
              )}

              {(entry.where || editing) && (
                <span className="font-normal text-soft">
                  {" · "}
                  <Editable path={entryPath(entry.id, "where")} placeholder={copy.edit.parts.where}>
                    {entry.where ?? ""}
                  </Editable>
                </span>
              )}
            </h3>

            {(entry.altName || editing) && (
              <Editable
                as="p"
                path={entryPath(entry.id, "altName")}
                placeholder={copy.edit.parts.altName}
                className="mt-1 font-sans text-[13px] leading-6 text-soft"
              >
                {entry.altName ?? ""}
              </Editable>
            )}

            <EditableBlocks
              path={entryPath(entry.id, "body")}
              paragraphs={entry.body}
              itemClassName="mt-3"
            />

            <Tags entry={entry} />
          </div>
        </li>
      ))}
    </ul>
  );
}
