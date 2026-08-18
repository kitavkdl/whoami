import { createFileRoute } from "@tanstack/react-router";
import photo from "@/assets/jiyul.png";
import { ContentProtect } from "@/components/ContentProtect";

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

type Entry = {
  when: string;
  title: string;
  where?: string;
  body: string[];
};

const now: Entry[] = [
  {
    when: "Jul 2025 ~",
    title: "SeekOnce",
    where: "founder, and so far the only developer",
    body: [
      "An academic platform for SUNY Korea students. Sign-up is limited to @stonybrook.edu addresses, which keeps it small on purpose. It reached 100 users in the first twenty days and is on 3.7.1 now, after fifteen or so releases.",
      "You upload a transcript once and the rest of the site runs off it: GPA simulation, curriculum paths, schedules laid over your friends', anonymous course reviews, and the cafés near campus. About twenty tables in Postgres. The first version polled for updates, which was fine until it wasn't. Moving to Supabase Realtime fixed more than I expected it to.",
    ],
  },
  {
    when: "Jun 2025 ~",
    title: "DX Tech",
    where: "Odoo project manager, Incheon",
    body: [
      "I run several Odoo implementations at the same time: scope, schedule, and the steady negotiation between what a client wants this month and what the team can actually finish. Less code than I would like. More useful than I expected.",
    ],
  },
  {
    when: "Feb 2025 ~",
    title: "B2B export infrastructure",
    where: "on my own, unlaunched",
    body: [
      "A system for putting Korean sellers and overseas buyers in the same pipeline, with customs and shipping paperwork handled inside the flow instead of over email. Transactions in SQL, the high-volume behavioral data in a document store. I work on it in the gaps between everything else.",
    ],
  },
];

const before: Entry[] = [
  {
    when: "Mar ~ Jun 2026",
    title: "Korea Polar Research Institute",
    where: "research intern, paid contract · Life Sciences Research Division",
    body: [
      "An offline tool for internal use. It's covered by an NDA, so I'll leave it there.",
    ],
  },
  {
    when: "Apr 2023 ~ Dec 2024",
    title: "BADA",
    where: "developer, Cheonan",
    body: [
      "The student application process was on paper. I moved it onto the web with PHP, HTML and JavaScript, drew the mobile and desktop layouts, and deployed it on Cafe24, server configuration included. First time something I built was a thing other people depended on.",
    ],
  },
];

const awards: Entry[] = [
  {
    when: "Jul 2026",
    title: "CODEGATE 2026 AI Startup Hackathon",
    where: "first place · ₩20,000,000",
    body: [
      "I planned the product and gave the final pitch: an AI platform for handing down know-how inside small manufacturers, before the people holding it retire. First out of every team that competed.",
    ],
  },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-soft">
        {label}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Entries({ items }: { items: Entry[] }) {
  return (
    <ul className="space-y-10">
      {items.map((e) => (
        <li key={e.title} className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7">
          <p className="font-sans text-[13px] leading-6 text-soft sm:pt-[5px]">{e.when}</p>
          <div>
            <h3 className="text-[19px] font-medium leading-snug">
              {e.title}
              {e.where && <span className="font-normal text-soft"> · {e.where}</span>}
            </h3>
            {e.body.map((p, i) => (
              <p key={i} className="mt-3">
                {p}
              </p>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Home() {
  return (
    <main className="mx-auto max-w-[40rem] px-6 pb-24 pt-16 sm:pt-24">
      <ContentProtect />

      <header className="flex items-start gap-6">
        <img
          src={photo}
          alt="Jiyul Ahn"
          width={827}
          height={1063}
          className="hidden w-[5.5rem] shrink-0 border border-rule bg-white object-cover sm:block dark:opacity-80"
        />
        <div>
          <h1 className="text-[2rem] font-medium leading-none">Jiyul Ahn</h1>
          <p className="mt-2 font-sans text-[13px] text-soft">
            안지율 · Songdo, Incheon, South Korea
          </p>
          <p className="mt-4">
            I build internal software. Usually the kind that replaces a spreadsheet, a
            paper form, or a step only one person on the team remembers how to do.
          </p>
        </div>
      </header>

      <p className="mt-5">
        Most of it has been for small organizations where nobody's job title is
        “developer,” so I end up doing the schema, the interface, the deployment, and the
        part where you sit next to someone and find out what they actually do all day.
        That last part is where the work is.
      </p>

      <Section label="Now">
        <Entries items={now} />
      </Section>

      <Section label="Before">
        <Entries items={before} />
      </Section>

      <Section label="Awards">
        <Entries items={awards} />
      </Section>

      <Section label="Tools">
        <p>
          TypeScript, React and Postgres most days, with Supabase when I want to move
          quickly. A couple of years of PHP before that, which I don't count as wasted.
          Odoo, and enough Python to keep it in line. I write Tailwind because I'm faster
          in it, not because I want to argue about it.
        </p>
      </Section>

      <Section label="School">
        <p>B.S. Computer Science, Stony Brook University. Still in progress.</p>
      </Section>

      <Section label="Contact">
        <dl className="space-y-2" data-allow-copy>
          <div className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7">
            <dt className="font-sans text-[13px] leading-6 text-soft">Email</dt>
            <dd>
              <a href="mailto:jiyul.ahn@stonybrook.edu" className="underline">
                jiyul.ahn@stonybrook.edu
              </a>{" "}
              is the reliable one.
            </dd>
          </div>
          <div className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7">
            <dt className="font-sans text-[13px] leading-6 text-soft">Phone</dt>
            <dd>
              <a href="tel:+821086859042" className="underline">
                +82 10 8685 9042
              </a>
            </dd>
          </div>
          <div className="sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-x-7">
            <dt className="font-sans text-[13px] leading-6 text-soft">Elsewhere</dt>
            <dd>
              <a
                href="https://www.seek-once.com/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                seek-once.com
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-4">Korean or English, either is fine.</p>
      </Section>

      <footer className="mt-20 border-t border-rule pt-6 font-sans text-[13px] text-soft">
        <p>
          Updated August 2026. There is also{" "}
          <a href="/study" className="underline">
            오늘의 학점 운세
          </a>
          , a grade fortune-teller I wrote for no good reason.
        </p>
      </footer>
    </main>
  );
}
