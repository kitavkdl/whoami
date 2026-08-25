/**
 * Edit mode.
 *
 * There is no server behind this page, so "editing" means exactly this: a
 * passcode turns the prose into something you can type into, the changed
 * strings are kept in this browser, and the page reads them back over the
 * source content on the next load. Nothing is sent anywhere, and no other
 * reader ever sees a word of it.
 *
 * The passcode itself is not in this repository and not in the bundle — see
 * the derivation below. It is still a latch rather than a lock: no check that
 * runs in the reader's own browser can be authentication, because the reader
 * owns the browser. What it can do is keep the passcode out of a public repo.
 *
 * The log is deliberately thin: when, where, and which part. What the line
 * said before, and what it says now, is not written down anywhere.
 */

import { useSyncExternalStore } from "react";

import type { SiteContent } from "@/lib/content";
import type { Copy } from "@/lib/copy";
import type { Lang } from "@/lib/i18n";

/**
 * The passcode, as much of it as anything here is allowed to know.
 *
 * What is written below is a PBKDF2-SHA-256 derivation of it: a random salt,
 * an iteration count, and the 256 bits that fall out. Checking a guess means
 * running the same derivation and comparing the result. Going the other way —
 * recovering the passcode from these three values — means running that
 * derivation once per candidate, and at 1,200,000 iterations a candidate,
 * that is the whole point of the number being this large.
 *
 * So the repository can be public. Nothing here, and nothing in the built
 * bundle or the network tab, spells the passcode out; changing it means
 * deriving a new pair rather than editing a string.
 *
 * To rotate it, run this with the new passcode and paste the two lines back:
 *
 *   node -e 'const{webcrypto:c}=require("node:crypto");(async()=>{const
 *   s=c.getRandomValues(new Uint8Array(16)),k=await c.subtle.importKey("raw",
 *   new TextEncoder().encode(process.argv[1]),"PBKDF2",false,["deriveBits"]),
 *   b=await c.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:s,
 *   iterations:1200000},k,256),h=x=>[...new Uint8Array(x)].map(v=>
 *   v.toString(16).padStart(2,"0")).join("");console.log(h(s.buffer),h(b))})()'
 *   <new passcode>
 */
const PASSCODE_SALT = "05537d62a980bfa640c33ef24b2b4a45";
const PASSCODE_HASH = "8aad01a96e3af7e8230e60f3322e4261938f7676f04a2b1d861c26f8ca437396";
const PASSCODE_ITERATIONS = 1_200_000;

/** Thrown when the browser will not do the derivation. See verifyPasscode. */
export class InsecureContextError extends Error {}

/** Session, not local: closing the tab locks it again. */
const UNLOCK_KEY = "edit:unlocked";
const DRAFTS_KEY = "edit:drafts";
const LOG_KEY = "edit:log";

/** Old records fall off the end rather than growing without bound. */
const LOG_LIMIT = 300;

/** `${lang}/${path}` → the text that replaces whatever the source says. */
export type Drafts = Readonly<Record<string, string>>;

export type LogKind = "edit" | "reset";

/** One line of history. Note what is missing: the words themselves. */
export type LogEntry = {
  id: string;
  at: number;
  lang: Lang;
  /** The field that was touched, as a content path. Empty for a reset. */
  path: string;
  kind: LogKind;
};

export type EditState = {
  unlocked: boolean;
  editing: boolean;
  drafts: Drafts;
  log: readonly LogEntry[];
};

/**
 * What the server renders, and therefore what the first client render has to
 * agree with. Everything stored is read after hydration, never before.
 */
const EMPTY: EditState = { unlocked: false, editing: false, drafts: {}, log: [] };

/** The drafts of a page nobody has edited. Shared, so the caches key on it. */
export const NO_DRAFTS: Drafts = EMPTY.drafts;

let state: EditState = EMPTY;
let loaded = false;
let counter = 0;

const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDrafts(): Drafts {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? "null");
    if (!isRecord(parsed)) return EMPTY.drafts;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return EMPTY.drafts;
  }
}

function readLog(): readonly LogEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOG_KEY) ?? "null");
    if (!Array.isArray(parsed)) return EMPTY.log;
    return parsed.filter(
      (row): row is LogEntry =>
        isRecord(row) && typeof row.at === "number" && typeof row.path === "string",
    );
  } catch {
    return EMPTY.log;
  }
}

/**
 * Pulls storage in once, on the client. Called from subscribe rather than at
 * import time so that a render during hydration cannot see it.
 */
function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  let unlocked = false;
  try {
    unlocked = sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    /* private mode; locked is the safe answer */
  }

  state = { unlocked, editing: false, drafts: readDrafts(), log: readLog() };
}

function persist(drafts: Drafts, log: readonly LogEntry[]): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    /* private mode, or the quota is spent; the change still holds for this view */
  }
}

function set(next: Partial<EditState>): void {
  state = { ...state, ...next };
  for (const listener of [...listeners]) listener();
}

export function subscribe(listener: () => void): () => void {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function snapshot(): EditState {
  return state;
}

function serverSnapshot(): EditState {
  return EMPTY;
}

export function useEdit(): EditState {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** The drafts as the current render should see them — empty until hydrated. */
export function useDrafts(): Drafts {
  return useEdit().drafts;
}

export function useEditing(): boolean {
  return useEdit().editing;
}

/* -------------------------------------------------------------------------- */

export function draftKey(lang: Lang, path: string): string {
  return `${lang}/${path}`;
}

/** Both halves of a content path, built in one place so they cannot drift. */
export function entryPath(id: string, field: string): string {
  return `entry.${id}.${field}`;
}

export function bodyPath(id: string, index: number): string {
  return entryPath(id, `body.${index}`);
}

/** One line of prose, however it arrived out of a contenteditable. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function record(lang: Lang, path: string, kind: LogKind): LogEntry {
  return { id: `${Date.now()}-${++counter}`, at: Date.now(), lang, path, kind };
}

/**
 * Writes a changed line and notes it in the log. Returns false when there is
 * nothing to write — the text came back identical, or empty, which is a
 * misclick rather than an edit.
 */
export function saveEdit(lang: Lang, path: string, next: string, current: string): boolean {
  load();
  const text = normalize(next);
  if (!text || text === normalize(current)) return false;

  const drafts = { ...state.drafts, [draftKey(lang, path)]: text };
  const log = [...state.log, record(lang, path, "edit")].slice(-LOG_LIMIT);

  persist(drafts, log);
  set({ drafts, log });
  return true;
}

/** Puts every line back to what the source file says. Also a logged event. */
export function resetAll(lang: Lang): boolean {
  load();
  if (Object.keys(state.drafts).length === 0) return false;

  const log = [...state.log, record(lang, "", "reset")].slice(-LOG_LIMIT);
  persist(EMPTY.drafts, log);
  set({ drafts: EMPTY.drafts, log });
  return true;
}

export function clearLog(): void {
  load();
  persist(state.drafts, EMPTY.log);
  set({ log: EMPTY.log });
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(text: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(text.length / 2));
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = Number.parseInt(text.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/**
 * Runs the guess through the same derivation the stored bits came out of.
 *
 * crypto.subtle exists only in a secure context, so this works over https and
 * on localhost and refuses to pretend otherwise anywhere else — a weaker
 * fallback check would be a second, cheaper door into the same room.
 */
export async function verifyPasscode(passcode: string): Promise<boolean> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new InsecureContextError("crypto.subtle needs a secure context");

  const key = await subtle.importKey(
    "raw",
    new TextEncoder().encode(passcode.trim()),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(PASSCODE_SALT),
      iterations: PASSCODE_ITERATIONS,
    },
    key,
    256,
  );

  return toHex(bits) === PASSCODE_HASH;
}

export async function unlock(passcode: string): Promise<boolean> {
  load();
  if (!(await verifyPasscode(passcode))) return false;
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* the unlock still holds for this page view */
  }
  set({ unlocked: true, editing: true });
  return true;
}

export function lock(): void {
  load();
  try {
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* nothing was stored to begin with */
  }
  set({ unlocked: false, editing: false });
}

export function setEditing(on: boolean): void {
  load();
  if (!state.unlocked) return;
  set({ editing: on });
}

export function toggleEditing(): void {
  setEditing(!state.editing);
}

/* -------------------------------------------------------------------------- */

export type PathLabel = { place: string; part: string };

/**
 * Turns a stored path back into two readable halves — where on the page, and
 * which part of it — in whichever language the reader is currently in. The
 * log stores the path rather than the labels so that a record written on the
 * Korean page still reads correctly in English, and so that renaming a
 * heading never leaves the history lying.
 */
export function describePath(path: string, content: SiteContent, copy: Copy): PathLabel {
  const { places, parts } = copy.edit;

  if (!path) return { place: places.page, part: parts.reset };

  const label = (id: string) => content.sections.find((s) => s.id === id)?.label ?? id;
  const named = (field: string) => parts[field as keyof typeof parts];

  if (path.startsWith("profile.")) {
    const field = path.slice("profile.".length);
    const part = named(field);
    return { place: places.profile, part: typeof part === "string" ? part : field };
  }

  if (path.startsWith("entry.")) {
    const [, id, ...rest] = path.split(".");
    const groups = [
      { section: "now", items: content.now },
      { section: "before", items: content.before },
      { section: "awards", items: content.awards },
    ];
    const found = groups.find((group) => group.items.some((entry) => entry.id === id));
    const entry = found?.items.find((item) => item.id === id);
    const place = found ? `${label(found.section)} · ${entry?.title ?? id}` : id;

    if (rest[0] === "body") {
      return { place, part: parts.paragraph(Number(rest[1] ?? 0) + 1) };
    }
    const part = named(rest[0] ?? "");
    return { place, part: typeof part === "string" ? part : (rest[0] ?? id) };
  }

  if (path === "tools" || path === "school") {
    return { place: label(path), part: parts.text };
  }

  return { place: path, part: parts.text };
}
