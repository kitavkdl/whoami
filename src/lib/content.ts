/**
 * Everything the page knows about, in one place.
 *
 * Three surfaces read from this module and they must never disagree: the
 * rendered document, the virtual filesystem behind the console, and the
 * command palette index. Adding an entry here adds it to all three.
 */

export type EntryKind = "product" | "work" | "award";

export type Entry = {
  /** Stable slug. Doubles as the filename in the console filesystem. */
  id: string;
  when: string;
  title: string;
  where?: string;
  body: string[];
  tags: string[];
  href?: string;
  /** YYYY-MM, inclusive. Drives the concurrency chart. */
  start: string;
  /** YYYY-MM, inclusive. Omitted means still running. */
  end?: string;
  kind: EntryKind;
};

export const profile = {
  name: "Jiyul Ahn",
  hangul: "안지율",
  location: "Songdo, Incheon, South Korea",
  timeZone: "Asia/Seoul",
  lede: "I build internal software. Usually the kind that replaces a spreadsheet, a paper form, or a step only one person on the team remembers how to do.",
  intro:
    "Most of it has been for small organizations where nobody's job title is “developer,” so I end up doing the schema, the interface, the deployment, and the part where you sit next to someone and find out what they actually do all day. That last part is where the work is.",
  email: "jiyul.ahn@stonybrook.edu",
  phone: "+82 10 8685 9042",
  phoneHref: "tel:+821086859042",
  site: { label: "seek-once.com", href: "https://www.seek-once.com/" },
  updated: "August 2026",
} as const;

export const now: Entry[] = [
  {
    id: "seekonce",
    when: "Jul 2025 ~",
    title: "SeekOnce",
    where: "founder, and so far the only developer",
    kind: "product",
    start: "2025-07",
    href: "https://www.seek-once.com/",
    tags: ["TypeScript", "React", "Postgres", "Supabase Realtime"],
    body: [
      "An academic platform for SUNY Korea students. Sign-up is limited to @stonybrook.edu addresses, which keeps it small on purpose. It reached 100 users in the first twenty days and is on 3.7.1 now, after fifteen or so releases.",
      "You upload a transcript once and the rest of the site runs off it: GPA simulation, curriculum paths, schedules laid over your friends', anonymous course reviews, and the cafés near campus. About twenty tables in Postgres. The first version polled for updates, which was fine until it wasn't. Moving to Supabase Realtime fixed more than I expected it to.",
    ],
  },
  {
    id: "dx-tech",
    when: "Jun 2025 ~",
    title: "DX Tech",
    where: "Odoo project manager, Incheon",
    kind: "work",
    start: "2025-06",
    tags: ["Odoo", "Python", "scoping"],
    body: [
      "I run several Odoo implementations at the same time: scope, schedule, and the steady negotiation between what a client wants this month and what the team can actually finish. Less code than I would like. More useful than I expected.",
    ],
  },
  {
    id: "b2b-export",
    when: "Feb 2025 ~",
    title: "B2B export infrastructure",
    where: "on my own, unlaunched",
    kind: "product",
    start: "2025-02",
    tags: ["SQL", "document store", "customs flow"],
    body: [
      "A system for putting Korean sellers and overseas buyers in the same pipeline, with customs and shipping paperwork handled inside the flow instead of over email. Transactions in SQL, the high-volume behavioral data in a document store. I work on it in the gaps between everything else.",
    ],
  },
];

export const before: Entry[] = [
  {
    id: "kopri",
    when: "Mar ~ Jun 2026",
    title: "Korea Polar Research Institute",
    where: "research intern, paid contract · Life Sciences Research Division",
    kind: "work",
    start: "2026-03",
    end: "2026-06",
    tags: ["internal tooling", "offline"],
    body: ["An offline tool for internal use. It's covered by an NDA, so I'll leave it there."],
  },
  {
    id: "bada",
    when: "Apr 2023 ~ Dec 2024",
    title: "BADA",
    where: "developer, Cheonan",
    kind: "work",
    start: "2023-04",
    end: "2024-12",
    tags: ["PHP", "JavaScript", "Cafe24", "responsive"],
    body: [
      "The student application process was on paper. I moved it onto the web with PHP, HTML and JavaScript, drew the mobile and desktop layouts, and deployed it on Cafe24, server configuration included. First time something I built was a thing other people depended on.",
    ],
  },
];

export const awards: Entry[] = [
  {
    id: "codegate-2026",
    when: "Jul 2026",
    title: "CODEGATE 2026 AI Startup Hackathon",
    where: "first place · ₩20,000,000",
    kind: "award",
    start: "2026-07",
    end: "2026-07",
    tags: ["product", "pitch"],
    body: [
      "I planned the product and gave the final pitch: an AI platform for handing down know-how inside small manufacturers, before the people holding it retire. First out of every team that competed.",
    ],
  },
];

export const tools =
  "TypeScript, React and Postgres most days, with Supabase when I want to move quickly. A couple of years of PHP before that, which I don't count as wasted. Odoo, and enough Python to keep it in line. I write Tailwind because I'm faster in it, not because I want to argue about it.";

export const school = "B.S. Computer Science, Stony Brook University. Still in progress.";

export const allEntries: Entry[] = [...now, ...before, ...awards];

export type SectionId =
  "now" | "before" | "awards" | "overlap" | "tools" | "school" | "contact" | "console";

export const sections: { id: SectionId; label: string; nav: string }[] = [
  { id: "now", label: "Now", nav: "Now" },
  { id: "overlap", label: "Overlap", nav: "Overlap" },
  { id: "before", label: "Before", nav: "Before" },
  { id: "awards", label: "Awards", nav: "Awards" },
  { id: "tools", label: "Tools", nav: "Tools" },
  { id: "school", label: "School", nav: "School" },
  { id: "contact", label: "Contact", nav: "Contact" },
  { id: "console", label: "Console", nav: "Console" },
];

/** Earliest month on record, used as the left edge of the concurrency chart. */
export const timelineStart = "2023-01";
