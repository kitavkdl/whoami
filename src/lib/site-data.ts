/**
 * The content file, and the rules for changing it.
 *
 * Every word on this site that is about the work — as opposed to the furniture
 * around it, which lives in lib/copy — is in content/site.json. That file is
 * the one thing edit mode writes and the one thing publishing commits.
 *
 * A change is never applied in place. It is recorded as a draft keyed by a
 * content path (see PATHS below), and `applyDrafts` folds a set of drafts over
 * the file to produce a new one. The page renders the result of that fold and
 * publishing commits the result of the same fold, run on the server against
 * whatever the repository currently holds. So what a line looks like while it
 * is being written is what lands in the commit, and there is no second code
 * path that could disagree with the first.
 */

import raw from "../../content/site.json";
import type { L, Lang } from "@/lib/i18n";

export type EntryKind = "product" | "work" | "award";
export type EntrySection = "now" | "before" | "awards";

export type SectionId =
  | "now"
  | "overlap"
  | "before"
  | "awards"
  | "tools"
  | "school"
  | "contact"
  | "console";

export type PhoneSource = { label: string; href: string; smsOnly?: boolean };

/**
 * The long-form page behind an entry. Kept in the file but not rendered: the
 * route and the component that read it live on the archive/note-pages branch.
 */
export type NoteSource = { lede: L; body: L<string[]> };

/**
 * A photograph under an entry. The file itself sits in public/media, so a
 * picture is swapped by replacing a file rather than by rebuilding anything.
 */
export type ImageSource = {
  /** Path from the site root. */
  src: string;
  alt: L;
  /** Where a thumbnail holds its crop. Centred unless a picture needs its head. */
  focus?: "top";
};

export type EntrySource = {
  /** Stable slug: the anchor on the page and the console filename. */
  id: string;
  section: EntrySection;
  kind: EntryKind;
  /** YYYY-MM, inclusive. Drives the concurrency chart. */
  start: string;
  /** YYYY-MM, inclusive. Omitted means still running. */
  end?: string;
  href?: string;
  when: L;
  title: L;
  altName?: L;
  where?: L;
  tags: L<string[]>;
  body: L<string[]>;
  images?: ImageSource[];
  note: NoteSource;
};

export type SiteData = {
  version: number;
  profile: {
    name: string;
    hangul: string;
    timeZone: string;
    email: string;
    phones: PhoneSource[];
    site: { label: string; href: string };
    location: L;
    lede: L;
    intro: L;
    updated: L;
  };
  sections: { id: SectionId; label: L }[];
  entries: EntrySource[];
  tools: L;
  school: L;
};

export const siteData = raw as SiteData;

/* -------------------------------------------------------------------------- */
/* Content paths                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A path names one editable thing. Most are per-language; the handful that
 * read the same in Korean and English — a name, an address, a phone number —
 * carry the `shared.` prefix and are stored once rather than twice.
 */
export const SHARED_PREFIX = "shared.";

export function isSharedPath(path: string): boolean {
  return path.startsWith(SHARED_PREFIX);
}

/** The storage key: the language, or a star for the language-independent ones. */
export function draftKey(lang: Lang, path: string): string {
  return `${isSharedPath(path) ? "*" : lang}/${path}`;
}

/** Both halves of an entry path, built in one place so they cannot drift. */
export function entryPath(id: string, field: string): string {
  return `entry.${id}.${field}`;
}

/** Kept for drafts written before bodies were stored whole. Read, never written. */
export function legacyBodyPath(id: string, index: number): string {
  return entryPath(id, `body.${index}`);
}

export function notePath(id: string, field: string): string {
  return `note.${id}.${field}`;
}

export function sectionPath(id: string): string {
  return `section.${id}`;
}

/** Paragraphs are stored as one value, so adding and deleting one is an edit. */
export const PARAGRAPH_SEPARATOR = "\n\n";

export function joinParagraphs(paragraphs: readonly string[]): string {
  return paragraphs.join(PARAGRAPH_SEPARATOR);
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function joinTags(tags: readonly string[]): string {
  return tags.join(", ");
}

export function splitTags(text: string): string[] {
  return text
    .split(/[,·]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Applying drafts                                                            */
/* -------------------------------------------------------------------------- */

export type Drafts = Readonly<Record<string, string>>;

function parseKey(key: string): { lang: Lang | "*"; path: string } | null {
  const slash = key.indexOf("/");
  if (slash <= 0) return null;
  const lang = key.slice(0, slash);
  if (lang !== "en" && lang !== "ko" && lang !== "*") return null;
  return { lang, path: key.slice(slash + 1) };
}

function setL(target: L | undefined, lang: Lang | "*", value: string): L | undefined {
  if (!target || lang === "*") return target;
  target[lang] = value;
  return target;
}

/**
 * Folds one draft into the data. Returns false when the path names nothing —
 * a draft left over from an entry that has since been deleted, say — so the
 * caller can drop it rather than carry it forever.
 */
function applyOne(data: SiteData, lang: Lang | "*", path: string, value: string): boolean {
  const text = value.trim();

  if (isSharedPath(path)) {
    const rest = path.slice(SHARED_PREFIX.length);
    const phone = /^profile\.phone\.(\d+)\.label$/.exec(rest);
    if (phone) {
      const target = data.profile.phones[Number(phone[1])];
      if (!target) return false;
      target.label = text;
      // The link is not prose, so it is derived rather than edited: a number
      // corrected on the page must not leave tel: pointing at the old one.
      const dialable = text.replace(/[^\d+]/g, "");
      if (dialable) target.href = `tel:${dialable}`;
      return true;
    }
    switch (rest) {
      case "profile.name":
        data.profile.name = text;
        return true;
      case "profile.hangul":
        data.profile.hangul = text;
        return true;
      case "profile.email":
        data.profile.email = text;
        return true;
      case "profile.site.label":
        data.profile.site.label = text;
        return true;
      default:
        return false;
    }
  }

  if (lang === "*") return false;

  switch (path) {
    case "tools":
      data.tools[lang] = text;
      return true;
    case "school":
      data.school[lang] = text;
      return true;
    case "profile.location":
    case "profile.lede":
    case "profile.intro":
    case "profile.updated": {
      const field = path.slice("profile.".length) as "location" | "lede" | "intro" | "updated";
      data.profile[field][lang] = text;
      return true;
    }
  }

  const section = /^section\.([\w-]+)$/.exec(path);
  if (section) {
    const target = data.sections.find((s) => s.id === section[1]);
    if (!target) return false;
    target.label[lang] = text;
    return true;
  }

  const entry = /^entry\.([\w-]+)\.(.+)$/.exec(path);
  if (entry) {
    const target = data.entries.find((e) => e.id === entry[1]);
    if (!target) return false;
    const field = entry[2];

    switch (field) {
      case "when":
      case "title":
        target[field][lang] = text;
        return true;
      case "altName":
      case "where":
        // An optional line can be written into existence, but not out of it:
        // an empty edit is a misclick, and saveEdit drops it before here.
        target[field] = setL(target[field] ?? { en: "", ko: "" }, lang, text);
        return true;
      case "body":
        target.body[lang] = splitParagraphs(value);
        return true;
      case "tags":
        target.tags[lang] = splitTags(text);
        return true;
    }

    // A per-paragraph draft from before bodies were stored whole.
    const paragraph = /^body\.(\d+)$/.exec(field);
    if (paragraph) {
      const index = Number(paragraph[1]);
      if (index >= target.body[lang].length) return false;
      target.body[lang][index] = text;
      return true;
    }

    return false;
  }

  const note = /^note\.([\w-]+)\.(.+)$/.exec(path);
  if (note) {
    const target = data.entries.find((e) => e.id === note[1]);
    if (!target) return false;

    if (note[2] === "lede") {
      target.note.lede[lang] = text;
      return true;
    }
    if (note[2] === "body") {
      target.note.body[lang] = splitParagraphs(value);
      return true;
    }
    return false;
  }

  return false;
}

export type ApplyResult = {
  data: SiteData;
  /** Paths that landed. */
  applied: string[];
  /** Draft keys that named nothing, so nothing was written. */
  orphaned: string[];
};

/**
 * A copy of the content with every draft folded in, and a note of which drafts
 * had somewhere to go. The input is never touched: the imported JSON module is
 * shared across every render on the server, so writing to it would leak one
 * reader's unpublished edits into the next reader's page.
 */
export function applyDraftsVerbose(data: SiteData, drafts: Drafts): ApplyResult {
  const next = structuredClone(data);
  const applied: string[] = [];
  const orphaned: string[] = [];

  // The per-paragraph drafts go first so that a whole-body draft written after
  // them lands on top. A browser can hold both kinds — the indexed ones were
  // written before bodies were stored whole — and applying them the other way
  // round would let a stale paragraph reappear inside a rewritten body.
  const indexed = (key: string) => Number(/\.body\.\d+$/.test(key));
  const keys = Object.keys(drafts).sort((a, b) => indexed(b) - indexed(a));

  for (const key of keys) {
    const parsed = parseKey(key);
    if (!parsed) {
      orphaned.push(key);
      continue;
    }
    if (applyOne(next, parsed.lang, parsed.path, drafts[key])) applied.push(parsed.path);
    else orphaned.push(key);
  }

  return { data: next, applied, orphaned };
}

export function applyDrafts(data: SiteData, drafts: Drafts): SiteData {
  return applyDraftsVerbose(data, drafts).data;
}

/**
 * The drafts that no longer say anything the file does not already say.
 *
 * A draft becomes redundant the moment the content it was written against
 * catches up with it — which is what a deploy after a publish does — and a
 * draft that names nothing was redundant from the start. Either way it should
 * stop being counted as an unpublished change, and stop being stored.
 */
export function redundantDrafts(data: SiteData, drafts: Drafts): string[] {
  const base = serializeSiteData(data);

  return Object.entries(drafts)
    .filter(([key, value]) => serializeSiteData(applyDrafts(data, { [key]: value })) === base)
    .map(([key]) => key);
}

/** The same set, removed. */
export function pruneDrafts(data: SiteData, drafts: Drafts): Drafts {
  const redundant = new Set(redundantDrafts(data, drafts));
  if (redundant.size === 0) return drafts;

  return Object.fromEntries(Object.entries(drafts).filter(([key]) => !redundant.has(key)));
}

/** The file as it should be written back: stable key order, trailing newline. */
export function serializeSiteData(data: SiteData): string {
  return JSON.stringify(data, null, 2) + "\n";
}
