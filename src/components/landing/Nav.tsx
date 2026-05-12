import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const INTRO_BASE = 2.0; // play after preloader exit
const ease = [0.16, 1, 0.3, 1] as const;

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
        <motion.a
          href="#top"
          data-magnetic
          initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: INTRO_BASE, ease }}
          className="font-display text-2xl font-extrabold tracking-tighter"
        >
          JA<span className="text-accent">.</span>
        </motion.a>
        <ul className="hidden gap-8 text-[11px] font-medium uppercase tracking-[0.25em] md:flex">
          {[
            { href: "#about", label: "About" },
            { href: "#work", label: "Work" },
            { href: "#skills", label: "Skills" },
            { href: "#contact", label: "Contact" },
          ].map((item, i) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: INTRO_BASE + 0.15 + i * 0.08, ease }}
            >
              <a href={item.href} data-magnetic className="transition-colors hover:text-accent">
                {item.label}
              </a>
            </motion.li>
          ))}
        </ul>
        <motion.a
          href="mailto:jiyul.ahn@stonybrook.edu"
          data-magnetic
          initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: INTRO_BASE + 0.5, ease }}
          className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-accent md:inline"
        >
          Say hi →
        </motion.a>
      </div>
    </nav>
  );
}
