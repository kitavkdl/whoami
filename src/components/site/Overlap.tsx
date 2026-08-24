import { useEffect, useMemo, useState } from "react";
import { getContent, timelineStart, useContent, type Entry } from "@/lib/content";
import { useCopy } from "@/lib/copy";
import { highlightProps, useHighlight } from "@/lib/highlight";

/** Months since the left edge of the chart. */
function monthIndex(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  const [sy, sm] = timelineStart.split("-").map(Number);
  return (y - sy) * 12 + (m - sm);
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * The latest month any entry touches, plus one. Used for the first paint so
 * the server and the browser agree; the effect below swaps in the real month
 * once we are running somewhere that has a clock worth trusting.
 */
const fallbackNow =
  Math.max(...getContent("en").allEntries.map((e) => monthIndex(e.end ?? e.start))) + 1;

const TONE: Record<Entry["kind"], string> = {
  product: "var(--mark)",
  work: "color-mix(in oklab, var(--ink) 55%, var(--paper))",
  award: "var(--mark)",
};

export function Overlap() {
  const { allEntries } = useContent();
  const copy = useCopy();
  const highlight = useHighlight();
  const [nowIndex, setNowIndex] = useState(fallbackNow);

  useEffect(() => {
    setNowIndex(Math.max(fallbackNow, monthIndex(currentMonth())));
  }, []);

  const span = nowIndex + 4;
  const rows = useMemo(
    () =>
      [...allEntries].sort(
        (a, b) => monthIndex(a.start) - monthIndex(b.start) || a.title.localeCompare(b.title),
      ),
    [allEntries],
  );

  const pct = (months: number) => (months / span) * 100;

  const years = useMemo(() => {
    const [startYear] = timelineStart.split("-").map(Number);
    const out: { year: number; at: number }[] = [];
    for (let i = 0; i <= span; i += 12) {
      out.push({ year: startYear + i / 12, at: (i / span) * 100 });
    }
    return out;
  }, [span]);

  return (
    <figure className="m-0">
      <div
        aria-hidden
        className="relative select-none pt-1"
        style={{ height: `${rows.length * 42 + 26}px` }}
      >
        {/* Year gridlines */}
        {years.map((tick) => (
          <div
            key={tick.year}
            className="absolute bottom-6 top-0 w-px bg-rule"
            style={{ left: `${tick.at}%` }}
          />
        ))}

        {/* Today */}
        <div
          className="absolute bottom-6 top-0 w-px"
          style={{
            left: `${pct(nowIndex)}%`,
            background:
              "repeating-linear-gradient(to bottom, var(--mark) 0 3px, transparent 3px 7px)",
          }}
        />

        {rows.map((entry, i) => {
          const from = monthIndex(entry.start);
          const to = entry.end ? monthIndex(entry.end) + 1 : nowIndex;
          const ongoing = !entry.end;
          const isPoint = entry.kind === "award";
          const left = pct(from);
          const width = Math.max(pct(to - from), isPoint ? 0 : 1.2);
          // Labels sit at the head of their bar until that would push them off
          // the right edge on a narrow screen, at which point they hang off the
          // tail instead.
          const anchorRight = left > 45;

          return (
            <div
              key={entry.id}
              className="group absolute inset-x-0 h-[42px] cursor-default"
              style={{ top: `${i * 42}px` }}
              {...highlightProps(entry.id, highlight)}
            >
              <span
                className="absolute top-0 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.08em] text-soft transition-colors duration-200 group-hover:text-ink group-data-[hot='0']:text-soft/40"
                style={
                  anchorRight
                    ? { right: `${100 - left - width}%`, textAlign: "right" }
                    : { left: `${left}%` }
                }
              >
                {entry.title}
              </span>

              {isPoint ? (
                <span
                  className="absolute top-[22px] size-[9px] rotate-45 transition-transform duration-200 group-hover:scale-125"
                  style={{
                    left: `calc(${left}% - 4px)`,
                    background: TONE[entry.kind],
                  }}
                />
              ) : (
                <span
                  className="absolute top-[24px] block h-[7px] transition-[opacity,transform] duration-200 group-hover:scale-y-[1.5] group-data-[hot='0']:opacity-35"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: TONE[entry.kind],
                    transformOrigin: "center",
                    maskImage: ongoing
                      ? "linear-gradient(to right, black 78%, transparent)"
                      : undefined,
                    WebkitMaskImage: ongoing
                      ? "linear-gradient(to right, black 78%, transparent)"
                      : undefined,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Year labels */}
        {years.map((tick, i) => (
          <span
            key={tick.year}
            className="tnum absolute bottom-0 font-mono text-[10.5px] text-soft/70"
            style={{
              left: `${tick.at}%`,
              // The leftmost label would hang off the edge if it were centred
              // on its own gridline.
              transform: i === 0 ? "none" : "translateX(-50%)",
            }}
          >
            {tick.year}
          </span>
        ))}
      </div>

      <figcaption className="mt-3 font-sans text-[13px] leading-6 text-soft">
        {copy.overlapCaption}
      </figcaption>
    </figure>
  );
}
