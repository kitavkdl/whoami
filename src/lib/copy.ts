/**
 * Every string the interface says, in both languages.
 *
 * Prose about the work lives in lib/content; this is the furniture around it —
 * buttons, the console, the palette, the keyboard sheet. Anything a reader
 * types stays in English on both sides: console command names and the field
 * keys in the virtual filesystem are an interface, not copy.
 */

import { useLang, type L, type Lang } from "@/lib/i18n";

type Keyed = Record<string, string>;

export type Copy = {
  skipToContent: string;
  keysHint: string;
  language: string;

  theme: { system: string; light: string; dark: string };

  masthead: { emailMe: string; copyAddress: string; printResume: string; emailCopied: string };

  clock: {
    /** Korean puts the place first, English trails it after the time. */
    prefix: string;
    suffix: string;
    moods: {
      lateNight: string;
      asleep: string;
      morning: string;
      desk: string;
      lunch: string;
      evening: string;
    };
    ahead: (hours: number) => string;
    behind: (hours: number) => string;
  };

  topBar: { search: string };

  overlapCaption: string;

  consoleIntro: { lead: string; tail: string; end: string };

  contact: {
    email: string;
    phone: string;
    smsOnly: string;
    elsewhere: string;
    emailNote: string;
    languages: string;
  };

  footer: { before: (updated: string) => string; studyLink: string; after: string; built: string };

  palette: {
    placeholder: string;
    empty: (query: string) => string;
    groups: { Sections: string; Work: string; Actions: string; Elsewhere: string };
    sectionHint: string;
    move: string;
    open: string;
    results: (n: number) => string;
    theme: string;
    themeHint: string;
    copyEmail: string;
    toConsole: string;
    toConsoleHint: string;
    neofetch: string;
    neofetchHint: string;
    print: string;
    printHint: string;
    shortcuts: string;
    switchLanguage: string;
    switchLanguageHint: string;
    writeEmail: string;
    study: string;
  };

  shortcuts: {
    title: string;
    close: string;
    groups: { title: string; rows: [string[], string][] }[];
  };

  console: {
    commands: Keyed;
    banner: string[];
    helpFooter: string;
    tabCompletes: string;
    clear: string;
    outputLabel: string;
    inputLabel: string;
    lsMissing: (arg: string) => string;
    cdNotDir: (arg: string) => string;
    catWhich: string;
    catMissing: (arg: string) => string;
    catIsDir: (arg: string) => string;
    grepNeed: string;
    grepNone: (arg: string) => string;
    grepMore: (count: number) => string;
    opening: (target: string) => string;
    openUnknown: (target: string, list: string) => string;
    copied: (email: string) => string;
    themeIs: (pref: string, resolved: string) => string;
    themePick: (list: string) => string;
    langPick: (list: string) => string;
    themeSet: (value: string) => string;
    gotoTry: (list: string) => string;
    resume: string;
    uptime: (seconds: number) => string;
    notACommand: (command: string, guess?: string) => string;
  };

  notFound: { title: string; body: string; back: string };
  error: { title: string; body: string; retry: string; back: string };

  meta: { title: string; description: string; ogDescription: string; studyBlurb: string };

  /** The masthead leads with the name in the reader's script. */
  name: { primary: string; secondary: string };
};

const en: Copy = {
  skipToContent: "Skip to the content",
  keysHint: "Press ? for keys",
  language: "Language",

  theme: { system: "Following the system", light: "Light", dark: "Dark" },

  masthead: {
    emailMe: "Email me",
    copyAddress: "Copy address",
    printResume: "Print as resume",
    emailCopied: "Email copied",
  },

  clock: {
    prefix: "",
    suffix: " in Stony Brook",
    moods: {
      lateNight: "still up, apparently",
      asleep: "asleep, one would hope",
      morning: "morning here",
      desk: "at the desk",
      lunch: "lunch, probably",
      evening: "evening here",
    },
    ahead: (h) => `${h}h ahead of you`,
    behind: (h) => `${h}h behind you`,
  },

  topBar: { search: "search" },

  overlapCaption:
    "Everything above, on one axis. The overlaps are the honest part: four ran at once in late 2025, four again in the spring. Two are still going. The dashed line is today.",

  consoleIntro: {
    lead: "Everything above is also a filesystem. This reads it. It is not a recording of a terminal, it is a small one:",
    tail: ", tab completion, and a history you can walk back through. Start with",
    end: ".",
  },

  contact: {
    email: "Email",
    phone: "Phone",
    smsOnly: "text only",
    elsewhere: "Elsewhere",
    emailNote: " is the reliable one.",
    languages: "Korean or English, either is fine.",
  },

  footer: {
    before: (updated) => `Updated ${updated}. There is also `,
    studyLink: "오늘의 학점 운세",
    after: ", a grade fortune-teller I wrote for no good reason.",
    built:
      "Built with TanStack Start and Tailwind. The page, the console and the command palette all read from one content file, so none of them can drift out of sync with the others.",
  },

  palette: {
    placeholder: "Jump to anything",
    empty: (query) => `Nothing matches “${query}”.`,
    groups: { Sections: "Sections", Work: "Work", Actions: "Actions", Elsewhere: "Elsewhere" },
    sectionHint: "section",
    move: "↑↓ move",
    open: "↵ open",
    results: (n) => `${n} results`,
    theme: "Switch theme",
    themeHint: "system · light · dark",
    copyEmail: "Copy email address",
    toConsole: "Jump to the console",
    toConsoleHint: "and start typing",
    neofetch: "Run neofetch",
    neofetchHint: "in the console",
    print: "Print as a resume",
    printHint: "the layout changes for paper",
    shortcuts: "Keyboard shortcuts",
    switchLanguage: "한국어로 보기",
    switchLanguageHint: "/ko",
    writeEmail: "Write an email",
    study: "오늘의 학점 운세",
  },

  shortcuts: {
    title: "Keyboard",
    close: "close",
    groups: [
      {
        title: "Anywhere",
        rows: [
          [["⌘", "K"], "Open the command palette"],
          [["/"], "Same thing, one key"],
          [["?"], "This sheet"],
          [["t"], "Cycle the theme"],
          [["p"], "Print as a resume"],
          [["Esc"], "Close whatever is open"],
        ],
      },
      {
        title: "Moving around",
        rows: [
          [["j"], "Next section"],
          [["k"], "Previous section"],
          [["g", "h"], "Back to the top"],
          [["g", "n"], "Now"],
          [["g", "o"], "Overlap"],
          [["g", "b"], "Before"],
          [["g", "a"], "Awards & certs"],
          [["g", "c"], "Contact"],
          [["g", "k"], "The console"],
        ],
      },
      {
        title: "In the console",
        rows: [
          [["Tab"], "Complete a command or a path"],
          [["↑", "↓"], "Walk back through history"],
          [["Ctrl", "L"], "Clear the scrollback"],
          [["Ctrl", "U"], "Kill the line"],
          [["Ctrl", "C"], "Cancel it"],
        ],
      },
    ],
  },

  console: {
    commands: {
      help: "this list",
      ls: "list a directory",
      cd: "change directory",
      pwd: "where you are",
      cat: "print a file",
      tree: "the whole thing at once",
      grep: "search every file",
      whoami: "the short version",
      date: "the time in Stony Brook",
      open: "open a link — site, study, email",
      email: "copy the address to your clipboard",
      theme: "light, dark, or system",
      lang: "en or ko",
      goto: "scroll the page to a section",
      neofetch: "the obligatory one",
      resume: "print this page as a resume",
      history: "what you have typed",
      echo: "say it back",
      clear: "wipe the scrollback",
    },
    banner: [
      "jiyul-ahn — console",
      "Not a picture of a terminal. It reads the same file the page above does.",
      "help lists the commands · tab completes · ↑ recalls",
    ],
    helpFooter: "Ctrl+L clears · Ctrl+U kills the line · Ctrl+C cancels it",
    tabCompletes: "tab completes",
    clear: "clear",
    outputLabel: "Console output",
    inputLabel: "Console input",
    lsMissing: (arg) => `ls: ${arg}: no such file or directory`,
    cdNotDir: (arg) => `cd: ${arg}: not a directory`,
    catWhich: "cat: which file? try tree",
    catMissing: (arg) => `cat: ${arg}: no such file`,
    catIsDir: (arg) => `cat: ${arg}: that is a directory`,
    grepNeed: "grep: give me something to look for",
    grepNone: (arg) => `grep: no match for ${arg}`,
    grepMore: (count) => `… and ${count} more`,
    opening: (target) => `opening ${target}`,
    openUnknown: (target, list) => `open: nothing called ${target}. try: ${list}`,
    copied: (email) => `copied ${email}`,
    themeIs: (pref, resolved) => `theme is ${pref} (currently ${resolved})`,
    themePick: (list) => `theme: pick one of ${list}`,
    langPick: (list) => `lang: pick one of ${list}`,
    themeSet: (value) => `theme set to ${value}`,
    gotoTry: (list) => `goto: try one of ${list}`,
    resume: "handing this page to the printer — the layout changes for paper",
    uptime: (seconds) =>
      seconds < 60
        ? `${seconds}s on this page`
        : `${Math.floor(seconds / 60)}m ${seconds % 60}s on this page`,
    notACommand: (command, guess) =>
      `${command}: not a command${guess ? `. did you mean ${guess}?` : ""}`,
  },

  notFound: {
    title: "Not here",
    body: "That page doesn't exist, or it used to and doesn't anymore.",
    back: "Back to the front page",
  },
  error: {
    title: "Something broke",
    body: "This one is on my side. Reloading usually does it.",
    retry: "Try again",
    back: "Back to the front page",
  },

  meta: {
    title: "Jiyul Ahn",
    description:
      "Jiyul Ahn · developer in Stony Brook, New York. SeekOnce, Odoo implementation projects, and a computer science degree at Stony Brook.",
    ogDescription: "Developer in Stony Brook, New York. Currently building SeekOnce.",
    studyBlurb: "A grade fortune-teller, written for no good reason.",
  },

  name: { primary: "Jiyul Ahn", secondary: "안지율" },
};

const ko: Copy = {
  skipToContent: "본문으로 건너뛰기",
  keysHint: "? 를 누르면 단축키",
  language: "언어",

  theme: { system: "시스템 설정을 따름", light: "라이트", dark: "다크" },

  masthead: {
    emailMe: "메일 보내기",
    copyAddress: "주소 복사",
    printResume: "이력서로 인쇄",
    emailCopied: "이메일 주소를 복사했다",
  },

  clock: {
    prefix: "스토니브룩 ",
    suffix: "",
    moods: {
      lateNight: "아직 안 잔 모양",
      asleep: "자고 있기를",
      morning: "여기는 아침",
      desk: "책상 앞",
      lunch: "아마 점심",
      evening: "여기는 저녁",
    },
    ahead: (h) => `당신보다 ${h}시간 빠름`,
    behind: (h) => `당신보다 ${h}시간 느림`,
  },

  topBar: { search: "검색" },

  overlapCaption:
    "위의 모든 것을 하나의 축에 올렸다. 겹치는 부분이 정직한 쪽이다. 2025년 늦가을에 네 개가 동시에 돌았고, 봄에 다시 네 개였다. 지금 돌아가는 건 두 개. 점선이 오늘이다.",

  consoleIntro: {
    lead: "위에 있는 것들은 파일시스템이기도 하다. 이 콘솔은 그것을 읽는다. 터미널을 찍어 둔 그림이 아니라 작은 터미널이다:",
    tail: ", 탭 완성, 그리고 되짚어 볼 수 있는 히스토리. 시작은",
    end: " 부터.",
  },

  contact: {
    email: "이메일",
    phone: "전화",
    smsOnly: "문자만",
    elsewhere: "그 밖에",
    emailNote: " — 이쪽이 가장 확실하다.",
    languages: "한국어든 영어든 괜찮다.",
  },

  footer: {
    before: (updated) => `${updated} 갱신. 별 이유 없이 만든 `,
    studyLink: "오늘의 학점 운세",
    after: "도 있다.",
    built:
      "TanStack Start와 Tailwind로 만들었다. 페이지와 콘솔과 커맨드 팔레트가 모두 하나의 콘텐츠 파일을 읽기 때문에, 셋이 서로 어긋날 수가 없다.",
  },

  palette: {
    placeholder: "무엇이든 찾기",
    empty: (query) => `“${query}”에 맞는 것이 없다.`,
    groups: { Sections: "섹션", Work: "이력", Actions: "동작", Elsewhere: "바로가기" },
    sectionHint: "섹션",
    move: "↑↓ 이동",
    open: "↵ 열기",
    results: (n) => `${n}개`,
    theme: "테마 바꾸기",
    themeHint: "시스템 · 라이트 · 다크",
    copyEmail: "이메일 주소 복사",
    toConsole: "콘솔로 이동",
    toConsoleHint: "가서 바로 입력",
    neofetch: "neofetch 실행",
    neofetchHint: "콘솔에서",
    print: "이력서로 인쇄",
    printHint: "종이에 맞춰 레이아웃이 바뀐다",
    shortcuts: "키보드 단축키",
    switchLanguage: "View in English",
    switchLanguageHint: "/",
    writeEmail: "메일 쓰기",
    study: "오늘의 학점 운세",
  },

  shortcuts: {
    title: "키보드",
    close: "닫기",
    groups: [
      {
        title: "어디서나",
        rows: [
          [["⌘", "K"], "커맨드 팔레트 열기"],
          [["/"], "같은 것, 한 글자로"],
          [["?"], "이 창"],
          [["t"], "테마 순환"],
          [["p"], "이력서로 인쇄"],
          [["Esc"], "열려 있는 것 닫기"],
        ],
      },
      {
        title: "이동",
        rows: [
          [["j"], "다음 섹션"],
          [["k"], "이전 섹션"],
          [["g", "h"], "맨 위로"],
          [["g", "n"], "지금"],
          [["g", "o"], "겹침"],
          [["g", "b"], "이전"],
          [["g", "a"], "수상 · 자격"],
          [["g", "c"], "연락"],
          [["g", "k"], "콘솔"],
        ],
      },
      {
        title: "콘솔에서",
        rows: [
          [["Tab"], "명령이나 경로 완성"],
          [["↑", "↓"], "히스토리 되짚기"],
          [["Ctrl", "L"], "스크롤백 지우기"],
          [["Ctrl", "U"], "줄 지우기"],
          [["Ctrl", "C"], "취소"],
        ],
      },
    ],
  },

  console: {
    commands: {
      help: "이 목록",
      ls: "디렉터리 보기",
      cd: "디렉터리 이동",
      pwd: "지금 위치",
      cat: "파일 출력",
      tree: "전체를 한 번에",
      grep: "모든 파일 검색",
      whoami: "짧은 소개",
      date: "스토니브룩의 시각",
      open: "링크 열기 — site, study, email",
      email: "주소를 클립보드로",
      theme: "light, dark, system",
      lang: "en 또는 ko",
      goto: "섹션으로 스크롤",
      neofetch: "그 흔한 것",
      resume: "이 페이지를 이력서로 인쇄",
      history: "지금까지 입력한 것",
      echo: "그대로 되돌려 준다",
      clear: "스크롤백 비우기",
    },
    banner: [
      "jiyul-ahn — console",
      "터미널을 찍어 둔 그림이 아니다. 위의 페이지와 같은 파일을 읽는다.",
      "help 로 명령 목록 · tab 으로 완성 · ↑ 로 히스토리",
    ],
    helpFooter: "Ctrl+L 지우기 · Ctrl+U 줄 지우기 · Ctrl+C 취소",
    tabCompletes: "탭 완성",
    clear: "지우기",
    outputLabel: "콘솔 출력",
    inputLabel: "콘솔 입력",
    lsMissing: (arg) => `ls: ${arg}: 그런 파일이나 디렉터리가 없다`,
    cdNotDir: (arg) => `cd: ${arg}: 디렉터리가 아니다`,
    catWhich: "cat: 어떤 파일? tree 를 먼저",
    catMissing: (arg) => `cat: ${arg}: 그런 파일이 없다`,
    catIsDir: (arg) => `cat: ${arg}: 그건 디렉터리다`,
    grepNeed: "grep: 찾을 것을 알려 달라",
    grepNone: (arg) => `grep: ${arg} 에 맞는 것이 없다`,
    grepMore: (count) => `… 그리고 ${count}개 더`,
    opening: (target) => `${target} 여는 중`,
    openUnknown: (target, list) => `open: ${target} 라는 건 없다. 가능한 것: ${list}`,
    copied: (email) => `${email} 복사함`,
    themeIs: (pref, resolved) => `테마는 ${pref} (지금은 ${resolved})`,
    themePick: (list) => `theme: ${list} 중 하나`,
    langPick: (list) => `lang: ${list} 중 하나`,
    themeSet: (value) => `테마를 ${value} 로`,
    gotoTry: (list) => `goto: ${list} 중 하나`,
    resume: "이 페이지를 프린터로 넘긴다 — 종이에 맞춰 레이아웃이 바뀐다",
    uptime: (seconds) =>
      seconds < 60
        ? `이 페이지에서 ${seconds}초`
        : `이 페이지에서 ${Math.floor(seconds / 60)}분 ${seconds % 60}초`,
    notACommand: (command, guess) =>
      `${command}: 그런 명령은 없다${guess ? `. ${guess} 말인가?` : ""}`,
  },

  notFound: {
    title: "여기엔 없다",
    body: "그런 페이지는 없다. 아니면 예전엔 있었고 지금은 없다.",
    back: "첫 페이지로",
  },
  error: {
    title: "무언가 고장났다",
    body: "이건 내 쪽 문제다. 새로고침하면 대개 해결된다.",
    retry: "다시 시도",
    back: "첫 페이지로",
  },

  meta: {
    title: "안지율",
    description:
      "안지율 · 뉴욕 스토니브룩의 개발자. SeekOnce, Odoo 구축 프로젝트, 그리고 스토니브룩 대학교 컴퓨터과학 전공.",
    ogDescription: "뉴욕 스토니브룩의 개발자. 지금은 SeekOnce를 만든다.",
    studyBlurb: "별 이유 없이 만든 학점 운세.",
  },

  name: { primary: "안지율", secondary: "Jiyul Ahn" },
};

const copy: L<Copy> = { en, ko };

export function getCopy(lang: Lang): Copy {
  return copy[lang];
}

export function useCopy(): Copy {
  return copy[useLang()];
}
