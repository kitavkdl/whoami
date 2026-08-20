import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ContentProtect } from "@/components/ContentProtect";
import { Chrome } from "@/components/site/Chrome";
import { Console } from "@/components/site/Console";
import { EntryList } from "@/components/site/EntryList";
import { HighlightProvider } from "@/components/site/HighlightProvider";
import { Overlap } from "@/components/site/Overlap";
import { ProfileCard } from "@/components/site/ProfileCard";
import { SectionNav } from "@/components/site/SectionNav";
import { TopBar } from "@/components/site/TopBar";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { awards, before, now, profile, school, tools } from "@/lib/content";
import { emit } from "@/lib/bus";
import { sectionIds } from "@/lib/nav";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Jiyul Ahn" },
      {
        name: "description",
        content:
          "Jiyul Ahn · developer in Songdo, Incheon. SeekOnce, Odoo implementation projects, and a computer science degree at Stony Brook.",
      },
      { property: "og:title", content: "Jiyul Ahn" },
      {
        property: "og:description",
        content: "Developer in Songdo, Incheon. Currently building SeekOnce.",
      },
    ],
  }),
});

function Section({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-16 first:mt-0">
      <h2 className="flex items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
        <span>{label}</span>
        <span aria-hidden className="h-px flex-1 bg-rule" />
        {count !== undefined && (
          <span className="tnum text-soft/50">{String(count).padStart(2, "0")}</span>
        )}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ContactRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7">
      <dt className="font-sans text-[13px] leading-6 text-soft">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Home() {
  const active = useScrollSpy(sectionIds);

  return (
    <HighlightProvider>
      <ContentProtect />
      <Chrome />
      <TopBar active={active} sentinelId="masthead-end" />

      <a
        href="#now"
        className="sr-only left-4 top-4 z-[90] rounded-[3px] border border-rule bg-panel px-3 py-2 font-sans text-[13px] focus:not-sr-only focus:fixed"
      >
        Skip to the content
      </a>

      <div className="mx-auto w-full max-w-[56rem] px-6 pb-24">
        <ProfileCard />
        <div id="masthead-end" aria-hidden className="h-px" />

        <div className="sticky top-0 z-30 -mx-6 mt-10 lg:hidden" data-print="hide">
          <SectionNav active={active} orientation="horizontal" />
        </div>

        <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[11rem_minmax(0,40rem)] lg:gap-x-12">
          <div className="hidden lg:block" data-print="hide">
            <div className="sticky top-20">
              <SectionNav active={active} orientation="vertical" />
              <p className="mt-6 pl-4 font-sans text-[11.5px] leading-5 text-soft/70">
                <button
                  type="button"
                  onClick={() => emit("shortcuts:toggle")}
                  className="underline decoration-rule underline-offset-[3px] hover:text-mark"
                >
                  Press ? for keys
                </button>
              </p>
            </div>
          </div>

          <main className="min-w-0">
            <Section id="now" label="Now" count={now.length}>
              <EntryList items={now} />
            </Section>

            <Section id="overlap" label="Overlap">
              <Overlap />
            </Section>

            <Section id="before" label="Before" count={before.length}>
              <EntryList items={before} />
            </Section>

            <Section id="awards" label="Awards" count={awards.length}>
              <EntryList items={awards} />
            </Section>

            <Section id="tools" label="Tools">
              <p data-reveal>{tools}</p>
            </Section>

            <Section id="school" label="School">
              <p data-reveal>{school}</p>
            </Section>

            <Section id="contact" label="Contact">
              <dl className="space-y-2" data-allow-copy>
                <ContactRow term="Email">
                  <a
                    href={`mailto:${profile.email}`}
                    className="underline"
                    data-print-url={profile.email}
                  >
                    {profile.email}
                  </a>{" "}
                  is the reliable one.
                </ContactRow>

                <ContactRow term="Phone">
                  <a href={profile.phoneHref} className="tnum underline">
                    {profile.phone}
                  </a>
                </ContactRow>

                <ContactRow term="Elsewhere">
                  <a
                    href={profile.site.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                    data-print-url={profile.site.label}
                  >
                    {profile.site.label}
                  </a>
                </ContactRow>
              </dl>
              <p className="mt-4">Korean or English, either is fine.</p>
            </Section>
          </main>
        </div>

        <section id="console" className="mt-24" data-print="hide">
          <h2 className="flex items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
            <span>Console</span>
            <span aria-hidden className="h-px flex-1 bg-rule" />
          </h2>

          <p className="mb-6 mt-6 max-w-[40rem]">
            Everything above is also a filesystem. This reads it. It is not a recording of a
            terminal, it is a small one:{" "}
            <code className="font-mono text-[0.92em] text-mark">cat</code>,{" "}
            <code className="font-mono text-[0.92em] text-mark">grep</code>,{" "}
            <code className="font-mono text-[0.92em] text-mark">cd</code>, tab completion, and a
            history you can walk back through. Start with{" "}
            <button
              type="button"
              onClick={() => emit("console:run", "help")}
              className="font-mono text-[0.92em] text-mark underline underline-offset-[3px]"
            >
              help
            </button>
            .
          </p>

          <Console />
        </section>

        <footer className="mt-20 border-t border-rule pt-6 font-sans text-[13px] leading-6 text-soft">
          <p>
            Updated {profile.updated}. There is also{" "}
            <a href="/study" className="underline">
              오늘의 학점 운세
            </a>
            , a grade fortune-teller I wrote for no good reason.
          </p>
          <p className="mt-2 text-soft/75">
            Built with TanStack Start and Tailwind. The page, the console and the command palette
            all read from one content file, so none of them can drift out of sync with the others.
          </p>
        </footer>
      </div>
    </HighlightProvider>
  );
}
