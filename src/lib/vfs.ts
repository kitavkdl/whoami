/**
 * A small read-only filesystem generated from src/lib/content.ts.
 *
 * The console walks this tree, so `cat now/seekonce.md` prints the same words
 * the page prints. Nothing is duplicated by hand; if the page changes, the
 * filesystem changes with it — including the language, which is why there is
 * one tree per language rather than one tree.
 *
 * Paths and field keys stay in English on both sides. They are typed at a
 * prompt and completed with tab; they are an interface, not copy.
 */

import { getContent, type Entry } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import { NO_DRAFTS, type Drafts } from "@/lib/edit";
import { type Lang } from "@/lib/i18n";

export type VFile = { type: "file"; name: string; content: string };
export type VDir = { type: "dir"; name: string; children: VNode[] };
export type VNode = VFile | VDir;

const WRAP = 72;

/**
 * Columns a character occupies in a monospaced terminal. Hangul and the rest
 * of the CJK block are drawn two cells wide, so counting them as one would
 * wrap Korean output at roughly double the intended measure.
 */
function charWidth(code: number): number {
  return (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2e80 && code <= 0x303e) ||
    (code >= 0x3041 && code <= 0x33ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xa000 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe4f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6)
    ? 2
    : 1;
}

export function displayWidth(text: string): number {
  let total = 0;
  for (const ch of text) total += charWidth(ch.codePointAt(0)!);
  return total;
}

/** Greedy wrap at word boundaries, so `cat` output has a proper measure. */
export function wrap(text: string, width = WRAP): string[] {
  const out: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      out.push("");
      continue;
    }

    let line = "";
    let used = 0;
    for (const word of paragraph.split(" ")) {
      const w = displayWidth(word);
      if (!line.length) {
        line = word;
        used = w;
      } else if (used + 1 + w <= width) {
        line += " " + word;
        used += 1 + w;
      } else {
        out.push(line);
        line = word;
        used = w;
      }
    }
    if (line.length) out.push(line);
  }

  return out;
}

function entryFile(entry: Entry): VFile {
  const head = [
    `# ${entry.title}`,
    "",
    `when   ${entry.when}`,
    entry.altName ? `also   ${entry.altName}` : null,
    entry.where ? `what   ${entry.where}` : null,
    `stack  ${entry.tags.join(", ")}`,
    entry.href ? `url    ${entry.href}` : null,
    "",
  ].filter((l): l is string => l !== null);

  const body: string[] = [];
  entry.body.forEach((paragraph, i) => {
    if (i) body.push("");
    body.push(...wrap(paragraph));
  });

  return {
    type: "file",
    name: `${entry.id}.md`,
    content: [...head, ...body].join("\n"),
  };
}

function buildRoot(lang: Lang, drafts: Drafts): VDir {
  const { profile, now, before, awards, tools, school } = getContent(lang, drafts);

  const aboutTxt = [
    profile.name + "  ·  " + profile.hangul,
    profile.location,
    "",
    ...wrap(profile.lede),
    "",
    ...wrap(profile.intro),
  ].join("\n");

  const contactTxt = [
    `email   ${profile.email}`,
    // A separate key rather than a repeated one: the console reads as a file,
    // and "sms" says what the note on the page says.
    ...profile.phones.map((p) => (p.smsOnly ? "sms" : "phone").padEnd(8) + p.label),
    `web     ${profile.site.href}`,
    "",
    getCopy(lang).contact.languages,
  ].join("\n");

  return {
    type: "dir",
    name: "",
    children: [
      { type: "file", name: "about.txt", content: aboutTxt },
      { type: "dir", name: "now", children: now.map(entryFile) },
      { type: "dir", name: "before", children: before.map(entryFile) },
      { type: "dir", name: "awards", children: awards.map(entryFile) },
      { type: "file", name: "tools.txt", content: wrap(tools).join("\n") },
      { type: "file", name: "school.txt", content: wrap(school).join("\n") },
      { type: "file", name: "contact.txt", content: contactTxt },
    ],
  };
}

// Built once per language, and again if edit mode changes a line — the tree is
// a view of the content, so `cat` has to print whatever the page prints. The
// cache is keyed on the drafts object, as in lib/content.
const roots = new WeakMap<Drafts, Partial<Record<Lang, VDir>>>();

export function getRoot(lang: Lang, drafts: Drafts = NO_DRAFTS): VDir {
  let byLang = roots.get(drafts);
  if (!byLang) {
    byLang = {};
    roots.set(drafts, byLang);
  }
  return (byLang[lang] ??= buildRoot(lang, drafts));
}

/** Normalises `.`, `..`, absolute and relative segments against a cwd. */
export function resolvePath(cwd: string[], input: string): string[] {
  const raw = input.trim();
  const segments = raw.startsWith("/") ? [] : [...cwd];

  for (const part of raw.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") segments.pop();
    else if (part === "~") segments.length = 0;
    else segments.push(part);
  }

  return segments;
}

export function lookup(root: VDir, segments: string[]): VNode | null {
  let node: VNode = root;

  for (const segment of segments) {
    if (node.type !== "dir") return null;
    const next: VNode | undefined = node.children.find((child) => child.name === segment);
    if (!next) return null;
    node = next;
  }

  return node;
}

export function formatPath(segments: string[]): string {
  return segments.length ? "~/" + segments.join("/") : "~";
}

/** Every file path in the tree, for `grep` and for tab completion. */
export function walk(node: VNode, prefix: string[] = []): string[] {
  if (node.type === "file") return [[...prefix, node.name].join("/")];

  return node.children.flatMap((child) => walk(child, node.name ? [...prefix, node.name] : prefix));
}

export function renderTree(node: VDir, indent = ""): string[] {
  const lines: string[] = [];

  node.children.forEach((child, i) => {
    const last = i === node.children.length - 1;
    const branch = last ? "└── " : "├── ";
    lines.push(indent + branch + child.name + (child.type === "dir" ? "/" : ""));
    if (child.type === "dir") {
      lines.push(...renderTree(child, indent + (last ? "    " : "│   ")));
    }
  });

  return lines;
}
