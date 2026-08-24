import { useEffect, useRef } from "react";
import { sectionIds } from "@/lib/content";
import { gotoSection } from "@/lib/nav";
import { emit } from "@/lib/bus";

/** g-prefixed jumps, vim-style. */
const GOTO: Record<string, string> = {
  n: "now",
  o: "overlap",
  b: "before",
  a: "awards",
  t: "tools",
  s: "school",
  c: "contact",
  k: "console",
};

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
}

/** Steps to the next or previous section relative to the top of the viewport. */
function step(direction: 1 | -1) {
  type Position = { id: string; top: number };

  const positions = sectionIds
    .map((id): Position | null => {
      const el = document.getElementById(id);
      return el ? { id, top: el.getBoundingClientRect().top } : null;
    })
    .filter((p): p is Position => p !== null);

  if (positions.length === 0) return;

  const target =
    direction === 1
      ? positions.find((p) => p.top > 12)
      : [...positions].reverse().find((p) => p.top < -12);

  if (target) gotoSection(target.id);
  else if (direction === -1) window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * One listener for every shortcut on the page. Keys are ignored while the
 * reader is typing somewhere, apart from the palette binding, which should
 * work from inside the console too.
 */
export function KeyboardLayer() {
  const pendingG = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        emit("palette:open");
        return;
      }

      if (meta || event.altKey) return;
      if (isTyping(event.target)) return;

      if (pendingG.current) {
        clearTimeout(pendingG.current);
        pendingG.current = undefined;

        if (event.key === "h") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          history.replaceState(null, "", location.pathname);
          return;
        }

        const id = GOTO[event.key];
        if (id) {
          event.preventDefault();
          gotoSection(id);
          return;
        }
      }

      switch (event.key) {
        case "g":
          pendingG.current = setTimeout(() => {
            pendingG.current = undefined;
          }, 1200);
          break;
        case "/":
          event.preventDefault();
          emit("palette:open");
          break;
        case "?":
          event.preventDefault();
          emit("shortcuts:toggle");
          break;
        case "t":
          event.preventDefault();
          emit("theme:cycle", undefined);
          break;
        case "p":
          event.preventDefault();
          window.print();
          break;
        case "j":
          event.preventDefault();
          step(1);
          break;
        case "k":
          event.preventDefault();
          step(-1);
          break;
        case "Escape":
          emit("palette:close");
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(pendingG.current);
    };
  }, []);

  return null;
}
