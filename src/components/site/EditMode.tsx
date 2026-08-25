import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useContent, type SiteContent } from "@/lib/content";
import { useCopy, type Copy } from "@/lib/copy";
import {
  clearLog,
  describePath,
  hasSessionPasscode,
  InsecureContextError,
  lock,
  pendingCount,
  publish,
  resetAll,
  toggleEditing,
  unlock,
  useEdit,
  type LogEntry,
} from "@/lib/edit";
import { useLang, type Lang } from "@/lib/i18n";
import { emit, on } from "@/lib/bus";

const LOCALE: Record<Lang, string> = { en: "en-US", ko: "ko-KR" };

/** The shell both popups sit in — the shortcut sheet's, in smaller print. */
function Sheet({
  title,
  onClose,
  width,
  children,
}: {
  title: string;
  onClose: () => void;
  width: string;
  children: ReactNode;
}) {
  const copy = useCopy();
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey, true);
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div
      data-print="hide"
      className="fixed inset-0 z-[75] flex items-center justify-center px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          "relative max-h-[80vh] w-full overflow-y-auto rounded-[6px] border border-rule bg-panel p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.6)] " +
          width
        }
        style={{ animation: "sheet-in 180ms cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-[12px] text-soft underline-offset-4 hover:text-mark hover:underline"
          >
            {copy.edit.close}
          </button>
        </div>

        {children}
      </div>

      <style>{`
        @keyframes sheet-in {
          from { opacity: 0; transform: translate3d(0, 8px, 0) scale(0.99) }
          to { opacity: 1; transform: none }
        }
        @keyframes gate-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0) }
          30%, 70% { transform: translate3d(3px, 0, 0) }
          50% { transform: translate3d(-4px, 0, 0) }
        }
      `}</style>
    </div>
  );
}

function SmallButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-[3px] border border-rule px-[9px] py-[4px] font-sans text-[12px] text-soft transition-colors duration-200 hover:border-mark/50 hover:text-mark"
    >
      {children}
    </button>
  );
}

/**
 * The passcode.
 *
 * The check is a key derivation rather than a comparison, so it takes about a
 * second of the browser's time on purpose — long enough to say so while it
 * runs, and long enough that guessing at it in bulk is not worth anyone's
 * afternoon. See lib/edit.
 */
function Gate({ onClose }: { onClose: () => void }) {
  const copy = useCopy();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"" | "wrong" | "insecure">("");

  return (
    <Sheet title={copy.edit.gateTitle} onClose={onClose} width="max-w-[22rem]">
      <p className="mt-4 font-sans text-[13px] leading-6 text-soft">{copy.edit.gateBody}</p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");

          void unlock(value)
            .then((ok) => {
              if (ok) {
                emit("toast", copy.edit.unlocked);
                onClose();
                return;
              }
              setError("wrong");
              setValue("");
            })
            .catch((cause: unknown) => {
              setError(cause instanceof InsecureContextError ? "insecure" : "wrong");
            })
            .finally(() => setBusy(false));
        }}
      >
        <label
          className="font-sans text-[11px] uppercase tracking-[0.14em] text-soft"
          htmlFor="edit-passcode"
        >
          {copy.edit.passcode}
        </label>
        {/*
          No inputMode hint and no autocomplete: the field says nothing about
          what the passcode is made of, to the browser or to anyone reading
          over the markup.
        */}
        <input
          id="edit-passcode"
          data-autofocus
          type="password"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          aria-invalid={error === "wrong" || undefined}
          className="mt-2 block w-full rounded-[3px] border border-rule bg-paper px-3 py-2 font-mono text-[15px] tracking-[0.3em] text-ink outline-none focus:border-mark disabled:opacity-60"
          style={error === "wrong" ? { animation: "gate-shake 320ms both" } : undefined}
        />

        <p aria-live="polite" className="mt-2 min-h-[1.25rem] font-sans text-[12px] text-mark">
          {error === "wrong" ? copy.edit.wrong : error === "insecure" ? copy.edit.insecure : ""}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-[3px] bg-ink px-[10px] py-[5px] font-sans text-[12.5px] text-paper transition-colors duration-200 hover:bg-mark disabled:opacity-60"
          >
            {busy ? copy.edit.checking : copy.edit.unlock}
          </button>
          <SmallButton onClick={onClose}>{copy.edit.cancel}</SmallButton>
        </div>
      </form>

      <p className="mt-5 border-t border-rule pt-3 font-sans text-[11.5px] leading-5 text-soft/75">
        {copy.edit.local}
      </p>
    </Sheet>
  );
}

/**
 * Publishing.
 *
 * Everything up to here happened in this browser. This is the one control that
 * reaches the repository, so it says what it is about to do, asks for the
 * passcode again when the page has been reloaded since the unlock, and reports
 * back with the commit rather than a shrug.
 */
function PublishSheet({ onClose }: { onClose: () => void }) {
  const copy = useCopy();
  const { drafts, published, publishing } = useEdit();

  const count = useMemo(() => pendingCount(drafts, published), [drafts, published]);
  const [needsPasscode] = useState(() => !hasSessionPasscode());
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const blocked = publishing || count === 0 || (needsPasscode && !passcode.trim());

  return (
    <Sheet title={copy.edit.publishTitle} onClose={onClose} width="max-w-[26rem]">
      <p className="mt-4 font-sans text-[13px] leading-6 text-soft">{copy.edit.publishBody}</p>

      <p className="mt-3 font-sans text-[12.5px] text-ink">
        {count === 0 ? copy.edit.publishNothing : copy.edit.pending(count)}
      </p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (blocked) return;
          setError("");

          void publish(message, needsPasscode ? passcode : undefined).then((result) => {
            if (result.ok) {
              emit("toast", copy.edit.publishedToast(result.count));
              onClose();
              return;
            }
            setError(copy.edit.errors[result.reason]);
          });
        }}
      >
        {needsPasscode && (
          <div className="mb-4">
            <label
              className="font-sans text-[11px] uppercase tracking-[0.14em] text-soft"
              htmlFor="publish-passcode"
            >
              {copy.edit.passcode}
            </label>
            <input
              id="publish-passcode"
              data-autofocus
              type="password"
              autoComplete="off"
              spellCheck={false}
              disabled={publishing}
              value={passcode}
              onChange={(event) => {
                setPasscode(event.target.value);
                setError("");
              }}
              className="mt-2 block w-full rounded-[3px] border border-rule bg-paper px-3 py-2 font-mono text-[15px] tracking-[0.3em] text-ink outline-none focus:border-mark disabled:opacity-60"
            />
            <p className="mt-2 font-sans text-[11.5px] text-soft/75">{copy.edit.needPasscode}</p>
          </div>
        )}

        <label
          className="font-sans text-[11px] uppercase tracking-[0.14em] text-soft"
          htmlFor="publish-message"
        >
          {copy.edit.message}
        </label>
        <input
          id="publish-message"
          data-autofocus={needsPasscode ? undefined : true}
          type="text"
          maxLength={72}
          autoComplete="off"
          disabled={publishing}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 block w-full rounded-[3px] border border-rule bg-paper px-3 py-2 font-sans text-[13px] text-ink outline-none focus:border-mark disabled:opacity-60"
        />
        <p className="mt-2 font-sans text-[11.5px] text-soft/75">{copy.edit.messageHint}</p>

        <p aria-live="polite" className="mt-3 min-h-[1.25rem] font-sans text-[12px] text-mark">
          {error}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="submit"
            disabled={blocked}
            className="rounded-[3px] bg-ink px-[10px] py-[5px] font-sans text-[12.5px] text-paper transition-colors duration-200 hover:bg-mark disabled:opacity-50"
          >
            {publishing ? copy.edit.publishing : copy.edit.publish}
          </button>
          <SmallButton onClick={onClose}>{copy.edit.cancel}</SmallButton>
        </div>
      </form>

      <p className="mt-5 border-t border-rule pt-3 font-sans text-[11.5px] leading-5 text-soft/75">
        {copy.edit.publishNote}
      </p>
    </Sheet>
  );
}

type Row = { entry: LogEntry; place: string; part: string };

function groupByDay(
  log: readonly LogEntry[],
  content: SiteContent,
  copy: Copy,
  lang: Lang,
): { day: string; rows: Row[] }[] {
  const day = new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: "full" });
  const out: { day: string; rows: Row[] }[] = [];

  // Newest first, which is the order the question "what changed?" is asked in.
  for (const entry of [...log].reverse()) {
    const label = day.format(entry.at);
    const described =
      entry.kind === "publish"
        ? { place: copy.edit.publishTitle, part: copy.edit.changed(entry.count ?? 0) }
        : describePath(entry.kind === "reset" ? "" : entry.path, content, copy);
    const row = { entry, ...described };
    const last = out[out.length - 1];
    if (last?.day === label) last.rows.push(row);
    else out.push({ day: label, rows: [row] });
  }

  return out;
}

/**
 * The history. Every entry says when it happened, where on the page, and which
 * part — and nothing else. The words themselves were never written down, which
 * is the point rather than an omission.
 */
function History({ onClose }: { onClose: () => void }) {
  const copy = useCopy();
  const lang = useLang();
  const content = useContent();
  const { log } = useEdit();

  const time = useMemo(
    () => new Intl.DateTimeFormat(LOCALE[lang], { hour: "2-digit", minute: "2-digit" }),
    [lang],
  );
  const days = useMemo(() => groupByDay(log, content, copy, lang), [log, content, copy, lang]);

  return (
    <Sheet title={copy.edit.historyTitle} onClose={onClose} width="max-w-[32rem]">
      <p className="mt-4 font-sans text-[12.5px] leading-6 text-soft">{copy.edit.historyLead}</p>

      {log.length === 0 ? (
        <p className="mt-6 font-sans text-[13px] text-soft/75">{copy.edit.historyEmpty}</p>
      ) : (
        <div className="mt-6">
          {days.map((group) => (
            <div key={group.day} className="mt-5 first:mt-0">
              <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-soft/70">
                {group.day}
              </p>

              <ol className="relative mt-3 border-l border-rule pl-5">
                {group.rows.map(({ entry, place, part }) => (
                  <li key={entry.id} className="relative pb-4 last:pb-0">
                    <span
                      aria-hidden
                      className={
                        "absolute -left-[23px] top-[7px] size-[7px] rounded-full border " +
                        (entry.kind === "edit"
                          ? "border-mark bg-mark/70"
                          : entry.kind === "publish"
                            ? "border-mark bg-mark"
                            : "border-mark bg-paper")
                      }
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-[2px]">
                      <time
                        dateTime={new Date(entry.at).toISOString()}
                        className="tnum font-sans text-[12px] text-soft"
                      >
                        {time.format(entry.at)}
                      </time>
                      <span className="font-sans text-[13px] text-ink">{place}</span>
                      <span className="rounded-[2px] border border-rule px-[6px] py-[1px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-soft">
                        {part}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-rule pt-4">
        <p className="font-sans text-[11.5px] text-soft/75">{copy.edit.edits(log.length)}</p>
        {log.length > 0 && (
          <SmallButton
            onClick={() => {
              clearLog();
              emit("toast", copy.edit.clearLogDone);
            }}
          >
            {copy.edit.clearLog}
          </SmallButton>
        )}
      </div>
    </Sheet>
  );
}

/** Sits in the corner for as long as the page is unlocked. */
function Bar({ onHistory, onPublish }: { onHistory: () => void; onPublish: () => void }) {
  const copy = useCopy();
  const lang = useLang();
  const { editing, drafts, published, publishing } = useEdit();
  const changed = useMemo(() => pendingCount(drafts, published), [drafts, published]);

  return (
    <div
      data-print="hide"
      className="fixed bottom-4 left-4 z-[60] max-w-[min(22rem,calc(100vw-2rem))] rounded-[5px] border border-rule bg-panel/95 p-3 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.75)] backdrop-blur-md"
      style={{ animation: "sheet-in 200ms cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
    >
      <p className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.14em] text-soft">
        <span
          aria-hidden
          className={
            "size-[6px] rounded-full " +
            (editing ? "bg-mark" : "border border-soft/60 bg-transparent")
          }
        />
        {copy.edit.barTitle}
        {changed > 0 && (
          <span className="tnum ml-auto normal-case tracking-normal text-soft/70">
            {copy.edit.changed(changed)}
          </span>
        )}
      </p>

      <p className="mt-2 font-sans text-[12px] leading-5 text-soft/85">
        {editing ? copy.edit.hint : copy.edit.paused}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/*
          The only control here that leaves the browser, so it is the only one
          that looks like a commitment rather than a toggle.
        */}
        <button
          type="button"
          disabled={changed === 0 || publishing}
          onClick={onPublish}
          className="rounded-[3px] bg-ink px-[10px] py-[4px] font-sans text-[12px] text-paper transition-colors duration-200 hover:bg-mark disabled:opacity-40"
        >
          {publishing ? copy.edit.publishing : copy.edit.publish}
        </button>
        <SmallButton
          onClick={() => {
            toggleEditing();
            emit("toast", editing ? copy.edit.paused : copy.edit.resumed);
          }}
        >
          {editing ? copy.edit.pause : copy.edit.resume}
        </SmallButton>
        <SmallButton onClick={onHistory}>{copy.edit.history}</SmallButton>
        <SmallButton
          onClick={() =>
            emit("toast", resetAll(lang) ? copy.edit.resetDone : copy.edit.resetNothing)
          }
        >
          {copy.edit.reset}
        </SmallButton>
        <SmallButton
          onClick={() => {
            lock();
            emit("toast", copy.edit.lockedToast);
          }}
        >
          {copy.edit.lock}
        </SmallButton>
      </div>

      {published && (
        <p className="mt-3 border-t border-rule pt-2 font-sans text-[11.5px] leading-5 text-soft/70">
          {copy.edit.deploying}
          <br />
          {copy.edit.lastPublished} · {copy.edit.changed(published.count)}
          {published.url && (
            <>
              {" · "}
              <a
                href={published.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-rule underline-offset-[3px] hover:text-mark"
              >
                {published.sha || copy.edit.viewCommit}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Edit mode's furniture: the passcode, the corner bar, and the log. The button
 * that starts all of it lives in the masthead and speaks through the bus, the
 * same way the theme and the palette do.
 */
export function EditMode() {
  const copy = useCopy();
  const { unlocked, editing } = useEdit();
  const [gate, setGate] = useState(false);
  const [history, setHistory] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(
    () =>
      on("edit:toggle", () => {
        if (!unlocked) {
          setGate(true);
          return;
        }
        toggleEditing();
        emit("toast", editing ? copy.edit.paused : copy.edit.resumed);
      }),
    [unlocked, editing, copy],
  );

  useEffect(() => on("edit:history", () => setHistory(true)), []);

  useEffect(() => on("edit:publish", () => setPublishOpen(true)), []);

  // A locked page has no log to show: the buttons that open these are on the bar.
  useEffect(() => {
    if (!unlocked) {
      setHistory(false);
      setPublishOpen(false);
    }
  }, [unlocked]);

  return (
    <>
      {unlocked && (
        <Bar onHistory={() => setHistory(true)} onPublish={() => setPublishOpen(true)} />
      )}
      {gate && <Gate onClose={() => setGate(false)} />}
      {history && unlocked && <History onClose={() => setHistory(false)} />}
      {publishOpen && unlocked && <PublishSheet onClose={() => setPublishOpen(false)} />}
    </>
  );
}
