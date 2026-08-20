import { useMemo, useState, type ReactNode } from "react";
import { HighlightContext } from "@/lib/highlight";

/**
 * Links the written entries to their bars in the overlap chart. Pointing at
 * either one lights up the other, which is the whole reason the chart is worth
 * having next to the prose.
 */
export function HighlightProvider({ children }: { children: ReactNode }) {
  const [hot, setHot] = useState<string | null>(null);
  const value = useMemo(() => ({ hot, setHot }), [hot]);

  return <HighlightContext value={value}>{children}</HighlightContext>;
}
