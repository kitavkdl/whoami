import { useEffect, useState } from "react";
import { profile } from "@/lib/content";
import { useCopy, type Copy } from "@/lib/copy";

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

type MoodKey = keyof Copy["clock"]["moods"];

function mood(hour: number): MoodKey {
  if (hour < 3) return "lateNight";
  if (hour < 6) return "asleep";
  if (hour < 9) return "morning";
  if (hour < 12) return "desk";
  if (hour < 14) return "lunch";
  if (hour < 18) return "desk";
  if (hour < 22) return "evening";
  return "lateNight";
}

function useLocalTime() {
  const [state, setState] = useState<{
    time: string;
    mood: MoodKey;
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
 * Live local time where he is, plus how far off the reader's own clock that
 * is. The place and the zone both come from lib/content. Renders
 * a fixed-width placeholder on the server so hydration has nothing to argue
 * with and the line never reflows.
 */
export function LocalClock() {
  const state = useLocalTime();
  const { clock } = useCopy();

  return (
    <p className="font-sans text-[12.5px] leading-5 text-soft" suppressHydrationWarning>
      <span
        className="mr-2 inline-block size-[6px] translate-y-[-1px] rounded-full"
        style={{ background: state ? "var(--mark)" : "var(--rule)" }}
        aria-hidden
      />
      {/* Korean names the place before the time, English trails it after. */}
      {clock.prefix}
      <span className="tnum">{state?.time ?? "--:--:--"}</span>
      {clock.suffix}
      {state ? <span className="text-soft/80"> · {clock.moods[state.mood]}</span> : null}
      {state && state.lead !== null && state.lead !== 0 ? (
        <span className="text-soft/70">
          {" · "}
          {state.lead > 0 ? clock.ahead(state.lead) : clock.behind(Math.abs(state.lead))}
        </span>
      ) : null}
    </p>
  );
}
