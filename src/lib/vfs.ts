/**
 * A small read-only filesystem generated from src/lib/content.ts.
 *
 * The console walks this tree, so `cat now/seekonce.md` prints the same words
 * the page prints. Nothing is duplicated by hand; if the page changes, the
 * filesystem changes with it.
 */

import { awards, before, now, profile, school, tools, type Entry } from "@/lib/content";

export type VFile = { type: "file"; name: string; content: string };
export type VDir = { type: "dir"; name: string; children: VNode[] };
export type VNode = VFile | VDir;

const WRAP = 72;

/** Greedy wrap at word boundaries, so `cat` output has a proper measure. */
export function wrap(text: string, width = WRAP): string[] {
  const out: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      out.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.split(" ")) {
      if (!line.length) {
        line = word;
      } else if (line.length + 1 + word.length <= width) {
        line += " " + word;
      } else {
        out.push(line);
        line = word;
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
  `phone   ${profile.phone}`,
  `web     ${profile.site.href}`,
  "",
  "Korean or English, either is fine.",
].join("\n");

export const root: VDir = {
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

export function lookup(segments: string[]): VNode | null {
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
export function walk(node: VNode = root, prefix: string[] = []): string[] {
  if (node.type === "file") return [[...prefix, node.name].join("/")];

  return node.children.flatMap((child) => walk(child, node.name ? [...prefix, node.name] : prefix));
}

export function renderTree(node: VDir = root, indent = ""): string[] {
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
