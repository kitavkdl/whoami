import { ContentProtect } from "@/components/ContentProtect";
import { Chrome } from "@/components/site/Chrome";
import { Editable } from "@/components/site/Editable";
import { EditableBlocks } from "@/components/site/EditableBlocks";
import { LangToggle } from "@/components/site/LangToggle";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useContent, type Entry } from "@/lib/content";
import { useCopy } from "@/lib/copy";
import { useEdit } from "@/lib/edit";
import { entryPath, joinTags, notePath } from "@/lib/site-data";
import { HOME_PATH, LangContext, notesHref, useLang, type Lang } from "@/lib/i18n";
import { emit } from "@/lib/bus";

function Rule() {
  return <hr aria-hidden className="mt-12 border-0 border-t border-rule" />;
}

function Neighbour({ entry, side }: { entry: Entry; side: "prev" | "next" }) {
  const lang = useLang();

  return (
    <a
      href={notesHref(entry.id, lang)}
      className={
        "group/nav block max-w-[48%] no-underline " + (side === "next" ? "ml-auto text-right" : "")
      }
    >
      <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-soft/60">
        {side === "prev" ? "←" : "→"}
      </span>
      <span className="mt-1 block text-[15px] leading-snug text-soft group-hover/nav:text-mark">
        {entry.title}
      </span>
    </a>
  );
}

function Page({ id }: { id: string }) {
  const content = useContent();
  const copy = useCopy();
  const lang = useLang();
  const { editing } = useEdit();

  const index = content.allEntries.findIndex((item) => item.id === id);
  const entry = content.allEntries[index];

  // The route already turned an unknown slug into a 404; this is the case
  // where the slug was real and edit mode has since taken the entry out.
  if (!entry) {
    return (
      <main className="mx-auto max-w-[40rem] px-6 py-24">
        <h1 className="text-[2rem] font-medium leading-none">{copy.notFound.title}</h1>
        <p className="mt-4 text-soft">{copy.notFound.body}</p>
        <p className="mt-6">
          <a href={HOME_PATH[lang]} className="underline">
            {copy.notFound.back}
          </a>
        </p>
      </main>
    );
  }

  const previous = content.allEntries[index - 1];
  const next = content.allEntries[index + 1];

  return (
    <>
      <ContentProtect />
      <Chrome />

      <div className="mx-auto w-full max-w-[44rem] px-6 pb-24">
        <div className="flex items-center gap-3 pt-8" data-print="hide">
          <a
            href={HOME_PATH[lang]}
            className="font-sans text-[12.5px] text-soft no-underline hover:text-mark"
          >
            ← {copy.notes.back}
          </a>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => emit("edit:toggle")}
              className={
                "rounded-[3px] px-[10px] py-[5px] font-sans text-[12.5px] transition-colors duration-200 " +
                (editing
                  ? "bg-ink text-paper hover:bg-mark"
                  : "border border-rule text-soft hover:border-mark/50 hover:text-mark")
              }
            >
              {editing ? copy.edit.buttonOn : copy.edit.button}
            </button>
            <LangToggle hrefFor={(code) => notesHref(entry.id, code)} />
            <ThemeToggle />
          </div>
        </div>

        <header className="mt-10">
          <Editable
            as="p"
            path={entryPath(entry.id, "when")}
            className="tnum font-sans text-[13px] leading-6 text-soft"
          >
            {entry.when}
          </Editable>

          <h1 className="mt-2 text-[2rem] font-medium leading-[1.15] tracking-[-0.01em]">
            <Editable path={entryPath(entry.id, "title")}>{entry.title}</Editable>
          </h1>

          {(entry.where || editing) && (
            <Editable
              as="p"
              path={entryPath(entry.id, "where")}
              placeholder={copy.edit.parts.where}
              className="mt-2 text-[17px] leading-[1.5] text-soft"
            >
              {entry.where ?? ""}
            </Editable>
          )}

          {(entry.altName || editing) && (
            <Editable
              as="p"
              path={entryPath(entry.id, "altName")}
              placeholder={copy.edit.parts.altName}
              className="mt-1 font-sans text-[13px] leading-6 text-soft/80"
            >
              {entry.altName ?? ""}
            </Editable>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {editing ? (
              <Editable
                as="p"
                path={entryPath(entry.id, "tags")}
                placeholder="TypeScript, React"
                className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft"
              >
                {joinTags(entry.tags)}
              </Editable>
            ) : (
              entry.tags.length > 0 && (
                <ul className="flex flex-wrap gap-[6px]">
                  {entry.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[2px] border border-rule px-[6px] py-[1px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )
            )}

            {entry.href && (
              <a
                href={entry.href}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-[12.5px] text-soft underline decoration-rule underline-offset-[3px] hover:text-mark"
              >
                {entry.href.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
              </a>
            )}
          </div>
        </header>

        <Rule />

        {/* The same paragraphs the front page carries, editable from here too. */}
        <section className="mt-8">
          <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
            {copy.notes.alsoOn}
          </h2>
          <EditableBlocks
            path={entryPath(entry.id, "body")}
            paragraphs={entry.body}
            className="mt-4 text-soft"
            itemClassName="mt-3 first:mt-0"
          />
        </section>

        <Rule />

        <section className="mt-8">
          <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
            {copy.notes.heading}
          </h2>

          {(entry.note.lede || editing) && (
            <Editable
              as="p"
              path={notePath(entry.id, "lede")}
              placeholder={copy.edit.parts.lede}
              className="mt-4 text-[19px] leading-[1.55]"
            >
              {entry.note.lede}
            </Editable>
          )}

          <EditableBlocks
            path={notePath(entry.id, "body")}
            paragraphs={entry.note.body}
            className="mt-5"
            itemClassName="mt-4 first:mt-0"
            empty={copy.notes.empty}
          />

          {editing && (
            <p className="mt-4 font-sans text-[11.5px] leading-5 text-soft/70">{copy.notes.hint}</p>
          )}
        </section>

        <nav className="mt-16 flex items-start justify-between gap-6 border-t border-rule pt-6">
          {previous ? <Neighbour entry={previous} side="prev" /> : <span />}
          {next ? <Neighbour entry={next} side="next" /> : <span />}
        </nav>
      </div>
    </>
  );
}

/**
 * The page behind one entry. Same content file as the front page, same edit
 * mode, same publish — this is where the long version of an entry is written,
 * and the front page keeps the short one.
 */
export function NotePage({ id, lang }: { id: string; lang: Lang }) {
  return (
    <LangContext.Provider value={lang}>
      <Page id={id} />
    </LangContext.Provider>
  );
}
