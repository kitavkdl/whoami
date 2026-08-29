import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { EntryImage } from "@/lib/content";
import { useCopy } from "@/lib/copy";

/**
 * One photograph, full size, over the page.
 *
 * Rendered into the body rather than into the entry it belongs to: an entry
 * dims itself while a different one is hovered, and a picture being looked at
 * should not dim with it.
 */
function Lightbox({
  image,
  at,
  count,
  onClose,
  onStep,
}: {
  image: EntryImage;
  at: number;
  count: number;
  onClose: () => void;
  onStep: (step: number) => void;
}) {
  const copy = useCopy();

  useEffect(() => {
    // Caught on the way down so the page shortcuts underneath — print, theme,
    // section stepping — do not fire while something is covering them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.stopPropagation();
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") onStep(1);
      else if (event.key === "ArrowLeft") onStep(-1);
    };

    const root = document.documentElement;
    const held = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      root.style.overflow = held;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose, onStep]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      data-print="hide"
      onClick={onClose}
      className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-4 bg-paper/95 p-6 backdrop-blur-[2px] sm:p-10"
    >
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-[78vh] max-w-full rounded-[3px] border border-rule object-contain shadow-[0_24px_60px_-34px_rgba(0,0,0,0.65)]"
      />
      <p className="max-w-[38rem] text-center font-sans text-[12.5px] leading-5 text-soft">
        {image.alt}
        {count > 1 && (
          <span className="tnum text-soft/60">
            {" · "}
            {at + 1}/{count}
          </span>
        )}
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-soft/55">
          {" · "}
          {copy.photoDismiss}
        </span>
      </p>
    </div>,
    document.body,
  );
}

/**
 * The photographs behind an entry.
 *
 * Small at rest, so a section still reads as a column of text that happens to
 * have pictures under it rather than as a gallery. Full size when one is asked
 * for, and gone from print, where the page is a resume again.
 */
export function EntryPhotos({ images }: { images: EntryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by: number) => setOpen((at) => (at === null ? at : (at + by + count) % count)),
    [count],
  );

  if (count === 0) return null;

  return (
    <>
      <ul className="mt-5 flex flex-wrap gap-2" data-print="hide">
        {images.map((image, i) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={image.alt}
              className="group/photo block overflow-hidden rounded-[2px] border border-rule bg-panel transition-colors duration-200 hover:border-mark/45"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: image.focus === "top" ? "50% 12%" : "50% 50%" }}
                className="h-[86px] w-[129px] object-cover opacity-[0.94] saturate-[0.82] transition duration-300 group-hover/photo:scale-[1.03] group-hover/photo:opacity-100 group-hover/photo:saturate-100 sm:h-[98px] sm:w-[147px]"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && typeof document !== "undefined" && (
        <Lightbox image={images[open]} at={open} count={count} onClose={close} onStep={step} />
      )}
    </>
  );
}
