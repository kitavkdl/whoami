import { createContext, useContext } from "react";

export type Highlight = {
  hot: string | null;
  setHot: (id: string | null) => void;
};

export const HighlightContext = createContext<Highlight>({
  hot: null,
  setHot: () => {},
});

export function useHighlight() {
  return useContext(HighlightContext);
}

/** Props that make any element participate in the cross-highlight. */
export function highlightProps(id: string, { hot, setHot }: Highlight) {
  return {
    "data-hot": hot === id ? "1" : hot ? "0" : undefined,
    onPointerEnter: () => setHot(id),
    onPointerLeave: () => setHot(null),
    onFocus: () => setHot(id),
    onBlur: () => setHot(null),
  } as const;
}
