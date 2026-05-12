import { useEffect, useRef, useState } from "react";

/**
 * Ambient sound + UI tick on hover. Off by default; user toggles.
 * Uses WebAudio so no asset file is needed.
 */
export function AmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const padRef = useRef<{ stop: () => void } | null>(null);

  // create the ambient pad
  const startPad = (ctx: AudioContext) => {
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    filter.connect(master);

    const oscs: OscillatorNode[] = [];
    [110, 164.81, 220, 277.18].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "sine" : "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      // slow LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02;
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();
      o.connect(g).connect(filter);
      o.start();
      oscs.push(o);
    });

    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.4);

    return {
      stop: () => {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        setTimeout(() => oscs.forEach((o) => o.stop()), 800);
      },
    };
  };

  // tick on hover of magnetic / link elements
  useEffect(() => {
    if (!on) return;
    const ctx = ctxRef.current!;
    const tick = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1200;
      g.gain.value = 0;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.1);
    };
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest("a, button, [data-magnetic]");
      if (t) tick();
    };
    document.addEventListener("mouseover", onOver);
    return () => document.removeEventListener("mouseover", onOver);
  }, [on]);

  const toggle = async () => {
    if (!on) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = ctxRef.current ?? new Ctor();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      padRef.current = startPad(ctx);
      setOn(true);
    } else {
      padRef.current?.stop();
      padRef.current = null;
      setOn(false);
    }
  };

  return (
    <button
      onClick={toggle}
      data-magnetic
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      className="fixed bottom-6 right-6 z-[55] flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-md transition-colors hover:text-accent md:bottom-10 md:right-10"
    >
      <span className="flex h-3 items-end gap-[2px]">
        <span className={`w-[2px] bg-accent transition-all ${on ? "h-3 animate-pulse" : "h-1"}`} />
        <span className={`w-[2px] bg-accent transition-all ${on ? "h-2 animate-pulse" : "h-1"}`} style={{ animationDelay: "0.15s" }} />
        <span className={`w-[2px] bg-accent transition-all ${on ? "h-3 animate-pulse" : "h-1"}`} style={{ animationDelay: "0.3s" }} />
      </span>
      {on ? "sound · on" : "sound · off"}
    </button>
  );
}
