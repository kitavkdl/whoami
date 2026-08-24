import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { sectionIds, useContent } from "@/lib/content";
import { useCopy } from "@/lib/copy";
import { HOME_PATH, LANGS, useLang, type Lang } from "@/lib/i18n";
import { formatPath, getRoot, lookup, renderTree, resolvePath, walk, type VDir } from "@/lib/vfs";
import { gotoSection } from "@/lib/nav";
import { readPref, readResolved, setThemePref, type ThemePref } from "@/lib/theme";
import { emit, on } from "@/lib/bus";
import { fuzzyMatch } from "@/lib/fuzzy";

type Tone = "in" | "out" | "dim" | "ok" | "err" | "accent";
type Line = { id: number; tone: Tone; text: string };

const PATH_COMMANDS = new Set(["ls", "cd", "cat"]);
const OPEN_TARGETS = ["site", "study", "email"];
const THEME_VALUES: ThemePref[] = ["light", "dark", "system"];

const TONE_CLASS: Record<Tone, string> = {
  in: "text-term-fg",
  out: "text-term-fg",
  dim: "text-term-dim",
  ok: "text-term-ok",
  err: "text-term-err",
  accent: "text-term-accent",
};

function commonPrefix(values: string[]): string {
  if (values.length === 0) return "";

  let prefix = values[0];
  for (const value of values.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i++;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

function pad(value: string, width: number) {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

export function Console() {
  const { profile, sections } = useContent();
  const copy = useCopy();
  const lang = useLang();
  const navigate = useNavigate();
  const root = getRoot(lang);

  const banner = useMemo<Line[]>(
    () => [
      ...copy.console.banner.map((text, i) => ({
        id: -(copy.console.banner.length - i) - 1,
        tone: (i === 0 ? "accent" : "dim") as Tone,
        text,
      })),
      { id: -1, tone: "out" as Tone, text: "" },
    ],
    [copy],
  );

  const [lines, setLines] = useState<Line[]>(banner);
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [cwd, setCwd] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [idle, setIdle] = useState(true);

  const history = useRef<string[]>([]);
  const historyAt = useRef<number | null>(null);
  const draft = useRef("");
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const print = useCallback((entries: { tone: Tone; text: string }[]) => {
    setLines((prev) => [...prev, ...entries.map((entry) => ({ ...entry, id: nextId.current++ }))]);
  }, []);

  const out = useCallback(
    (text: string | string[], tone: Tone = "out") => {
      const list = Array.isArray(text) ? text : [text];
      print(list.map((line) => ({ tone, text: line })));
    },
    [print],
  );

  /** Keeps the caret solid while keys are landing, blinking once they stop. */
  const touch = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 650);
  }, []);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const focus = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const dirAt = useCallback(
    (segments: string[]): VDir | null => {
      const node = lookup(root, segments);
      return node && node.type === "dir" ? node : null;
    },
    [root],
  );

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      out(`${formatPath(cwd)} $ ${raw}`, "in");
      if (!input) return;

      history.current = [...history.current.filter((h) => h !== input), input];
      historyAt.current = null;

      const [command, ...args] = input.split(/\s+/);
      const arg = args.join(" ");

      switch (command) {
        case "help": {
          const commands = copy.console.commands;
          const width = Math.max(...Object.keys(commands).map((k) => k.length)) + 3;
          out(
            Object.entries(commands).map(([name, note]) => `${pad(name, width)}${note}`),
            "out",
          );
          out(["", copy.console.helpFooter], "dim");
          break;
        }

        case "ls": {
          const target = resolvePath(cwd, arg || ".");
          const dir = dirAt(target);
          if (!dir) {
            const node = lookup(root, target);
            if (node) out(node.name, "out");
            else out(copy.console.lsMissing(arg || "."), "err");
            break;
          }
          const width = Math.max(...dir.children.map((c) => c.name.length)) + 4;
          out(
            dir.children.map((child) => pad(child.name + (child.type === "dir" ? "/" : ""), width)),
            "out",
          );
          break;
        }

        case "cd": {
          const target = resolvePath(cwd, arg || "/");
          if (!dirAt(target)) {
            out(copy.console.cdNotDir(arg), "err");
            break;
          }
          setCwd(target);
          break;
        }

        case "pwd":
          out(formatPath(cwd), "out");
          break;

        case "cat": {
          if (!arg) {
            out(copy.console.catWhich, "err");
            break;
          }
          const node = lookup(root, resolvePath(cwd, arg));
          if (!node) out(copy.console.catMissing(arg), "err");
          else if (node.type === "dir") out(copy.console.catIsDir(arg), "err");
          else out(node.content.split("\n"), "out");
          break;
        }

        case "tree":
          out([".", ...renderTree(root)], "out");
          break;

        case "grep": {
          if (!arg) {
            out(copy.console.grepNeed, "err");
            break;
          }
          const needle = arg.toLowerCase();
          const hits: string[] = [];

          for (const path of walk(root)) {
            const node = lookup(root, path.split("/"));
            if (!node || node.type !== "file") continue;

            node.content.split("\n").forEach((line, i) => {
              if (line.toLowerCase().includes(needle)) {
                hits.push(`${path}:${i + 1}: ${line.trim()}`);
              }
            });
          }

          if (hits.length === 0) out(copy.console.grepNone(arg), "dim");
          else {
            out(hits.slice(0, 40), "out");
            if (hits.length > 40) out(copy.console.grepMore(hits.length - 40), "dim");
          }
          break;
        }

        case "whoami":
          out([`${profile.name} · ${profile.hangul}`, profile.location, "", profile.lede], "out");
          break;

        case "date":
          out(
            new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-GB", {
              timeZone: profile.timeZone,
              dateStyle: "full",
              timeStyle: "medium",
            }).format(new Date()) + " (KST)",
            "out",
          );
          break;

        case "open": {
          const target = arg || "site";
          if (target === "site") {
            window.open(profile.site.href, "_blank", "noopener,noreferrer");
            out(copy.console.opening(profile.site.href), "ok");
          } else if (target === "study") {
            window.open(`/study?lang=${lang}`, "_blank", "noopener,noreferrer");
            out(copy.console.opening(`/study?lang=${lang}`), "ok");
          } else if (target === "email") {
            window.location.href = `mailto:${profile.email}`;
            out(`mailto:${profile.email}`, "ok");
          } else {
            out(copy.console.openUnknown(target, OPEN_TARGETS.join(", ")), "err");
          }
          break;
        }

        case "email":
          navigator.clipboard
            ?.writeText(profile.email)
            .then(() => {
              out(copy.console.copied(profile.email), "ok");
              emit("toast", copy.masthead.emailCopied);
            })
            .catch(() => out(profile.email, "out"));
          break;

        case "theme": {
          if (!arg) {
            out(copy.console.themeIs(readPref(), readResolved()), "out");
            break;
          }
          if (!THEME_VALUES.includes(arg as ThemePref)) {
            out(copy.console.themePick(THEME_VALUES.join(", ")), "err");
            break;
          }
          setThemePref(arg as ThemePref);
          out(copy.console.themeSet(arg), "ok");
          break;
        }

        case "lang": {
          if (!arg) {
            out(lang, "out");
            break;
          }
          if (!LANGS.includes(arg as Lang)) {
            out(copy.console.langPick(LANGS.join(", ")), "err");
            break;
          }
          // A language is a URL here, so this is a navigation, not a setting.
          void navigate({ to: HOME_PATH[arg as Lang], hash: "console" });
          break;
        }

        case "goto": {
          const match = sections.find((s) => s.id === arg.toLowerCase());
          if (!match) {
            out(copy.console.gotoTry(sectionIds.join(", ")), "err");
            break;
          }
          gotoSection(match.id);
          out(`→ ${match.label}`, "ok");
          break;
        }

        case "neofetch": {
          const seconds = Math.max(1, Math.round((Date.now() - mountedAt.current) / 1000));
          const uptime = copy.console.uptime(seconds);

          const facts = [
            [
              "host",
              `${profile.name.toLowerCase().replace(" ", "-")} · ${profile.location.split(",")[0]}`,
            ],
            ["uptime", uptime],
            ["display", `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`],
            ["threads", `${navigator.hardwareConcurrency ?? "?"}`],
            ["theme", `${readResolved()} (${readPref()})`],
            ["lang", lang],
            ["stack", "TanStack Start · React 19 · Tailwind 4"],
            ["console", "hand-written, no terminal library"],
          ];

          const art = ["████████", "   ██   ", "   ██   ", "   ██   ", "██ ██   ", "████    "];

          const rows = Math.max(art.length, facts.length);
          const body: string[] = [];
          for (let i = 0; i < rows; i++) {
            const left = pad(art[i] ?? "", 12);
            const fact = facts[i];
            body.push(fact ? `${left}${pad(fact[0], 10)}${fact[1]}` : left);
          }
          out(body, "out");
          break;
        }

        case "resume":
          out(copy.console.resume, "ok");
          setTimeout(() => window.print(), 120);
          break;

        case "history":
          out(
            history.current.map((entry, i) => `${pad(String(i + 1), 5)}${entry}`),
            "out",
          );
          break;

        case "echo":
          out(arg, "out");
          break;

        case "clear":
          setLines([]);
          break;

        default: {
          const guess = Object.keys(copy.console.commands)
            .map((name) => ({ name, match: fuzzyMatch(command, name) }))
            .filter((c) => c.match)
            .sort((a, b) => b.match!.score - a.match!.score)[0];

          out(copy.console.notACommand(command, guess?.name), "err");
        }
      }
    },
    [copy, cwd, dirAt, lang, navigate, out, profile, root, sections],
  );

  /** Tab completion over commands, paths, and the fixed argument lists. */
  const complete = useCallback(() => {
    const head = value.slice(0, caret);
    const tail = value.slice(caret);
    const tokens = head.split(/(?<=\s)/);
    const last = tokens[tokens.length - 1] ?? "";
    const prefixText = head.slice(0, head.length - last.length);
    const isFirst = prefixText.trim() === "";
    const command = value.trim().split(/\s+/)[0];

    let candidates: string[] = [];

    if (isFirst) {
      candidates = Object.keys(copy.console.commands).filter((name) => name.startsWith(last));
    } else if (PATH_COMMANDS.has(command)) {
      const slash = last.lastIndexOf("/");
      const dirText = slash === -1 ? "" : last.slice(0, slash + 1);
      const baseText = slash === -1 ? last : last.slice(slash + 1);
      const dir = dirAt(resolvePath(cwd, dirText || "."));
      if (!dir) return;

      candidates = dir.children
        .filter((child) => child.name.startsWith(baseText))
        .map((child) => dirText + child.name + (child.type === "dir" ? "/" : ""));
    } else if (command === "theme") {
      candidates = THEME_VALUES.filter((v) => v.startsWith(last));
    } else if (command === "open") {
      candidates = OPEN_TARGETS.filter((v) => v.startsWith(last));
    } else if (command === "lang") {
      candidates = LANGS.filter((v) => v.startsWith(last));
    } else if (command === "goto") {
      candidates = sectionIds.filter((v) => v.startsWith(last));
    }

    if (candidates.length === 0) return;

    const filled = candidates.length === 1 ? candidates[0] : commonPrefix(candidates);

    if (filled.length > last.length) {
      // A settled completion gets a trailing space so the next word can start,
      // except on a directory, where you almost always want to keep descending.
      const settled = candidates.length === 1 && !filled.endsWith("/");
      const next = prefixText + filled + (settled ? " " : "");
      setValue(next + tail);
      const at = next.length;
      setCaret(at);
      requestAnimationFrame(() => inputRef.current?.setSelectionRange(at, at));
    } else if (candidates.length > 1) {
      out(`${formatPath(cwd)} $ ${value}`, "in");
      out(candidates.join("   "), "dim");
    }
  }, [caret, copy, cwd, dirAt, out, value]);

  const recall = useCallback(
    (direction: -1 | 1) => {
      const entries = history.current;
      if (entries.length === 0) return;

      let index = historyAt.current;
      if (index === null) {
        if (direction === 1) return;
        draft.current = value;
        index = entries.length - 1;
      } else {
        index += direction;
      }

      if (index >= entries.length) {
        historyAt.current = null;
        setValue(draft.current);
        setCaret(draft.current.length);
        return;
      }

      index = Math.max(0, index);
      historyAt.current = index;
      setValue(entries[index]);
      setCaret(entries[index].length);
    },
    [value],
  );

  useEffect(() => {
    const offFocus = on("console:focus", () => {
      gotoSection("console");
      setTimeout(focus, 320);
    });
    const offRun = on("console:run", (command) => {
      gotoSection("console");
      setTimeout(() => {
        run(command);
        setValue("");
        setCaret(0);
        focus();
      }, 320);
    });
    return () => {
      offFocus();
      offRun();
    };
  }, [focus, run]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    touch();

    if (event.key === "Enter") {
      event.preventDefault();
      run(value);
      setValue("");
      setCaret(0);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      complete();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      recall(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      recall(1);
      return;
    }

    if (event.key === "Escape") {
      inputRef.current?.blur();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setLines([]);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "u") {
      event.preventDefault();
      setValue("");
      setCaret(0);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      out(`${formatPath(cwd)} $ ${value}^C`, "dim");
      setValue("");
      setCaret(0);
    }
  };

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? 0);
  const prompt = `${formatPath(cwd)} $ `;

  return (
    <div
      data-allow-copy
      className="overflow-hidden rounded-[4px] border border-term-rule bg-term-bg font-mono text-[12.5px] leading-[1.65] shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_40px_-32px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-term-rule px-3 py-[7px]">
        <span className="truncate text-term-dim">
          <span className="text-term-accent">jiyul</span>
          <span className="text-term-dim">@songdo</span>
          <span className="text-term-dim">:{formatPath(cwd)}</span>
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11px] text-term-dim sm:inline">
            {copy.console.tabCompletes}
          </span>
          <button
            type="button"
            onClick={() => {
              setLines([]);
              focus();
            }}
            className="text-[11px] text-term-dim transition-colors hover:text-term-accent"
          >
            {copy.console.clear}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={(event) => {
          // Let people select output; only steal focus on a plain click.
          if (event.detail > 1) return;
          if (window.getSelection()?.toString()) return;
          requestAnimationFrame(focus);
        }}
        className="scroll-thin h-[21rem] cursor-text overflow-y-auto px-3 py-3"
      >
        <div role="log" aria-live="polite" aria-label={copy.console.outputLabel}>
          {lines.map((line) => (
            <div
              key={line.id}
              className={"whitespace-pre-wrap break-words " + TONE_CLASS[line.tone]}
            >
              {line.text || " "}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="whitespace-pre-wrap break-words text-term-fg" aria-hidden>
            <span className="text-term-accent">{prompt}</span>
            <span>{value.slice(0, caret)}</span>
            <span
              className="caret"
              data-idle={idle && focused ? "1" : "0"}
              data-blur={focused ? "0" : "1"}
            >
              {value[caret] ?? " "}
            </span>
            <span>{value.slice(caret + 1)}</span>
          </div>

          <input
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setCaret(event.target.selectionStart ?? event.target.value.length);
              historyAt.current = null;
              touch();
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onClick={syncCaret}
            onSelect={syncCaret}
            onFocus={() => {
              setFocused(true);
              touch();
            }}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label={copy.console.inputLabel}
            className="absolute inset-0 w-full resize-none border-0 bg-transparent p-0 text-transparent caret-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
