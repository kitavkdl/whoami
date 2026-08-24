import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/study")({
  // The language is in the URL, like the rest of the site, so a link from
  // either version of the front page opens this one to match.
  validateSearch: (search: Record<string, unknown>): { lang: Lang } => ({
    lang: search.lang === "en" ? "en" : "ko",
  }),
  head: () => ({
    meta: [
      { title: "오늘의 학점 운세 · Study Fortune" },
      {
        name: "description",
        content: "과목별 오늘의 학업 운세. 하루에 한 번, 당신의 학점을 점쳐드립니다.",
      },
      { property: "og:title", content: "오늘의 학점 운세" },
      {
        property: "og:description",
        content: "과목 이름을 입력하면 오늘의 학업 운세를 알려드립니다.",
      },
    ],
  }),
  component: StudyPage,
});

// Deterministic hash → seeded fortune per (subject + date)
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function displayDate(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const GRADES = [
  { g: "A+", weight: 12 },
  { g: "A", weight: 16 },
  { g: "A-", weight: 14 },
  { g: "B+", weight: 10 },
  { g: "B", weight: 10 },
  { g: "B-", weight: 8 },
  { g: "C+", weight: 6 },
  { g: "C", weight: 5 },
  { g: "C-", weight: 4 },
  { g: "D", weight: 3 },
  { g: "F", weight: 2 },
];

function pickGrade(seed: number) {
  const total = GRADES.reduce((a, b) => a + b.weight, 0);
  let r = seed % total;
  for (const g of GRADES) {
    if (r < g.weight) return g;
    r -= g.weight;
  }
  return GRADES[1];
}

const MESSAGES: Record<Lang, string[]> = {
  ko: [
    "오늘은 교수님의 눈에 띄는 날입니다. 첫 줄에 앉으세요.",
    "도서관 3층 창가 자리가 당신을 기다립니다.",
    "필기보다 질문이 더 큰 보상을 가져다줍니다.",
    "복습보다 예습, 예습보다 산책. 머리를 비우세요.",
    "팀 프로젝트의 별이 떠오릅니다. 먼저 메시지를 보내세요.",
    "커피 한 잔이 오늘의 집중력을 두 배로 만듭니다.",
    "낯선 카페가 새로운 인사이트를 줄 것입니다.",
    "오늘은 잠을 더 자는 것이 가장 큰 공부입니다.",
    "과제 마감은 지금 시작해야 마음이 가볍습니다.",
    "교수님께 보내는 이메일이 행운을 부릅니다.",
    "오늘의 한 문제가 시험의 절반을 결정합니다.",
    "친구의 노트를 빌리는 대신 당신이 빌려주세요.",
    "복습 30분이 평소의 3시간을 이깁니다.",
    "오답노트를 펴는 순간, 행운이 시작됩니다.",
    "오늘은 손글씨로 정리하면 머리에 더 잘 박힙니다.",
  ],
  en: [
    "You'll catch your professor's eye today. Take the front row.",
    "A window seat on the library's 3rd floor is calling your name.",
    "Today, one good question outweighs ten pages of notes.",
    "Skip the review. Pre-read, then take a walk. Clear your mind.",
    "A group project star is rising. Be the first to message.",
    "One cup of coffee will double your focus today.",
    "An unfamiliar café will hand you a fresh insight.",
    "Today, more sleep is the most productive study session.",
    "Start the assignment now · your evening will thank you.",
    "An email to your professor will summon good fortune.",
    "One problem solved today decides half of your exam.",
    "Instead of borrowing notes, lend yours out.",
    "30 minutes of review beats your usual 3-hour grind.",
    "The moment you open the wrong-answer notebook, luck begins.",
    "Today, handwriting things down will lock them in.",
  ],
};

const ADVICE: Record<Lang, { k: string; v: string[] }[]> = {
  ko: [
    {
      k: "행운의 시간",
      v: [
        "오전 9~11시",
        "오후 2~4시",
        "오후 7~9시",
        "밤 11시~새벽 1시",
        "오전 6~8시",
        "오후 5~6시",
        "자정 12~1시",
        "오전 10시~정오",
      ],
    },
    {
      k: "행운의 장소",
      v: [
        "도서관 3층",
        "학교 근처 카페",
        "기숙사 책상",
        "빈 강의실",
        "학교 정원 벤치",
        "24시간 스터디카페",
        "지하철 2호선 창가",
        "집 책상 앞 창가",
      ],
    },
    {
      k: "행운의 음료",
      v: [
        "아메리카노",
        "녹차 라떼",
        "탄산수",
        "꿀물",
        "아이스티",
        "요거트 스무디",
        "레몬차",
        "쌍화차",
      ],
    },
    {
      k: "피해야 할 것",
      v: [
        "릴스 무한 스크롤",
        "30분 이상의 낮잠",
        "넷플릭스 한 화 더",
        "단톡방 알림",
        "배달 음식 주문하기",
        "침대에서 공부하기",
        "음악 + 가사 영상",
        "오후 3시 커피",
      ],
    },
  ],
  en: [
    {
      k: "Lucky hours",
      v: [
        "9~11 AM",
        "2~4 PM",
        "7~9 PM",
        "11 PM ~ 1 AM",
        "6~8 AM",
        "5~6 PM",
        "12~1 AM",
        "10 AM ~ noon",
      ],
    },
    {
      k: "Lucky place",
      v: [
        "Library, 3rd floor",
        "Café near campus",
        "Dorm desk",
        "Empty classroom",
        "Garden bench",
        "24h study café",
        "Train window seat",
        "Desk by home window",
      ],
    },
    {
      k: "Lucky drink",
      v: [
        "Americano",
        "Matcha latte",
        "Sparkling water",
        "Honey water",
        "Iced tea",
        "Yogurt smoothie",
        "Lemon tea",
        "Ssanghwacha",
      ],
    },
    {
      k: "Avoid today",
      v: [
        "Infinite Reels scroll",
        "Naps over 30 min",
        "One more Netflix episode",
        "Group chat pings",
        "Ordering delivery food",
        "Studying in bed",
        "Music with lyrics",
        "3 PM coffee",
      ],
    },
  ],
};

function fortuneFor(subject: string, lang: Lang) {
  const normalized = subject
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s\p{P}\p{S}_]+/gu, "");
  const key = `${normalized}::${todayKey()}`;
  const seed = hash(key);
  const grade = pickGrade(seed);
  const score = 40 + (seed % 61); // 40~100
  const msgs = MESSAGES[lang];
  const adv = ADVICE[lang];
  const msg = msgs[seed % msgs.length];
  const luck = adv.map((a, i) => ({
    k: a.k,
    v: a.v[(seed >> (i * 3)) % a.v.length],
  }));
  return { grade, score, msg, luck, seed };
}

const LINKS: Record<Lang, { label: string; sub: string; href: string }[]> = {
  ko: [
    { label: "Seek Once", sub: "한 번에 찾기", href: "https://www.seek-once.com/" },
    {
      label: "Brightspace",
      sub: "강의 · 과제",
      href: "https://it.stonybrook.edu/services/brightspace",
    },
    { label: "SOLAR", sub: "수강신청 · 학적", href: "https://it.stonybrook.edu/services/solar" },
  ],
  en: [
    { label: "Seek Once", sub: "Find it in one go", href: "https://www.seek-once.com/" },
    {
      label: "Brightspace",
      sub: "Classes · Assignments",
      href: "https://it.stonybrook.edu/services/brightspace",
    },
    {
      label: "SOLAR",
      sub: "Registration · Records",
      href: "https://it.stonybrook.edu/services/solar",
    },
  ],
};

const T = {
  ko: {
    back: "← 뒤로",
    daily: "오늘 · 하루 한 번",
    eyebrow: "하루에 한 번, 과목 이름으로 보는 오늘의 학점 운세",
    title1: "오늘의",
    titleEm: "학점",
    title2: "운세",
    lede: "과목 이름을 적어보세요. 별과 데이터, 그리고 약간의 미신이 오늘의 학점을 점쳐드립니다. 결과는 자정까지 바뀌지 않습니다.",
    placeholder: "예) 미적분학 II, CSE 214, 서양 미술사",
    inputBadge: "subject",
    submit: "운세 보기",
    resultSubject: "과목",
    resultGrade: "예상 학점",
    luckScore: "행운 지수",
    disclaimer: "* 결과는 과목 이름과 오늘 날짜를 기반으로 결정되며, 자정까지 동일하게 유지됩니다.",
    footer: "jiyul ahn · study",
    ticket: "학점 운세권",
    oracle: "오늘의 한마디",
    serial: "발권번호",
    issued: "발행",
    valid: "유효기간 · 오늘 자정까지",
  },
  en: {
    back: "← back",
    daily: "daily · once a day",
    eyebrow: "one subject, one day, one grade",
    title1: "Today's",
    titleEm: "Grade",
    title2: "Fortune",
    lede: "Type a subject name. The stars, a bit of data, and just enough superstition will read your grade for today. The result stays the same until midnight.",
    placeholder: "e.g. Calculus II, CSE 214, Art History",
    inputBadge: "subject",
    submit: "Read fortune",
    resultSubject: "subject",
    resultGrade: "predicted grade",
    luckScore: "luck score",
    disclaimer:
      "* The result is derived from the subject name and today's date, and stays the same until midnight.",
    footer: "jiyul ahn · study",
    ticket: "grade fortune ticket",
    oracle: "today's note",
    serial: "serial",
    issued: "issued",
    valid: "valid until midnight",
  },
} as const;

function StudyPage() {
  const { lang } = Route.useSearch();
  const navigate = useNavigate();
  const setLang = (next: Lang) =>
    void navigate({ to: "/study", search: { lang: next }, replace: true });

  const [subject, setSubject] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const t = T[lang];
  const fortune = useMemo(
    () => (submitted ? fortuneFor(submitted, lang) : null),
    [submitted, lang],
  );
  const serial = fortune
    ? fortune.seed.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)
    : "·······";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f1ede4] text-[#0b0b0b]">
      {/* Paper texture + halftone */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1.2px)",
          backgroundSize: "6px 6px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto max-w-[1300px] px-5 md:px-10 pb-24">
        {/* Header bar */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-4 py-5 border-b border-[#0b0b0b]/20"
        >
          <a
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] hover:text-[#0b0b0b]/60"
          >
            {t.back}
          </a>
          <div className="hidden md:flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
            <span>{displayDate()}</span>
            <span>·</span>
            <span>{t.daily}</span>
          </div>
          <div
            role="group"
            aria-label="Language"
            className="relative inline-flex items-center border-2 border-[#0b0b0b] bg-[#f1ede4]"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute inset-y-0 w-1/2 bg-[#0b0b0b]"
              style={{ left: lang === "ko" ? 0 : "50%" }}
            />
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`relative z-10 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  lang === l ? "text-[#efc84a]" : "text-[#0b0b0b]"
                }`}
                aria-pressed={lang === l}
              >
                {l === "ko" ? "KR" : "EN"}
              </button>
            ))}
          </div>
        </motion.header>

        {/* HERO · asymmetric editorial grid */}
        <section className="mt-10 md:mt-16 grid grid-cols-12 gap-x-4 gap-y-8">
          <div className="col-span-12 md:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60"
            >
              {t.eyebrow}
            </motion.p>
            <motion.h1
              key={lang}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 font-serif leading-[0.86] tracking-[-0.03em] text-[16vw] md:text-[10.5rem]"
            >
              <span className="block">{t.title1}</span>
              <span className="block relative">
                <em className="italic relative inline-block">
                  <span className="relative z-10">{t.titleEm}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-[-4%] bottom-[12%] h-[34%] -z-0 bg-[#efc84a] -rotate-[1.5deg]"
                  />
                </em>{" "}
                <span className="text-[#0b0b0b]/30">{t.title2}</span>
              </span>
            </motion.h1>
          </div>

          <aside className="col-span-12 md:col-span-4 md:pl-6 md:border-l-2 md:border-[#0b0b0b] flex flex-col justify-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
              ISSUE / {displayDate()}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed md:text-base">{t.lede}</p>
          </aside>
        </section>

        {/* INPUT · brutal stamp form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={(e) => {
            e.preventDefault();
            const s = subject.trim();
            if (s) setSubmitted(s);
          }}
          className="mt-12 md:mt-16 grid grid-cols-12 gap-3"
        >
          <div className="col-span-12 md:col-span-9 relative">
            <span className="absolute -top-3 left-4 bg-[#f1ede4] px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/70">
              {t.inputBadge}
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.placeholder}
              className="w-full border-2 border-[#0b0b0b] bg-[#f6f3eb] px-5 py-5 text-lg md:text-xl outline-none placeholder:text-[#0b0b0b]/30 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="col-span-12 md:col-span-3 group relative border-2 border-[#0b0b0b] bg-[#0b0b0b] px-7 py-5 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#efc84a] transition hover:bg-[#efc84a] hover:text-[#0b0b0b]"
          >
            <span className="relative z-10">{t.submit}</span>
          </button>
        </motion.form>

        {/* RESULT · ticket stub */}
        <AnimatePresence mode="wait">
          {fortune && submitted && (
            <motion.section
              key={submitted + todayKey() + lang}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-14 md:mt-20"
            >
              <div
                className="relative border-2 border-[#0b0b0b] bg-[#f6f3eb]"
                style={{
                  boxShadow: "10px 10px 0 0 #0b0b0b",
                }}
              >
                {/* perforation */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 hidden md:block"
                  style={{
                    top: "auto",
                    bottom: "30%",
                    height: 0,
                    borderTop: "2px dashed #0b0b0b",
                  }}
                />
                {/* notch holes */}
                <span
                  aria-hidden
                  className="hidden md:block absolute -left-[11px] top-[30%] h-5 w-5 rounded-full bg-[#f1ede4] border-2 border-[#0b0b0b]"
                />
                <span
                  aria-hidden
                  className="hidden md:block absolute -right-[11px] top-[30%] h-5 w-5 rounded-full bg-[#f1ede4] border-2 border-[#0b0b0b]"
                />

                {/* header strip */}
                <div className="flex items-center justify-between border-b-2 border-[#0b0b0b] bg-[#0b0b0b] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#efc84a]">
                  <span>{t.ticket}</span>
                  <span className="hidden sm:inline">
                    {t.serial} · {serial}
                  </span>
                  <span>{t.valid}</span>
                </div>

                <div className="grid grid-cols-12 gap-0">
                  {/* Left · subject + message */}
                  <div className="col-span-12 md:col-span-7 p-6 md:p-10 md:border-r-2 md:border-[#0b0b0b]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
                      {t.resultSubject}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl md:text-5xl tracking-tight break-words">
                      {submitted}
                    </h2>

                    <div className="mt-8 border-l-4 border-[#efc84a] pl-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
                        {t.oracle}
                      </p>
                      <p className="mt-2 text-lg md:text-xl leading-snug">“{fortune.msg}”</p>
                    </div>

                    <div className="mt-8 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/70">
                      <span>
                        {t.issued} · {displayDate()}
                      </span>
                      <span className="hidden sm:inline">№ {serial}</span>
                    </div>
                  </div>

                  {/* Right · giant grade stub */}
                  <div className="col-span-12 md:col-span-5 relative p-6 md:p-10 bg-[#efc84a]">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
                      style={{
                        backgroundImage: "radial-gradient(#000 1px, transparent 1.4px)",
                        backgroundSize: "5px 5px",
                      }}
                    />
                    <div className="relative">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/70">
                        {t.resultGrade}
                      </p>
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-2 font-serif leading-[0.82] tracking-[-0.04em] text-[#0b0b0b] text-[10rem] md:text-[14rem]"
                      >
                        {fortune.grade.g}
                      </motion.div>
                      <div className="mt-2 flex items-end justify-between">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/80">
                          {t.luckScore}
                        </div>
                        <div className="font-mono text-xl tracking-tight text-[#0b0b0b]">
                          {fortune.score}
                          <span className="text-[#0b0b0b]/50">/100</span>
                        </div>
                      </div>
                      {/* luck bar */}
                      <div className="mt-2 h-2 w-full border border-[#0b0b0b] bg-[#f6f3eb]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fortune.score}%` }}
                          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-[#0b0b0b]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luck grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-t-2 border-[#0b0b0b]">
                  {fortune.luck.map((l, i) => (
                    <div
                      key={l.k}
                      className={`p-5 md:p-6 ${i < fortune.luck.length - 1 ? "border-r-2 border-[#0b0b0b]" : ""} ${i < 2 ? "border-b-2 md:border-b-0 border-[#0b0b0b]" : ""}`}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
                        0{i + 1} / {l.k}
                      </p>
                      <p className="mt-2 text-lg leading-snug">{l.v}</p>
                    </div>
                  ))}
                </div>

                <p className="border-t-2 border-[#0b0b0b] bg-[#f1ede4] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
                  {t.disclaimer}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Links · index card row */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          {LINKS[lang].map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative border-2 border-[#0b0b0b] bg-[#f6f3eb] p-6 transition hover:bg-[#efc84a] hover:-translate-y-1 hover:[box-shadow:6px_6px_0_0_#0b0b0b]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
                0{i + 1} / {l.sub}
              </p>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-serif text-2xl tracking-tight">{l.label}</span>
                <span className="font-mono text-lg transition group-hover:translate-x-1">↗</span>
              </div>
            </a>
          ))}
        </motion.nav>

        {/* Footer mark */}
        <div className="mt-16 flex items-center justify-between border-t-2 border-[#0b0b0b] pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0b0b0b]/60">
          <span>{t.footer}</span>
          <span>{displayDate()}</span>
        </div>
      </div>
    </main>
  );
}
