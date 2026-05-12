# Jiyul Ahn — Personal Landing Site

A long, cinematic single-page portfolio in the **Kinetic Tech-Noir** direction (deep black `#050505`, violet accent `#BD00FF`, Syne display + Inter body), built on TanStack Start with maximalist scroll-driven motion.

## Sections (top to bottom)

1. **Sticky nav** — `mix-blend-difference`, "JA." mark, anchor links.
2. **Hero** — full-bleed. Massive kinetic "JIYUL / AHN" type (outline second line), animated violet glow blob, grain overlay, magnetic cursor follower, scroll-cue line, intro tagline ("Systems-oriented developer · Stony Brook CS").
3. **Marquee strip** — infinite horizontal scroll: "FOUNDER / LEAD DEVELOPER / DX TECH PM / SYSTEM ARCHITECT".
4. **About / Summary** — sticky two-column reveal. Portrait card (generated tech-noir portrait image) + real summary copy from resume (systems-oriented, B2B export infra, workflow architecture). Animated counters: years coding, projects shipped, roles held.
5. **Skills constellation** — grid of tags (Project Management, System Workflow Architecture, Programming, Web Development, Technical Support, Team Collaboration) with stagger-reveal on scroll, hover glow, magnetic hover.
6. **Experience timeline** — sticky scroll-pinned. Left column sticks with role meta (date + company + location). Right column scrolls through 3 real roles with bullet detail and per-role accent imagery:
   - Jun 2025 – Present · **DX Tech Company — Odoo Project Manager** (Incheon)
   - Feb 2025 – Present · **Founder & Lead Developer** (Incheon) — B2B export infra
   - Apr 2023 – Dec 2024 · **BADA — Developer** (Cheonan) — PHP digitization
7. **Education** — minimal slab card: Stony Brook University · B.S. Computer Science.
8. **Contact / Footer** — giant background "LET'S TALK" outlined word, mailto CTA `jiyul.ahn@stonybrook.edu`, phone `+82 10 8685 9042`, Gyeonggi-do, copyright.

## Motion & effects

- **Framer Motion** for: scroll-linked transforms (`useScroll` + `useTransform`), parallax on hero blob and portrait, sticky reveal opacity/blur, staggered fade-up on every section heading, counter spring.
- **Custom magnetic cursor** (radial blob that lerps toward pointer, scales up on interactive hover).
- **CSS-only**: infinite marquee, grain SVG overlay, text-stroke outline type, `mix-blend-difference` nav, gradient mesh blobs, hover micro-interactions.
- **Reveal-on-scroll** wrapper component (IntersectionObserver-based) used across sections.
- **Respects `prefers-reduced-motion`** — disables transforms.

## Technical plan

- Replace `src/routes/index.tsx` placeholder with the full landing page composition.
- New components in `src/components/landing/`: `Nav`, `Hero`, `Marquee`, `About`, `Skills`, `ExperienceTimeline`, `Education`, `Contact`, `MagneticCursor`, `Reveal`, `GrainOverlay`, `Counter`.
- Add design tokens to `src/styles.css` (override existing tokens for this project): `--background` near-black, `--foreground` white, `--accent` violet `oklch` equivalent of `#BD00FF`, `--muted` gray. Add `Syne` + `Inter` via Google Fonts in `__root.tsx` head links. Update `<head>` meta: title "Jiyul Ahn — Developer & Systems Architect", description, og tags.
- Generate one hero/portrait image with imagegen (premium tier, dark cinematic) into `src/assets/`.
- Install `framer-motion` via bun.
- Add custom keyframes (marquee, glow-pulse, blur-in) to `styles.css`.

## Out of scope

- No backend, no auth, no CMS — pure presentation page.
- No real social links (will use placeholders for LinkedIn/GitHub unless you provide).

## Open question I'll resolve while building

Resume lists no GitHub/LinkedIn — I'll either omit social row or use generic icons linking to mailto. If you have URLs, drop them after approval and I'll wire them in.
