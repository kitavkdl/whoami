import { useEffect, useMemo, useRef, useState } from "react";
import { allEntries, profile, sections } from "@/lib/content";
import { fuzzyMatch, segment } from "@/lib/fuzzy";
import { gotoSection } from "@/lib/nav";
import { nextPref, readPref, setThemePref } from "@/lib/theme";
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

function buildIndex(): Item[] {
  const items: Item[] = [];

  for (const section of sections) {
    items.push({
      id: `section:${section.id}`,
      label: section.label,
      hint: "section",
      group: "Sections",
      keywords: `${section.id} jump scroll`,
      run: () => gotoSection(section.id),
    });
  }

  for (const entry of allEntries) {
    items.push({
      id: `entry:${entry.id}`,
      label: entry.title,
      hint: entry.when,
      group: "Work",
      keywords: `${entry.id} ${entry.hangul ?? ""} ${entry.where ?? ""} ${entry.tags.join(" ")}`,
      run: () => {
        const el = document.getElementById(`entry-${entry.id}`);
        if (!el) return;
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
      label: "Switch theme",
      hint: "system · light · dark",
      group: "Actions",
      keywords: "dark light mode colour color appearance",
      run: () => setThemePref(nextPref(readPref())),
    },
    {
      id: "action:copy-email",
      label: "Copy email address",
      hint: profile.email,
      group: "Actions",
      keywords: "clipboard contact mail reach",
      run: () => {
        navigator.clipboard
          ?.writeText(profile.email)
          .then(() => emit("toast", "Email copied"))
          .catch(() => emit("toast", profile.email));
      },
    },
    {
      id: "action:console",
      label: "Jump to the console",
      hint: "and start typing",
      group: "Actions",
      keywords: "terminal shell repl command prompt",
      run: () => emit("console:focus"),
    },
    {
      id: "action:neofetch",
      label: "Run neofetch",
      hint: "in the console",
      group: "Actions",
      keywords: "terminal system info specs",
      run: () => emit("console:run", "neofetch"),
    },
    {
      id: "action:print",
      label: "Print as a resume",
      hint: "the layout changes for paper",
      group: "Actions",
      keywords: "pdf cv save paper export",
      run: () => window.print(),
    },
    {
      id: "action:shortcuts",
      label: "Keyboard shortcuts",
      hint: "?",
      group: "Actions",
      keywords: "keys help hotkeys bindings",
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
      label: "오늘의 학점 운세",
      hint: "/study",
      group: "Elsewhere",
      keywords: "study fortune grade korean toy",
      run: () => window.open("/study", "_blank", "noopener,noreferrer"),
    },
    {
      id: "link:email",
      label: "Write an email",
      hint: profile.email,
      group: "Elsewhere",
      keywords: "contact mailto message",
      run: () => {
        window.location.href = `mailto:${profile.email}`;
      },
    },
  );

  return items;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const index = useMemo(buildIndex, []);
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
            placeholder="Jump to anything"
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
              Nothing matches “{query}”.
            </p>
          )}

          {grouped.map(({ group, items }) => (
            <div key={group} className="mb-1">
              <p className="px-4 pb-1 pt-2 font-sans text-[10.5px] font-medium uppercase tracking-[0.12em] text-soft/70">
                {group}
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
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span className="ml-auto tnum">{flat.length} results</span>
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
