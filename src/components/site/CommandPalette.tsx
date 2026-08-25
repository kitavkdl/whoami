import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useContent, type SiteContent } from "@/lib/content";
import { useCopy, type Copy } from "@/lib/copy";
import { HOME_PATH, notesHref, otherLang, placeToKeep, useLang, type Lang } from "@/lib/i18n";
import { fuzzyMatch, segment } from "@/lib/fuzzy";
import { gotoSection } from "@/lib/nav";
import { emit, on } from "@/lib/bus";

type Group = "Sections" | "Work" | "Actions" | "Elsewhere";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: Group;
  keywords: string;
  run: () => void;
};

const GROUP_ORDER: Group[] = ["Sections", "Work", "Actions", "Elsewhere"];

type Scored = Item & { indices?: number[]; score: number };

/**
 * Keywords are matched but never shown, so they carry the terms a reader might
 * reach for that are not in the visible label — including, in either language,
 * the other language's words. Someone searching "dark" on the Korean page
 * should still land on 테마 바꾸기.
 */
function buildIndex(content: SiteContent, copy: Copy, lang: Lang, goOtherLang: () => void): Item[] {
  const items: Item[] = [];
  const { profile, sections, allEntries } = content;

  for (const section of sections) {
    items.push({
      id: `section:${section.id}`,
      label: section.label,
      hint: copy.palette.sectionHint,
      group: "Sections",
      keywords: `${section.id} jump scroll 이동 섹션`,
      run: () => gotoSection(section.id),
    });
  }

  for (const entry of allEntries) {
    items.push({
      id: `entry:${entry.id}`,
      label: entry.title,
      hint: entry.when,
      group: "Work",
      keywords: `${entry.id} ${entry.altName ?? ""} ${entry.where ?? ""} ${entry.tags.join(" ")}`,
      run: () => {
        // On the front page the entry is already here, so go to it. Anywhere
        // else — a notes page, say — the entry means its own page.
        const el = document.getElementById(`entry-${entry.id}`);
        if (!el) {
          window.location.href = notesHref(entry.id, lang);
          return;
        }
        el.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "center",
        });
      },
    });
  }

  items.push(
    {
      id: "action:theme",
      label: copy.palette.theme,
      hint: copy.palette.themeHint,
      group: "Actions",
      keywords: "dark light mode colour color appearance 테마 다크 라이트",
      // Through the bus rather than straight to lib/theme, so the cycle and
      // the confirmation it prints stay owned by one component.
      run: () => emit("theme:cycle", undefined),
    },
    {
      id: "action:lang",
      label: copy.palette.switchLanguage,
      hint: copy.palette.switchLanguageHint,
      group: "Actions",
      keywords: `language 언어 한국어 english korean ${otherLang(lang)}`,
      run: goOtherLang,
    },
    {
      id: "action:copy-email",
      label: copy.palette.copyEmail,
      hint: profile.email,
      group: "Actions",
      keywords: "clipboard contact mail reach 메일 이메일 복사",
      run: () => {
        navigator.clipboard
          ?.writeText(profile.email)
          .then(() => emit("toast", copy.masthead.emailCopied))
          .catch(() => emit("toast", profile.email));
      },
    },
    {
      id: "action:console",
      label: copy.palette.toConsole,
      hint: copy.palette.toConsoleHint,
      group: "Actions",
      keywords: "terminal shell repl command prompt 콘솔 터미널",
      run: () => emit("console:focus"),
    },
    {
      id: "action:neofetch",
      label: copy.palette.neofetch,
      hint: copy.palette.neofetchHint,
      group: "Actions",
      keywords: "terminal system info specs",
      run: () => emit("console:run", "neofetch"),
    },
    {
      id: "action:print",
      label: copy.palette.print,
      hint: copy.palette.printHint,
      group: "Actions",
      keywords: "pdf cv save paper export 인쇄 이력서",
      run: () => window.print(),
    },
    {
      id: "action:shortcuts",
      label: copy.palette.shortcuts,
      hint: "?",
      group: "Actions",
      keywords: "keys help hotkeys bindings 단축키",
      run: () => emit("shortcuts:toggle"),
    },
    {
      id: "link:site",
      label: profile.site.label,
      hint: "SeekOnce",
      group: "Elsewhere",
      keywords: "seekonce website product",
      run: () => window.open(profile.site.href, "_blank", "noopener,noreferrer"),
    },
    {
      id: "link:study",
      label: copy.palette.study,
      hint: "/study",
      group: "Elsewhere",
      keywords: "study fortune grade korean toy 학점 운세",
      run: () => window.open(`/study?lang=${lang}`, "_blank", "noopener,noreferrer"),
    },
    {
      id: "link:email",
      label: copy.palette.writeEmail,
      hint: profile.email,
      group: "Elsewhere",
      keywords: "contact mailto message 메일",
      run: () => {
        window.location.href = `mailto:${profile.email}`;
      },
    },
  );

  return items;
}

export function CommandPalette() {
  const content = useContent();
  const copy = useCopy();
  const lang = useLang();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const index = useMemo(
    () =>
      buildIndex(content, copy, lang, () => {
        void navigate({ to: HOME_PATH[otherLang(lang)], hash: placeToKeep() });
      }),
    [content, copy, lang, navigate],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const results = useMemo<Scored[]>(() => {
    if (!query.trim()) return index.map((item) => ({ ...item, score: 0 }));

    return index
      .map((item) => {
        // Scored separately: a hit in the visible label keeps its highlight,
        // while a hit in the hidden keywords is scored on its own string so it
        // is not punished for sitting far along a concatenated blob. The flat
        // penalty is what keeps label matches ahead of keyword ones.
        const onLabel = fuzzyMatch(query, item.label);
        const onKeywords = fuzzyMatch(query, item.keywords);

        const candidates: { score: number; indices: number[] }[] = [];
        if (onLabel) candidates.push(onLabel);
        if (onKeywords) candidates.push({ score: onKeywords.score - 6, indices: [] });

        const best = candidates.sort((a, b) => b.score - a.score)[0];
        return best ? { item, score: best.score, indices: best.indices } : null;
      })
      .filter((hit): hit is { item: Item; score: number; indices: number[] } => hit !== null)
      .sort((a, b) => b.score - a.score)
      .map((hit) => ({ ...hit.item, indices: hit.indices, score: hit.score }));
  }, [index, query]);

  const grouped = useMemo(() => {
    const map = new Map<Group, Scored[]>();
    for (const item of results) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }

    const present = GROUP_ORDER.filter((g) => map.has(g));
    if (!query.trim()) return present.map((g) => ({ group: g, items: map.get(g)! }));

    // While searching, a group is only as interesting as its best hit —
    // otherwise a fixed group order would bury the thing you typed for.
    return present
      .sort((a, b) => (map.get(b)![0]?.score ?? 0) - (map.get(a)![0]?.score ?? 0))
      .map((g) => ({ group: g, items: map.get(g)! }));
  }, [results, query]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    const offOpen = on("palette:open", () => setOpen(true));
    const offClose = on("palette:close", () => setOpen(false));
    return () => {
      offOpen();
      offClose();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setCursor(0);

    const body = document.body;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    // Focus now, then again next frame in case the browser hands it elsewhere
    // while the overlay is still settling.
    inputRef.current?.focus();
    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPad;
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="1"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [cursor, open, query]);

  if (!open) return null;

  const move = (delta: number) => {
    if (flat.length === 0) return;
    setCursor((c) => (c + delta + flat.length) % flat.length);
  };

  const choose = (item: Item) => {
    setOpen(false);
    // Let the overlay unmount and give focus back before the action moves the
    // page, otherwise the scroll lock fights the jump.
    requestAnimationFrame(() => item.run());
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        setCursor(0);
        break;
      case "End":
        event.preventDefault();
        setCursor(Math.max(0, flat.length - 1));
        break;
      case "Tab":
        // Nothing else in here is focusable; keep the ring inside the dialog.
        event.preventDefault();
        move(event.shiftKey ? -1 : 1);
        break;
      case "Enter": {
        event.preventDefault();
        const item = flat[cursor];
        if (item) choose(item);
        break;
      }
    }
  };

  let running = -1;

  return (
    <div
      data-print="hide"
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
        style={{ animation: "fade-in 140ms ease-out both" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-[32rem] overflow-hidden rounded-[6px] border border-rule bg-panel shadow-[0_24px_70px_-30px_rgba(0,0,0,0.6)]"
        style={{ animation: "palette-in 180ms cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <span aria-hidden className="font-mono text-[13px] text-mark">
            ›
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.palette.placeholder}
            aria-label="Search"
            aria-controls="palette-list"
            aria-activedescendant={flat[cursor] ? `palette-${flat[cursor].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-[13px] font-sans text-[14px] text-ink outline-none placeholder:text-soft/70"
          />
          <kbd className="hidden shrink-0 rounded-[3px] border border-rule px-[5px] py-[1px] font-mono text-[10px] text-soft sm:block">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id="palette-list"
          role="listbox"
          aria-label="Results"
          className="scroll-thin max-h-[46vh] overflow-y-auto py-2"
        >
          {flat.length === 0 && (
            <p className="px-4 py-6 text-center font-sans text-[13px] text-soft">
              {copy.palette.empty(query)}
            </p>
          )}

          {grouped.map(({ group, items }) => (
            <div key={group} className="mb-1">
              <p className="px-4 pb-1 pt-2 font-sans text-[10.5px] font-medium uppercase tracking-[0.12em] text-soft/70">
                {copy.palette.groups[group]}
              </p>

              {items.map((item) => {
                running += 1;
                const active = running === cursor;
                const parts = segment(item.label, item.indices ?? []);

                return (
                  <div
                    key={item.id}
                    id={`palette-${item.id}`}
                    role="option"
                    aria-selected={active}
                    data-active={active ? "1" : "0"}
                    onMouseMove={(
                      (at) => () =>
                        setCursor(at)
                    )(running)}
                    onClick={() => choose(item)}
                    className={
                      "flex cursor-pointer items-baseline gap-3 px-4 py-[7px] font-sans text-[13.5px] " +
                      (active ? "bg-panel-2 text-ink" : "text-ink/85")
                    }
                  >
                    <span
                      aria-hidden
                      className={
                        "w-[3px] shrink-0 self-stretch rounded-full " +
                        (active ? "bg-mark" : "bg-transparent")
                      }
                    />
                    <span className="truncate">
                      {parts.map((part, i) =>
                        part.hit ? (
                          <span key={i} className="font-semibold text-mark">
                            {part.text}
                          </span>
                        ) : (
                          <span key={i}>{part.text}</span>
                        ),
                      )}
                    </span>
                    {item.hint && (
                      <span className="ml-auto shrink-0 truncate font-mono text-[11px] text-soft/80">
                        {item.hint}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-rule px-4 py-2 font-mono text-[10.5px] text-soft/80">
          <span>{copy.palette.move}</span>
          <span>{copy.palette.open}</span>
          <span className="ml-auto tnum">{copy.palette.results(flat.length)}</span>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes palette-in {
          from { opacity: 0; transform: translate3d(0, -6px, 0) scale(0.985) }
          to { opacity: 1; transform: none }
        }
      `}</style>
    </div>
  );
}
