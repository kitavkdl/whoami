import { useEffect, useState } from "react";

/**
 * Detects low-power / low-spec devices so heavy effects can be skipped.
 * Triggers on: prefers-reduced-motion, coarse pointer (touch), low CPU
 * cores (<4), low device memory (<4GB), or small viewports.
 */
export function useLowPower(): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;
    const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    setLow(reduced || coarse || small || cores < 4 || mem < 4);
  }, []);

  return low;
}
