import { useEffect } from "react";

/**
 * Blocks right-click / long-press save, image dragging, and copy/cut of page
 * content. Inputs, textareas and the terminal widget stay fully usable.
 */
export function ContentProtect() {
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      return !!node?.closest?.("input, textarea, [contenteditable='true'], [data-allow-copy]");
    };

    const onContextMenu = (e: MouseEvent) => {
      if (!isEditable(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onCopy = (e: ClipboardEvent) => {
      if (!isEditable(e.target)) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
    };
  }, []);

  return null;
}
