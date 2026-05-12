const items = [
  "FOUNDER",
  "LEAD DEVELOPER",
  "DX TECH PM",
  "SYSTEM ARCHITECT",
  "B2B INFRA",
  "STONY BROOK CS",
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border bg-background py-6">
      <div className="animate-marquee flex w-max items-center gap-12 whitespace-nowrap">
        {row.map((it, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="font-display text-5xl font-extrabold uppercase tracking-tighter text-foreground/90 md:text-7xl">
              {it}
            </span>
            <span className="text-3xl text-accent md:text-5xl">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
