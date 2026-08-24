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
import { sectionIds, useContent, type SectionId } from "@/lib/content";
import { useCopy } from "@/lib/copy";
import { LangContext, useLang, type Lang } from "@/lib/i18n";
import { emit } from "@/lib/bus";

function Section({ id, count, children }: { id: SectionId; count?: number; children: ReactNode }) {
  const { sections } = useContent();
  // Read rather than passed in: the heading and the index that links to it
  // were two hardcoded copies of the same word, which is one too many.
  const label = sections.find((s) => s.id === id)?.label ?? id;

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

function Page() {
  const active = useScrollSpy(sectionIds);
  const { profile, now, before, awards, tools, school, sections } = useContent();
  const copy = useCopy();
  const lang = useLang();

  return (
    <HighlightProvider>
      <ContentProtect />
      <Chrome />
      <TopBar active={active} sentinelId="masthead-end" />

      <a
        href="#now"
        className="sr-only left-4 top-4 z-[90] rounded-[3px] border border-rule bg-panel px-3 py-2 font-sans text-[13px] focus:not-sr-only focus:fixed"
      >
        {copy.skipToContent}
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
                  {copy.keysHint}
                </button>
              </p>
            </div>
          </div>

          {/* The language links read this to keep the reader's place. */}
          <main className="min-w-0" data-section-active={active}>
            <Section id="now" count={now.length}>
              <EntryList items={now} />
            </Section>

            <Section id="overlap">
              <Overlap />
            </Section>

            <Section id="before" count={before.length}>
              <EntryList items={before} />
            </Section>

            <Section id="awards" count={awards.length}>
              <EntryList items={awards} />
            </Section>

            <Section id="tools">
              <p data-reveal>{tools}</p>
            </Section>

            <Section id="school">
              <p data-reveal>{school}</p>
            </Section>

            <Section id="contact">
              <dl className="space-y-2" data-allow-copy>
                <ContactRow term={copy.contact.email}>
                  <a
                    href={`mailto:${profile.email}`}
                    className="underline"
                    data-print-url={profile.email}
                  >
                    {profile.email}
                  </a>
                  {copy.contact.emailNote}
                </ContactRow>

                <ContactRow term={copy.contact.phone}>
                  {profile.phones.map((phone) => (
                    <p key={phone.href}>
                      <a href={phone.href} className="tnum underline">
                        {phone.label}
                      </a>
                      {phone.smsOnly && (
                        <span className="font-sans text-[13px] text-soft">
                          {" · "}
                          {copy.contact.smsOnly}
                        </span>
                      )}
                    </p>
                  ))}
                </ContactRow>

                <ContactRow term={copy.contact.elsewhere}>
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
              <p className="mt-4">{copy.contact.languages}</p>
            </Section>
          </main>
        </div>

        <section id="console" className="mt-24" data-print="hide">
          <h2 className="flex items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
            <span>{sections.find((s) => s.id === "console")?.label}</span>
            <span aria-hidden className="h-px flex-1 bg-rule" />
          </h2>

          <p className="mb-6 mt-6 max-w-[40rem]">
            {copy.consoleIntro.lead} <code className="font-mono text-[0.92em] text-mark">cat</code>,{" "}
            <code className="font-mono text-[0.92em] text-mark">grep</code>,{" "}
            <code className="font-mono text-[0.92em] text-mark">cd</code>
            {copy.consoleIntro.tail}{" "}
            <button
              type="button"
              onClick={() => emit("console:run", "help")}
              className="font-mono text-[0.92em] text-mark underline underline-offset-[3px]"
            >
              help
            </button>
            {copy.consoleIntro.end}
          </p>

          <Console />
        </section>

        <footer className="mt-20 border-t border-rule pt-6 font-sans text-[13px] leading-6 text-soft">
          <p>
            {copy.footer.before(profile.updated)}
            <a href={`/study?lang=${lang}`} className="underline">
              {copy.footer.studyLink}
            </a>
            {copy.footer.after}
          </p>
          <p className="mt-2 text-soft/75">{copy.footer.built}</p>
        </footer>
      </div>
    </HighlightProvider>
  );
}

/**
 * The page, in one language. Both routes render this; the language comes from
 * the URL rather than from storage, so the server renders what was asked for
 * and nothing changes under the reader after hydration.
 */
export function Home({ lang }: { lang: Lang }) {
  return (
    <LangContext.Provider value={lang}>
      <Page />
    </LangContext.Provider>
  );
}
