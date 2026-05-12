import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/5 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30"
          : "bg-transparent mix-blend-difference"
      }`}
    >
      {/* grain on glass */}
      {scrolled && <div className="grain-overlay pointer-events-none absolute inset-0" />}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-7">
        <a href="#top" data-magnetic className="font-display text-2xl font-extrabold tracking-tighter">
          JA<span className="text-accent">.</span>
        </a>
        <ul className="hidden gap-8 text-[11px] font-medium uppercase tracking-[0.25em] md:flex">
          <li><a href="#about" data-magnetic className="transition-colors hover:text-accent">About</a></li>
          <li><a href="#work" data-magnetic className="transition-colors hover:text-accent">Work</a></li>
          <li><a href="#skills" data-magnetic className="transition-colors hover:text-accent">Skills</a></li>
          <li><a href="#contact" data-magnetic className="transition-colors hover:text-accent">Contact</a></li>
        </ul>
        <a
          href="mailto:jiyul.ahn@stonybrook.edu"
          data-magnetic
          className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-accent md:inline"
        >
          Say hi →
        </a>
      </div>
    </nav>
  );
}
