import { type ElementType } from "react";

import { saveEdit, useEditing } from "@/lib/edit";
import { useLang } from "@/lib/i18n";
import { emit } from "@/lib/bus";
import { useCopy } from "@/lib/copy";

type Props = {
  /** The content path this line came from. See lib/edit. */
  path: string;
  /** Rendered element. Anything that holds a single run of text. */
  as?: ElementType;
  className?: string;
  children: string;
};

/**
 * One line of the page, editable while edit mode is on and an ordinary element
 * the rest of the time — no wrapper, no extra attributes, nothing for a reader
 * who never unlocks it to notice.
 *
 * The text is the source of truth on the way in and the DOM is on the way out:
 * React writes the line, the browser lets it be typed into, and on blur the
 * result goes back through lib/edit, which is where the change is stored and
 * the log entry written. Nothing re-renders while the caret is in here, so
 * React is never fighting the caret for the same node.
 */
export function Editable({ path, as: Tag = "span", className = "", children }: Props) {
  const editing = useEditing();
  const lang = useLang();
  const copy = useCopy();

  if (!editing) return <Tag className={className}>{children}</Tag>;

  const restore = (node: HTMLElement) => {
    node.textContent = children;
  };

  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={path}
      spellCheck={false}
      data-edit-path={path}
      // A title and a heading are both links on this page; while the line is
      // being edited, clicking into it must not navigate away from it.
      onClick={(event: React.MouseEvent) => event.preventDefault()}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        // These are single lines of prose, so Enter means "done", not a break.
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          restore(event.currentTarget);
          event.currentTarget.blur();
        }
      }}
      onBlur={(event: React.FocusEvent<HTMLElement>) => {
        const node = event.currentTarget;
        if (saveEdit(lang, path, node.textContent ?? "", children)) emit("toast", copy.edit.saved);
        // Whatever happened, the element goes back to being React's: either the
        // draft is now the rendered text, or the edit was empty and dropped.
        else restore(node);
      }}
    >
      {children}
    </Tag>
  );
}
