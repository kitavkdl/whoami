import { useEffect, useState } from "react";
import { on } from "@/lib/bus";

type Toast = { id: number; text: string };

let counter = 0;

/** Small confirmations for things with no visible result, like a clipboard write. */
export function Toasts() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(
    () =>
      on("toast", (text) => {
        const id = ++counter;
        setItems((prev) => [...prev.slice(-2), { id, text }]);
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }, 2400);
      }),
    [],
  );

  if (items.length === 0) return null;

  return (
    <div
      data-print="hide"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4"
    >
      {items.map((item) => (
        <p
          key={item.id}
          className="rounded-[3px] border border-rule bg-panel px-3 py-[6px] font-sans text-[12.5px] text-ink shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]"
          style={{ animation: "toast-in 200ms cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
        >
          {item.text}
        </p>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate3d(0, 8px, 0) }
          to { opacity: 1; transform: none }
        }
      `}</style>
    </div>
  );
}
