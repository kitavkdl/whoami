import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: profile.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: profile.timeZone,
  hour: "numeric",
  hourCycle: "h23",
});

/** Minutes east of UTC for a named zone, read out of the formatter itself. */
function zoneOffset(timeZone: string, at: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(at);

    const raw = parts.find((p) => p.type === "timeZoneName")?.value;
    const match = raw?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return null;

    const sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
  } catch {
    return null;
  }
}

function mood(hour: number): string {
  if (hour < 3) return "still up, apparently";
  if (hour < 6) return "asleep, one would hope";
  if (hour < 9) return "morning here";
  if (hour < 12) return "at the desk";
  if (hour < 14) return "lunch, probably";
  if (hour < 18) return "at the desk";
  if (hour < 22) return "evening here";
  return "still up, apparently";
}

function useSongdoTime() {
  const [state, setState] = useState<{
    time: string;
    mood: string;
    lead: number | null;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      const nowDate = new Date();
      const there = zoneOffset(profile.timeZone, nowDate);
      const here = -nowDate.getTimezoneOffset();

      setState({
        time: timeFormat.format(nowDate),
        mood: mood(Number(hourFormat.format(nowDate))),
        lead: there === null ? null : Math.round((there - here) / 60),
      });
    };

    tick();
    // Line the interval up with the next whole second so the digits change
    // when the reader's own clock does.
    const align = 1000 - (Date.now() % 1000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 1000);
    }, align);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return state;
}

/**
 * Live local time in Songdo, plus how far ahead of the reader that is. Renders
 * a fixed-width placeholder on the server so hydration has nothing to argue
 * with and the line never reflows.
 */
export function LocalClock() {
  const state = useSongdoTime();

  return (
    <p className="font-sans text-[12.5px] leading-5 text-soft" suppressHydrationWarning>
      <span
        className="mr-2 inline-block size-[6px] translate-y-[-1px] rounded-full"
        style={{ background: state ? "var(--mark)" : "var(--rule)" }}
        aria-hidden
      />
      <span className="tnum">{state?.time ?? "--:--:--"}</span> in Songdo
      {state ? <span className="text-soft/80"> · {state.mood}</span> : null}
      {state && state.lead !== null && state.lead !== 0 ? (
        <span className="text-soft/70">
          {" "}
          · {Math.abs(state.lead)}h {state.lead > 0 ? "ahead of" : "behind"} you
        </span>
      ) : null}
    </p>
  );
}
