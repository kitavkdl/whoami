import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "오늘의 학점 운세 — Study Fortune" },
      { name: "description", content: "과목별 오늘의 학업 운세. 하루에 한 번, 당신의 학점을 점쳐드립니다." },
      { property: "og:title", content: "오늘의 학점 운세" },
      { property: "og:description", content: "과목 이름을 입력하면 오늘의 학업 운세를 알려드립니다." },
    ],
  }),
  component: StudyPage,
});

type Lang = "ko" | "en";

// Deterministic hash → seeded fortune per (subject + date)
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const GRADES = [
  { g: "A+", weight: 4, tone: "from-emerald-300 via-teal-200 to-cyan-300" },
  { g: "A",  weight: 8, tone: "from-emerald-200 via-green-200 to-lime-200" },
  { g: "A-", weight: 10, tone: "from-lime-200 via-green-200 to-emerald-200" },
  { g: "B+", weight: 14, tone: "from-amber-200 via-yellow-200 to-lime-200" },
  { g: "B",  weight: 16, tone: "from-amber-200 via-orange-200 to-yellow-200" },
  { g: "B-", weight: 12, tone: "from-orange-200 via-amber-300 to-yellow-300" },
  { g: "C+", weight: 10, tone: "from-orange-300 via-rose-200 to-amber-200" },
  { g: "C",  weight: 9,  tone: "from-rose-300 via-pink-200 to-orange-200" },
  { g: "C-", weight: 6,  tone: "from-rose-400 via-pink-300 to-rose-200" },
  { g: "D",  weight: 6,  tone: "from-rose-500 via-red-300 to-rose-300" },
  { g: "F",  weight: 5,  tone: "from-zinc-500 via-rose-400 to-zinc-300" },
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
    "Start the assignment now — your evening will thank you.",
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
    { k: "행운의 시간", v: ["오전 9–11시", "오후 2–4시", "오후 7–9시", "밤 11시–새벽 1시"] },
    { k: "행운의 장소", v: ["도서관 3층", "학교 근처 카페", "기숙사 책상", "빈 강의실"] },
    { k: "행운의 음료", v: ["아메리카노", "녹차 라떼", "탄산수", "꿀물"] },
    { k: "피해야 할 것", v: ["릴스 무한 스크롤", "30분 이상의 낮잠", "넷플릭스 한 화 더", "단톡방 알림"] },
  ],
  en: [
    { k: "Lucky hours", v: ["9–11 AM", "2–4 PM", "7–9 PM", "11 PM – 1 AM"] },
    { k: "Lucky place", v: ["Library, 3rd floor", "Café near campus", "Dorm desk", "Empty classroom"] },
    { k: "Lucky drink", v: ["Americano", "Matcha latte", "Sparkling water", "Honey water"] },
    { k: "Avoid today", v: ["Infinite Reels scroll", "Naps over 30 min", "One more Netflix episode", "Group chat pings"] },
  ],
};

function fortuneFor(subject: string, lang: Lang) {
  // Normalize: lowercase + strip all whitespace/punctuation so
  // "cse113", "cse 113", "CSE-113", "Cse 113" all map to the same seed.
  const normalized = subject
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s\p{P}\p{S}_]+/gu, "");
  const key = `${normalized}::${todayKey()}`;
  const seed = hash(key);
  const grade = pickGrade(seed);
  const score = 40 + (seed % 61); // 40–100
  const msgs = MESSAGES[lang];
  const adv = ADVICE[lang];
  const msg = msgs[seed % msgs.length];
  const luck = adv.map((a, i) => ({
    k: a.k,
    v: a.v[(seed >> (i * 3)) % a.v.length],
  }));
  return { grade, score, msg, luck };
}

const LINKS: Record<Lang, { label: string; sub: string; href: string }[]> = {
  ko: [
    { label: "Seek Once", sub: "한 번에 찾기", href: "https://www.seek-once.com/" },
    { label: "Brightspace", sub: "강의 · 과제", href: "https://it.stonybrook.edu/services/brightspace" },
    { label: "SOLAR", sub: "수강신청 · 학적", href: "https://it.stonybrook.edu/services/solar" },
  ],
  en: [
    { label: "Seek Once", sub: "Find it in one go", href: "https://www.seek-once.com/" },
    { label: "Brightspace", sub: "Classes · Assignments", href: "https://it.stonybrook.edu/services/brightspace" },
    { label: "SOLAR", sub: "Registration · Records", href: "https://it.stonybrook.edu/services/solar" },
  ],
};

const T = {
  ko: {
    back: "← 뒤로",
    daily: "오늘 · 하루 한 번",
    eyebrow: "today's academic fortune",
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
    footer: "ideantoe · study",
  },
  en: {
    back: "← back",
    daily: "daily · once a day",
    eyebrow: "today's academic fortune",
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
    disclaimer: "* The result is derived from the subject name and today's date, and stays the same until midnight.",
    footer: "ideantoe · study",
  },
} as const;

function StudyPage() {
  const [lang, setLang] = useState<Lang>("ko");
  const [subject, setSubject] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const t = T[lang];
  const fortune = useMemo(
    () => (submitted ? fortuneFor(submitted, lang) : null),
    [submitted, lang],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0c] text-white">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-[-10%] h-[60vh] w-[60vh] rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="absolute -right-32 top-[20%] h-[55vh] w-[55vh] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-1/3 bottom-[-10%] h-[55vh] w-[55vh] rounded-full bg-cyan-400/15 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16 md:px-10 md:py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4"
        >
          <a href="/" className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white">
            {t.back}
          </a>
          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div
              role="group"
              aria-label="Language"
              className="relative inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-white"
                style={{ left: lang === "ko" ? "0.25rem" : "calc(50%)" }}
              />
              {(["ko", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`relative z-10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors ${
                    lang === l ? "text-black" : "text-white/60 hover:text-white"
                  }`}
                  aria-pressed={lang === l}
                >
                  {l === "ko" ? "KR" : "EN"}
                </button>
              ))}
            </div>
            <span className="hidden text-[10px] uppercase tracking-[0.35em] text-white/40 sm:inline">
              {todayKey()} · {t.daily}
            </span>
          </div>
        </motion.header>

        {/* Hero */}
        <section className="mt-16 md:mt-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/50"
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            key={lang}
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl"
            style={{ fontFamily: "'Syne', serif" }}
          >
            {t.title1} <em className="italic text-white/70">{t.titleEm}</em> {t.title2}
          </motion.h1>
          <motion.p
            key={lang + "-lede"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 md:text-base"
          >
            {t.lede}
          </motion.p>
        </section>

        {/* Input */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={(e) => {
            e.preventDefault();
            const s = subject.trim();
            if (s) setSubmitted(s);
          }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.placeholder}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-base text-white placeholder:text-white/30 outline-none backdrop-blur-xl transition focus:border-white/40 focus:bg-white/[0.06]"
            />
            <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
              {t.inputBadge}
            </span>
          </div>
          <button
            type="submit"
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white px-7 py-4 text-sm font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
          >
            <span className="relative z-10">{t.submit}</span>
          </button>
        </motion.form>

        {/* Result */}
        <AnimatePresence mode="wait">
          {fortune && submitted && (
            <motion.section
              key={submitted + todayKey() + lang}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-14"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl md:p-12">
                <div
                  className={`pointer-events-none absolute -inset-32 -z-10 bg-gradient-to-br ${fortune.grade.tone} opacity-[0.18] blur-3xl`}
                />
                <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                      {t.resultSubject}
                    </p>
                    <h2 className="mt-2 truncate text-2xl font-medium md:text-3xl">{submitted}</h2>
                    <p className="mt-8 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
                      “{fortune.msg}”
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                      {t.resultGrade}
                    </p>
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={`mt-3 bg-gradient-to-br ${fortune.grade.tone} bg-clip-text font-serif text-[7rem] leading-none tracking-tight text-transparent md:text-[10rem]`}
                      style={{ fontFamily: "'Syne', serif" }}
                    >
                      {fortune.grade.g}
                    </motion.div>
                    <div className="mt-2 font-mono text-xs text-white/50">
                      {t.luckScore} · {fortune.score}/100
                    </div>
                  </div>
                </div>

                {/* Luck grid */}
                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
                  {fortune.luck.map((l) => (
                    <div key={l.k} className="bg-[#0a0a0c] px-5 py-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                        {l.k}
                      </p>
                      <p className="mt-2 text-sm text-white/90">{l.v}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-[11px] text-white/40">{t.disclaimer}</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Bottom redirect buttons */}
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {LINKS[lang].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition group-hover:from-fuchsia-500/10 group-hover:to-cyan-400/10 group-hover:opacity-100" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                {l.sub}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-medium tracking-tight">{l.label}</span>
                <span className="text-white/40 transition group-hover:translate-x-1 group-hover:text-white">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </motion.nav>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
          {t.footer}
        </p>
      </div>
    </main>
  );
}
