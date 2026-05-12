export function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <a href="#top" className="font-display text-2xl font-extrabold tracking-tighter">
          JA<span className="text-accent">.</span>
        </a>
        <ul className="hidden gap-8 text-[11px] font-medium uppercase tracking-[0.25em] md:flex">
          <li><a href="#about" className="transition-colors hover:text-accent">About</a></li>
          <li><a href="#work" className="transition-colors hover:text-accent">Work</a></li>
          <li><a href="#skills" className="transition-colors hover:text-accent">Skills</a></li>
          <li><a href="#contact" className="transition-colors hover:text-accent">Contact</a></li>
        </ul>
        <a
          href="mailto:jiyul.ahn@stonybrook.edu"
          className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-accent md:inline"
        >
          Say hi →
        </a>
      </div>
    </nav>
  );
}
