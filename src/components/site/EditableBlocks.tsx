import { useEffect, useRef, useState } from "react";

import { saveBlocks, useEditing } from "@/lib/edit";
import { joinParagraphs } from "@/lib/site-data";
import { useLang } from "@/lib/i18n";
import { emit } from "@/lib/bus";
import { useCopy } from "@/lib/copy";

type Props = {
  /** The path of the whole list, not of one paragraph. See lib/site-data. */
  path: string;
  paragraphs: readonly string[];
  className?: string;
  itemClassName?: string;
  /** Shown instead of the list when there is nothing in it and nobody editing. */
  empty?: string;
};

function caretToEnd(node: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * A run of paragraphs that can gain and lose one, not just change words.
 *
 * The whole list is stored under a single path rather than one path per
 * paragraph, because the alternative — indexed keys — cannot say that a
 * paragraph was inserted in the middle: every key after it would quietly come
 * to mean a different paragraph than the one it was written against.
 *
 * A paragraph being typed for the first time has nowhere to live yet, so it is
 * held here, in `blank`, until it has something in it. Everything else is read
 * straight from the content and written straight back on blur.
 */
export function EditableBlocks({
  path,
  paragraphs,
  className = "",
  itemClassName = "",
  empty,
}: Props) {
  const editing = useEditing();
  const lang = useLang();
  const copy = useCopy();

  /** Paragraphs that exist on screen but not yet in the content. */
  const [blank, setBlank] = useState(0);
  const [focusAt, setFocusAt] = useState<number | null>(null);
  const host = useRef<HTMLDivElement>(null);

  // Locking the page mid-write should not leave an empty paragraph behind.
  useEffect(() => {
    if (!editing) setBlank(0);
  }, [editing]);

  useEffect(() => {
    if (focusAt === null) return;
    setFocusAt(null);
    const node = host.current?.querySelectorAll<HTMLElement>("[data-block]")[focusAt];
    if (node) {
      node.focus({ preventScroll: true });
      caretToEnd(node);
    }
  }, [focusAt, paragraphs.length, blank]);

  const commit = (next: string[]): boolean => {
    const cleaned = next.map((text) => text.replace(/\s+/g, " ").trim()).filter(Boolean);
    const saved = saveBlocks(lang, path, joinParagraphs(cleaned), joinParagraphs(paragraphs));
    if (saved) emit("toast", copy.edit.saved);
    return saved;
  };

  if (!editing) {
    if (paragraphs.length === 0) {
      return empty ? <p className={`${className} text-soft/60`}>{empty}</p> : null;
    }
    return (
      <div className={className}>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={itemClassName}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  const rendered = [...paragraphs, ...Array<string>(blank).fill("")];

  return (
    <div className={className} ref={host}>
      {rendered.map((paragraph, i) => (
        <div key={`${i}-${paragraph.slice(0, 12)}`} className="group/block relative">
          <p
            data-block
            className={
              itemClassName +
              (paragraph
                ? ""
                : " min-h-[1.6em] text-soft/50 before:content-[attr(data-placeholder)]")
            }
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label={`${path}.${i}`}
            spellCheck={false}
            data-placeholder={paragraph ? undefined : "…"}
            onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
              const node = event.currentTarget;
              const text = node.textContent ?? "";

              if (event.key === "Enter") {
                event.preventDefault();
                const next = [...rendered];
                next[i] = text;
                // Committing first means the new paragraph is appended to a
                // list that already holds whatever was just typed into this one.
                const kept = next.map((p) => p.trim()).filter(Boolean);
                commit(next);
                setBlank(0);
                setFocusAt(kept.length);
                setBlank(1);
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                node.textContent = paragraph;
                node.blur();
                return;
              }

              // Backspace at the top of an empty paragraph removes it, the way
              // it would in any editor, rather than doing nothing at all.
              if (event.key === "Backspace" && !text.trim() && rendered.length > 1) {
                event.preventDefault();
                if (i >= paragraphs.length) setBlank((n) => Math.max(0, n - 1));
                else commit(rendered.filter((_, k) => k !== i));
                setFocusAt(Math.max(0, i - 1));
              }
            }}
            onBlur={(event: React.FocusEvent<HTMLElement>) => {
              const node = event.currentTarget;
              const text = node.textContent ?? "";
              const next = [...rendered];
              next[i] = text;

              if (i >= paragraphs.length) setBlank(0);
              if (!commit(next)) node.textContent = paragraph;
            }}
          >
            {paragraph}
          </p>

          {paragraph && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={`${copy.blocks.remove} — ${copy.edit.parts.paragraph(i + 1)}`}
              onMouseDown={(event) => {
                // mousedown, not click: the blur that a click would fire first
                // re-commits the paragraph this is about to remove.
                event.preventDefault();
                commit(rendered.filter((_, k) => k !== i));
              }}
              className="absolute -left-6 top-[0.35em] hidden font-sans text-[11px] text-soft/50 hover:text-mark group-hover/block:block"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setBlank(1);
          setFocusAt(paragraphs.length);
        }}
        className="mt-2 rounded-[3px] border border-dashed border-rule px-[9px] py-[3px] font-sans text-[11.5px] text-soft/70 transition-colors duration-200 hover:border-mark/50 hover:text-mark"
      >
        + {copy.blocks.addParagraph}
      </button>
    </div>
  );
}
