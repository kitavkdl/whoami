import { useEffect, useRef, useState } from "react";

type Line = { kind: "in" | "out" | "err" | "info"; text: string };

const PROJECTS = [
  "P/01  B2B Export Infra        · Founder · 2025",
  "P/02  Odoo Operations         · PM · DX Tech",
  "P/03  BADA Admissions         · Developer · 2023~24",
  "P/04  Internal Tools          · Always shipping",
];

const SKILLS = [
  "01 TypeScript / core    02 Next.js / frame    03 React / ui",
  "04 Supabase / data      05 PostgreSQL / db    06 Node / runtime",
  "07 PHP / legacy         08 Tailwind / style   09 Odoo / ops",
];

const ABOUT =
  "Systems-oriented developer building digitized operational platforms · end-to-end workflow architecture, data modeling, and production deployment.";

const HELP = [
  "available commands:",
  "  whoami           //identity",
  "  ls projects      //list selected works",
  "  cat about.txt    //about summary",
  "  cat skills.txt   //stack",
  "  contact          //email & phone",
  "  clear            //reset output",
  "  help             //this menu",
];

function run(cmd: string): Line[] {
  const c = cmd.trim();
  if (!c) return [];
  const lower = c.toLowerCase();

  switch (lower) {
    case "whoami":
      return [{ kind: "out", text: "jiyul.ahn · Systems Developer · Founder" }];
    case "ls projects":
      return PROJECTS.map((t) => ({ kind: "out" as const, text: t }));
    case "cat about.txt":
      return [{ kind: "out", text: ABOUT }];
    case "cat skills.txt":
      return SKILLS.map((t) => ({ kind: "out" as const, text: t }));
    case "contact":
      return [
        { kind: "out", text: "email: jiyul.ahn@stonybrook.edu" },
        { kind: "out", text: "phone: +82 10 8685 9042" },
      ];
    case "help":
      return HELP.map((t) => ({ kind: "info" as const, text: t }));
    default:
      return [{ kind: "err", text: `command not found: ${c}` }];
  }
}

export function Terminal() {
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { kind: "info", text: "ja-term v.2026.05 · type 'help' to list commands" },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const submit = () => {
    const cmd = value;
    if (!cmd.trim()) return;
    if (cmd.trim().toLowerCase() === "clear") {
      setLines([]);
      setHistory((h) => [...h, cmd]);
      setHIdx(-1);
      setValue("");
      return;
    }
    setLines((prev) => [
      ...prev,
      { kind: "in", text: cmd },
      ...run(cmd),
    ]);
    setHistory((h) => [...h, cmd]);
    setHIdx(-1);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(next);
      setValue(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || hIdx < 0) return;
      const next = hIdx + 1;
      if (next >= history.length) {
        setHIdx(-1);
        setValue("");
      } else {
        setHIdx(next);
        setValue(history[next] ?? "");
      }
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-sm border border-accent/40 bg-background/80 font-mono text-[12px] shadow-[0_0_30px_-15px_var(--color-accent)] backdrop-blur"
      onClick={() => inputRef.current?.focus()}
    >
      {/* chrome */}
      <div className="flex items-center justify-between border-b border-accent/30 bg-surface/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent/80" />
          <span className="h-2 w-2 rounded-full bg-accent/40" />
          <span className="h-2 w-2 rounded-full bg-accent/20" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          ja-term ▸ /home/jiyul
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent">●</span>
      </div>

      {/* output */}
      <div
        ref={outRef}
        className="h-56 overflow-y-auto p-3 leading-relaxed text-foreground/85"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "in"
                ? "text-accent"
                : l.kind === "err"
                  ? "text-red-400"
                  : l.kind === "info"
                    ? "text-muted-foreground"
                    : "text-foreground/85"
            }
          >
            {l.kind === "in" ? `▸ ${l.text}` : l.text}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-accent/30 bg-surface/60 px-3 py-2">
        <span className="text-accent">▸</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          aria-label="terminal input"
          placeholder="type 'help'"
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <span className="h-3 w-1.5 animate-blink bg-accent" />
      </div>
    </div>
  );
}
