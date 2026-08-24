import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useContent } from "@/lib/content";
import { gotoSection } from "@/lib/nav";

const useIsomorphic = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Props = {
  active: string;
  orientation: "vertical" | "horizontal";
};

/**
 * The section index, with a single indicator element that slides between
 * entries instead of one border per item. Position and size are measured off
 * the live DOM and re-measured on resize, which keeps it honest when the font
 * loads late or the label wraps.
 */
export function SectionNav({ active, orientation }: Props) {
  const { sections } = useContent();
  const listRef = useRef<HTMLOListElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ start: number; size: number } | null>(null);
  const vertical = orientation === "vertical";

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const item = list.querySelector<HTMLElement>(`[data-nav-id="${active}"]`);
    if (!item) return;

    setRect(
      vertical
        ? { start: item.offsetTop, size: item.offsetHeight }
        : { start: item.offsetLeft, size: item.offsetWidth },
    );
  }, [active, vertical]);

  useIsomorphic(measure, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    if (document.fonts?.ready) void document.fonts.ready.then(measure);

    return () => observer.disconnect();
  }, [measure]);

  // Keep the active chip inside the visible part of the mobile strip.
  useEffect(() => {
    if (vertical) return;
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list) return;

    const item = list.querySelector<HTMLElement>(`[data-nav-id="${active}"]`);
    if (!item) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    scroller.scrollTo({
      left: item.offsetLeft - scroller.clientWidth / 2 + item.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active, vertical]);

  const indicatorStyle = rect
    ? vertical
      ? { transform: `translate3d(0, ${rect.start}px, 0)`, height: `${rect.size}px` }
      : { transform: `translate3d(${rect.start}px, 0, 0)`, width: `${rect.size}px` }
    : { opacity: 0 };

  const list = (
    <ol
      ref={listRef}
      className={
        vertical
          ? "relative flex flex-col gap-[2px]"
          : "relative flex w-max items-center gap-1 px-1"
      }
    >
      <li
        aria-hidden
        style={{
          ...indicatorStyle,
          transitionProperty: "transform, height, width, opacity",
          transitionDuration: rect ? "380ms" : "0ms",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        className={
          vertical
            ? "pointer-events-none absolute left-0 top-0 w-[2px] bg-mark"
            : "pointer-events-none absolute bottom-0 left-0 h-[2px] bg-mark"
        }
      />

      {sections.map((section) => {
        const current = section.id === active;
        return (
          <li key={section.id} data-nav-id={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={current ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                gotoSection(section.id);
              }}
              className={
                (vertical ? "block py-[5px] pl-4 pr-2 " : "block whitespace-nowrap px-3 py-3 ") +
                "font-sans text-[12.5px] no-underline transition-colors duration-200 " +
                (current ? "text-ink" : "text-soft hover:text-mark")
              }
            >
              {section.label}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (vertical) {
    return (
      <nav aria-label="Sections" className="border-l border-rule">
        {list}
      </nav>
    );
  }

  return (
    <nav aria-label="Sections" className="border-b border-rule bg-paper/85 backdrop-blur">
      <div ref={scrollerRef} className="no-bar overflow-x-auto">
        {list}
      </div>
    </nav>
  );
}
