/**
 * Everything the page knows about, resolved into one language.
 *
 * The words themselves are in content/site.json and the rules for changing
 * them are in lib/site-data. This module does one thing on top of that: it
 * folds the current drafts over the file, picks a language, and hands back the
 * flat shape the components expect.
 *
 * Three surfaces read from here and they must never disagree: the rendered
 * document, the virtual filesystem behind the console, and the command palette
 * index. Adding an entry to the JSON adds it to all three.
 */

import { NO_DRAFTS, useDrafts } from "@/lib/edit";
import {
  applyDrafts,
  siteData,
  type Drafts,
  type EntryKind,
  type EntrySection,
  type EntrySource,
  type PhoneSource,
  type SectionId,
  type SiteData,
} from "@/lib/site-data";
import { useLang, type Lang } from "@/lib/i18n";

export type { EntryKind, EntrySection, SectionId } from "@/lib/site-data";

export type Phone = PhoneSource;

/** The long-form page behind an entry, in one language. */
export type Note = { lede: string; body: string[] };

/** A photograph under an entry, in one language. */
export type EntryImage = { src: string; alt: string; focus?: "top" };

/** An entry once a language has been chosen. */
export type Entry = {
  id: string;
  section: EntrySection;
  kind: EntryKind;
  when: string;
  title: string;
  altName?: string;
  where?: string;
  body: string[];
  tags: string[];
  images: EntryImage[];
  href?: string;
  start: string;
  end?: string;
  note: Note;
};

export type Section = { id: SectionId; label: string };

export type Profile = {
  name: string;
  hangul: string;
  timeZone: string;
  email: string;
  phones: Phone[];
  site: { label: string; href: string };
  location: string;
  lede: string;
  intro: string;
  updated: string;
};

export type SiteContent = {
  profile: Profile;
  now: Entry[];
  before: Entry[];
  awards: Entry[];
  allEntries: Entry[];
  tools: string;
  school: string;
  sections: Section[];
};

/**
 * Fields that read the same in either language, and are needed before any
 * drafts have been loaded — the clock reads the time zone during the first
 * render, which happens on the server.
 */
export const profile = siteData.profile;

/** Ids are the same in both languages: they are anchors and console paths. */
export const sectionIds: SectionId[] = siteData.sections.map((s) => s.id);

function resolveEntry(source: EntrySource, lang: Lang): Entry {
  return {
    id: source.id,
    section: source.section,
    kind: source.kind,
    start: source.start,
    end: source.end,
    href: source.href,
    when: source.when[lang],
    title: source.title[lang],
    altName: source.altName?.[lang] || undefined,
    where: source.where?.[lang] || undefined,
    body: source.body[lang],
    tags: source.tags[lang],
    images: (source.images ?? []).map((image) => ({
      src: image.src,
      alt: image.alt[lang],
      focus: image.focus,
    })),
    note: { lede: source.note.lede[lang], body: source.note.body[lang] },
  };
}

function build(lang: Lang, drafts: Drafts): SiteContent {
  const data: SiteData = drafts === NO_DRAFTS ? siteData : applyDrafts(siteData, drafts);
  const entries = data.entries.map((source) => resolveEntry(source, lang));
  const inSection = (section: EntrySection) => entries.filter((e) => e.section === section);

  return {
    profile: {
      ...data.profile,
      location: data.profile.location[lang],
      lede: data.profile.lede[lang],
      intro: data.profile.intro[lang],
      updated: data.profile.updated[lang],
    },
    now: inSection("now"),
    before: inSection("before"),
    awards: inSection("awards"),
    allEntries: entries,
    tools: data.tools[lang],
    school: data.school[lang],
    sections: data.sections.map((s) => ({ id: s.id, label: s.label[lang] })),
  };
}

// Resolved once per language and per set of drafts, then shared. The result is
// read on every render of the chart and the palette index, and it only changes
// when edit mode writes a line. Keying the cache on the drafts object itself
// means a stale set is collected along with the content built from it.
const cache = new WeakMap<Drafts, Partial<Record<Lang, SiteContent>>>();

export function getContent(lang: Lang, drafts: Drafts = NO_DRAFTS): SiteContent {
  let byLang = cache.get(drafts);
  if (!byLang) {
    byLang = {};
    cache.set(drafts, byLang);
  }
  return (byLang[lang] ??= build(lang, drafts));
}

export function useContent(): SiteContent {
  return getContent(useLang(), useDrafts());
}

/** Every entry id, in the order they appear. */
export const entryIds: string[] = siteData.entries.map((entry) => entry.id);

/** Earliest month on record, used as the left edge of the concurrency chart. */
export const timelineStart = "2023-01";
