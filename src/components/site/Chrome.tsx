import { useEffect } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { CommandPalette } from "@/components/site/CommandPalette";
import { ShortcutSheet } from "@/components/site/ShortcutSheet";
import { KeyboardLayer } from "@/components/site/KeyboardLayer";
import { Toasts } from "@/components/site/Toasts";
import { cycleTheme, THEME_LABEL } from "@/lib/theme";
import { emit, on } from "@/lib/bus";

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

/**
 * The one handler for theme:cycle, which the keyboard and the palette both
 * fire. It lives here rather than on the button because the button renders
 * twice; two subscriptions would start two view transitions per press.
 *
 * It also says where the rotation landed. The colours are their own feedback
 * for light against dark, but nothing on screen separates pinned dark from
 * system-dark, and a cycle fired from the keyboard has no press to watch.
 */
function useThemeCommands() {
  useEffect(
    () => on("theme:cycle", (origin) => emit("toast", THEME_LABEL[cycleTheme(origin)])),
    [],
  );
}

/** Everything that floats above the document rather than sitting in it. */
export function Chrome() {
  useReveal();
  useThemeCommands();

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
