/**
 * CRT-style scanlines overlay.
 * Fixed, pointer-events: none, extremely subtle.
 * Sits below the custom cursor (z-60) and above content.
 */
export function Scanlines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[56]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "overlay",
        opacity: 0.5,
      }}
    />
  );
}
