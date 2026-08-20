import { useReveal } from "@/hooks/use-reveal";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { CommandPalette } from "@/components/site/CommandPalette";
import { ShortcutSheet } from "@/components/site/ShortcutSheet";
import { KeyboardLayer } from "@/components/site/KeyboardLayer";
import { Toasts } from "@/components/site/Toasts";

/** A little tooth on the paper. Cheap: one fixed layer, never repainted. */
function Grain() {
  return (
    <div
      aria-hidden
      data-print="hide"
      className="grain pointer-events-none fixed inset-0 z-[5] opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
    />
  );
}

/** Everything that floats above the document rather than sitting in it. */
export function Chrome() {
  useReveal();

  return (
    <>
      <Grain />
      <ReadingProgress />
      <KeyboardLayer />
      <CommandPalette />
      <ShortcutSheet />
      <Toasts />
    </>
  );
}
