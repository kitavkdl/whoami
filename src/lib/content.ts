/**
 * Everything the page knows about, in one place.
 *
 * Three surfaces read from this module and they must never disagree: the
 * rendered document, the virtual filesystem behind the console, and the
 * command palette index. Adding an entry here adds it to all three.
 *
 * Both languages live in one source rather than two trees, so the dates, ids
 * and ordering below cannot drift apart between them. Only prose is doubled;
 * anything structural is written once. getContent() resolves a language and
 * hands back the flat shape the components expect.
 */

import { useLang, type L, type Lang } from "@/lib/i18n";

export type EntryKind = "product" | "work" | "award";

/** An entry as it is written here, with both languages still in it. */
type EntrySource = {
  /** Stable slug. Doubles as the filename in the console filesystem. */
  id: string;
  when: L;
  title: L;
  /** The name in the other script, when the title is a translation. */
  altName?: L;
  where?: L;
  body: L<string[]>;
  tags: L<string[]>;
  href?: string;
  /** YYYY-MM, inclusive. Drives the concurrency chart. */
  start: string;
  /** YYYY-MM, inclusive. Omitted means still running. */
  end?: string;
  kind: EntryKind;
};

/** An entry once a language has been chosen. */
export type Entry = {
  id: string;
  when: string;
  title: string;
  altName?: string;
  where?: string;
  body: string[];
  tags: string[];
  href?: string;
  start: string;
  end?: string;
  kind: EntryKind;
};

/** Fields that read the same in either language. */
export const profile = {
  name: "Jiyul Ahn",
  hangul: "안지율",
  timeZone: "Asia/Seoul",
  email: "jiyul.ahn@stonybrook.edu",
  phone: "+82 10 8685 9042",
  phoneHref: "tel:+821086859042",
  site: { label: "seek-once.com", href: "https://www.seek-once.com/" },
} as const;

const profileText = {
  location: {
    en: "Songdo, Incheon, South Korea",
    ko: "인천 송도",
  },
  lede: {
    en: "I build internal software. Usually the kind that replaces a spreadsheet, a paper form, or a step only one person on the team remembers how to do.",
    ko: "사내에서 쓰는 소프트웨어를 만든다. 대개는 스프레드시트나 종이 서식, 아니면 팀에서 한 사람만 방법을 아는 절차를 대신하는 쪽이다.",
  },
  intro: {
    en: "Most of it has been for small organizations where nobody's job title is “developer,” so I end up doing the schema, the interface, the deployment, and the part where you sit next to someone and find out what they actually do all day. That last part is where the work is.",
    ko: "대부분 ‘개발자’라는 직함을 가진 사람이 아무도 없는 작은 조직을 위한 일이었다. 그래서 스키마도, 화면도, 배포도 내가 하고, 누군가의 옆에 앉아 그 사람이 하루 종일 실제로 무슨 일을 하는지 알아내는 일도 내가 한다. 마지막의 그 부분에 진짜 일이 있다.",
  },
  updated: { en: "August 2026", ko: "2026년 8월" },
} satisfies Record<string, L>;

const nowSource: EntrySource[] = [
  {
    id: "seekonce",
    when: { en: "Oct 2025 ~", ko: "2025년 10월 ~" },
    title: { en: "SeekOnce", ko: "SeekOnce" },
    where: {
      en: "project lead first, sole developer since January",
      ko: "처음엔 PL, 1월부터는 혼자",
    },
    kind: "product",
    start: "2025-10",
    href: "https://www.seek-once.com/",
    tags: {
      en: ["TypeScript", "React", "Postgres", "Supabase Realtime"],
      ko: ["TypeScript", "React", "Postgres", "Supabase Realtime"],
    },
    body: {
      en: [
        "An academic platform for SUNY Korea students. Sign-up is limited to @stonybrook.edu addresses, which keeps it small on purpose. It reached 100 users in the first twenty days and is on 3.7.1 now, after fifteen or so releases.",
        "You upload a transcript once and the rest of the site runs off it: GPA simulation, curriculum paths, schedules laid over your friends', anonymous course reviews, and the cafés near campus. About twenty tables in Postgres. The first version polled for updates, which was fine until it wasn't. Moving to Supabase Realtime fixed more than I expected it to.",
        "It began in October 2025 as Decompiler × LAMBDA, a joint club project I ran as PL. In January 2026 it broke off on its own, and it has been mine to carry since.",
      ],
      ko: [
        "한국뉴욕주립대 학생을 위한 학사 플랫폼. 가입은 @stonybrook.edu 주소로만 받는다. 작게 두려고 일부러 그렇게 했다. 첫 20일에 100명을 넘겼고, 열다섯 번 남짓 배포한 끝에 지금은 3.7.1이다.",
        "성적표를 한 번 올리면 나머지는 거기서 돌아간다. 학점 시뮬레이션, 커리큘럼 경로, 친구 시간표 위에 겹쳐 보는 내 시간표, 익명 강의평, 그리고 학교 근처 카페까지. Postgres 테이블은 스무 개쯤. 첫 버전은 폴링으로 갱신했고, 문제가 되기 전까지는 그것도 괜찮았다. Supabase Realtime으로 옮기고 나서 생각보다 많은 것이 함께 나아졌다.",
        "2025년 10월, Decompiler × LAMBDA 동아리 합동 프로젝트로 시작했고 내가 PL을 맡았다. 2026년 1월에 독립 프로젝트로 떨어져 나왔고, 그 뒤로는 내가 끌고 간다.",
      ],
    },
  },
  {
    id: "b2b-export",
    when: { en: "Feb 2025 ~", ko: "2025년 2월 ~" },
    title: { en: "B2B export infrastructure", ko: "B2B 수출 인프라" },
    where: { en: "on my own, unlaunched", ko: "혼자서, 아직 미공개" },
    kind: "product",
    start: "2025-02",
    tags: {
      en: ["SQL", "document store", "customs flow"],
      ko: ["SQL", "도큐먼트 스토어", "통관 플로우"],
    },
    body: {
      en: [
        "A system for putting Korean sellers and overseas buyers in the same pipeline, with customs and shipping paperwork handled inside the flow instead of over email. Transactions in SQL, the high-volume behavioral data in a document store. I work on it in the gaps between everything else.",
      ],
      ko: [
        "국내 셀러와 해외 바이어를 같은 파이프라인에 올리는 시스템. 통관과 선적 서류를 이메일이 아니라 흐름 안에서 처리한다. 거래는 SQL에, 양이 많은 행동 데이터는 도큐먼트 스토어에 둔다. 나머지 일들 사이의 틈에서 만든다.",
      ],
    },
  },
];

const beforeSource: EntrySource[] = [
  {
    id: "kopri",
    when: { en: "Mar ~ Jun 2026", ko: "2026년 3월 ~ 6월" },
    title: { en: "Korea Polar Research Institute", ko: "극지연구소" },
    altName: {
      en: "한국해양과학기술원 부설 극지연구소",
      ko: "Korea Polar Research Institute",
    },
    where: {
      en: "research intern, paid contract · Life Sciences Research Division",
      ko: "연구 인턴, 유급 계약 · 생명과학연구부",
    },
    kind: "work",
    start: "2026-03",
    end: "2026-06",
    tags: { en: ["internal tooling", "offline"], ko: ["사내 도구", "오프라인"] },
    body: {
      en: ["An offline tool for internal use. It's covered by an NDA, so I'll leave it there."],
      ko: ["내부에서 쓰는 오프라인 도구. NDA가 걸려 있어 여기까지만 적는다."],
    },
  },
  {
    id: "dx-tech",
    when: { en: "Jun ~ Nov 2025", ko: "2025년 6월 ~ 11월" },
    title: { en: "DX Tech", ko: "DX Tech" },
    where: {
      en: "Odoo project manager, Incheon · six-month contract",
      ko: "Odoo 프로젝트 매니저, 인천 · 6개월 계약",
    },
    kind: "work",
    start: "2025-06",
    end: "2025-11",
    tags: { en: ["Odoo", "Python", "scoping"], ko: ["Odoo", "Python", "범위 산정"] },
    body: {
      en: [
        "I ran several Odoo implementations at the same time: scope, schedule, and the steady negotiation between what a client wanted this month and what the team could actually finish. Less code than I would have liked. More useful than I expected.",
      ],
      ko: [
        "Odoo 구축 프로젝트 여러 건을 동시에 맡았다. 범위와 일정, 그리고 이번 달에 고객이 원하는 것과 팀이 실제로 끝낼 수 있는 것 사이의 끊임없는 조율. 코드는 바라던 것보다 적었고, 쓸모는 예상보다 컸다.",
      ],
    },
  },
  {
    id: "decompiler",
    when: { en: "Jan 2025 ~ May 2026", ko: "2025년 1월 ~ 2026년 5월" },
    title: { en: "Decompiler", ko: "Decompiler" },
    where: { en: "student club at SUNY Korea", ko: "한국뉴욕주립대 학생 동아리" },
    kind: "work",
    start: "2025-01",
    end: "2026-05",
    tags: {
      en: ["technical advisor", "vice president", "president"],
      ko: ["기술 자문", "부회장", "회장"],
    },
    body: {
      en: [
        "Technical advisor in Spring 2025, vice president in Fall 2025, president in Spring 2026. Three semesters, and the job changed shape each time: first answering the questions myself, then making sure somebody was around to answer them.",
        "Founding a Stony Brook chapter — Decompiler at SBU — in Fall 2026.",
      ],
      ko: [
        "2025년 봄 학기 기술 자문, 가을 학기 부회장, 2026년 봄 학기 회장. 세 학기 동안 일의 모양이 매번 바뀌었다. 처음에는 질문에 직접 답했고, 나중에는 답할 사람이 자리에 있도록 만드는 쪽이었다.",
        "2026년 가을 학기에는 스토니브룩 본교에 Decompiler at SBU를 만든다.",
      ],
    },
  },
  {
    id: "facility-booking",
    when: { en: "Jan ~ Sep 2024", ko: "2024년 1월 ~ 9월" },
    title: { en: "Facility booking", ko: "시설 예약 서비스" },
    where: { en: "for high schools, on my own", ko: "고등학교 대상, 혼자서" },
    kind: "product",
    start: "2024-01",
    end: "2024-09",
    tags: { en: ["booking", "scheduling"], ko: ["예약", "일정 관리"] },
    body: {
      en: [
        "A site for reserving school facilities, run for high schools. Nine months of it, and keeping the thing running turned out to be a different job from building it.",
      ],
      ko: [
        "학교 시설을 예약하는 사이트를 만들어 고등학교를 대상으로 운영했다. 아홉 달 동안, 만드는 일과 굴러가게 두는 일이 서로 다른 일이라는 걸 배웠다.",
      ],
    },
  },
  {
    id: "bada",
    when: { en: "Apr 2023 ~ Dec 2024", ko: "2023년 4월 ~ 2024년 12월" },
    title: { en: "BADA", ko: "BADA" },
    where: { en: "developer, Cheonan", ko: "개발자, 천안" },
    kind: "work",
    start: "2023-04",
    end: "2024-12",
    tags: {
      en: ["PHP", "JavaScript", "Cafe24", "responsive"],
      ko: ["PHP", "JavaScript", "카페24", "반응형"],
    },
    body: {
      en: [
        "The student application process was on paper. I moved it onto the web with PHP, HTML and JavaScript, drew the mobile and desktop layouts, and deployed it on Cafe24, server configuration included. First time something I built was a thing other people depended on.",
      ],
      ko: [
        "학생 지원 절차가 종이로 돌아가고 있었다. PHP와 HTML, JavaScript로 웹에 옮기고 모바일과 데스크톱 레이아웃을 그렸으며, 서버 설정까지 포함해 카페24에 배포했다. 내가 만든 것에 다른 사람들이 기대는 첫 경험이었다.",
      ],
    },
  },
];

const awardsSource: EntrySource[] = [
  {
    id: "codegate-2026",
    when: { en: "Jul 2026", ko: "2026년 7월" },
    title: {
      en: "CODEGATE 2026 AI Startup Hackathon",
      ko: "CODEGATE 2026 AI 스타트업 해커톤",
    },
    where: { en: "first place · ₩20,000,000", ko: "1위 · 상금 2,000만 원" },
    kind: "award",
    start: "2026-07",
    end: "2026-07",
    tags: { en: ["product", "pitch"], ko: ["기획", "발표"] },
    body: {
      en: [
        "I planned the product and gave the final pitch: an AI platform for handing down know-how inside small manufacturers, before the people holding it retire. First out of every team that competed.",
      ],
      ko: [
        "제품을 기획하고 최종 발표를 맡았다. 중소 제조업의 노하우를, 그것을 쥔 사람들이 은퇴하기 전에 물려주는 AI 플랫폼. 참가한 모든 팀 가운데 1위.",
      ],
    },
  },
  {
    id: "odoo-plo",
    when: { en: "Mar 2026", ko: "2026년 3월" },
    title: {
      en: "Odoo Project Leader Ownership",
      ko: "Odoo Project Leader Ownership",
    },
    where: { en: "certification", ko: "수료" },
    kind: "award",
    start: "2026-03",
    end: "2026-03",
    tags: { en: ["Odoo", "project leadership"], ko: ["Odoo", "프로젝트 리딩"] },
    body: {
      en: [
        "Odoo's PLO track, finished on the eleventh. I also sit on the Odoo Enterprise repository, with viewer access.",
      ],
      ko: [
        "Odoo의 PLO 과정, 11일에 수료했다. Odoo Enterprise 저장소에는 viewer 권한으로 들어가 있다.",
      ],
    },
  },
];

const toolsText: L = {
  en: "TypeScript, React and Postgres most days, with Supabase when I want to move quickly. A couple of years of PHP before that, which I don't count as wasted. Odoo, and enough Python to keep it in line. I write Tailwind because I'm faster in it, not because I want to argue about it.",
  ko: "대개는 TypeScript와 React, Postgres. 빨리 움직이고 싶을 때는 Supabase. 그 전에 PHP로 몇 해를 보냈는데 버린 시간이라고 생각하지 않는다. Odoo, 그리고 그것을 붙잡아 둘 만큼의 Python. Tailwind로 쓰는 건 그게 더 빠르기 때문이지, 그 얘기로 논쟁하고 싶어서가 아니다.",
};

const schoolText: L = {
  en: "B.S. Computer Science, Stony Brook University. Still in progress.",
  ko: "스토니브룩 대학교 컴퓨터과학 학사. 아직 진행 중.",
};

export type SectionId =
  | "now"
  | "before"
  | "awards"
  | "overlap"
  | "tools"
  | "school"
  | "contact"
  | "console";

const sectionSource: { id: SectionId; label: L }[] = [
  { id: "now", label: { en: "Now", ko: "지금" } },
  { id: "overlap", label: { en: "Overlap", ko: "겹침" } },
  { id: "before", label: { en: "Before", ko: "이전" } },
  { id: "awards", label: { en: "Awards & certs", ko: "수상 · 자격" } },
  { id: "tools", label: { en: "Tools", ko: "도구" } },
  { id: "school", label: { en: "School", ko: "학력" } },
  { id: "contact", label: { en: "Contact", ko: "연락" } },
  { id: "console", label: { en: "Console", ko: "콘솔" } },
];

/** Ids are the same in both languages: they are anchors and console paths. */
export const sectionIds: SectionId[] = sectionSource.map((s) => s.id);

export type Section = { id: SectionId; label: string };

export type SiteContent = {
  profile: typeof profile & { location: string; lede: string; intro: string; updated: string };
  now: Entry[];
  before: Entry[];
  awards: Entry[];
  allEntries: Entry[];
  tools: string;
  school: string;
  sections: Section[];
};

function resolveEntry(source: EntrySource, lang: Lang): Entry {
  const { when, title, altName, where, body, tags, ...rest } = source;
  return {
    ...rest,
    when: when[lang],
    title: title[lang],
    altName: altName?.[lang],
    where: where?.[lang],
    body: body[lang],
    tags: tags[lang],
  };
}

function build(lang: Lang): SiteContent {
  const now = nowSource.map((e) => resolveEntry(e, lang));
  const before = beforeSource.map((e) => resolveEntry(e, lang));
  const awards = awardsSource.map((e) => resolveEntry(e, lang));

  return {
    profile: {
      ...profile,
      location: profileText.location[lang],
      lede: profileText.lede[lang],
      intro: profileText.intro[lang],
      updated: profileText.updated[lang],
    },
    now,
    before,
    awards,
    allEntries: [...now, ...before, ...awards],
    tools: toolsText[lang],
    school: schoolText[lang],
    sections: sectionSource.map((s) => ({ id: s.id, label: s.label[lang] })),
  };
}

// Resolved once per language and shared. The result is read on every render of
// the chart and the palette index, and none of it ever changes.
const resolved: Record<Lang, SiteContent> = { en: build("en"), ko: build("ko") };

export function getContent(lang: Lang): SiteContent {
  return resolved[lang];
}

export function useContent(): SiteContent {
  return resolved[useLang()];
}

/** Earliest month on record, used as the left edge of the concurrency chart. */
export const timelineStart = "2023-01";
