/**
 * Edit mode.
 *
 * Two halves. The first is local and always available: a passcode turns the
 * prose into something you can type into, and the changed strings are kept in
 * this browser as drafts, read back over content/site.json on every render.
 * Nothing about that half leaves the machine it is typed on.
 *
 * The second half is publishing. Drafts are only ever a preview until they are
 * sent to /api/publish, which checks the passcode again on the server, folds
 * the same drafts over the copy of content/site.json that GitHub currently
 * holds, and commits the result. The deploy that follows is what every other
 * reader eventually sees. Until then a draft is one browser's private opinion.
 *
 * The passcode check that runs here is still a latch rather than a lock — the
 * reader owns the browser, so no check running in it can be authentication.
 * The one that matters is the server's, on the way into the commit.
 */

import { useSyncExternalStore } from "react";

import {
  applyDraftsVerbose,
  draftKey,
  pruneDrafts,
  redundantDrafts,
  siteData,
  type Drafts,
  type SiteData,
} from "@/lib/site-data";
import type { SiteContent } from "@/lib/content";
import type { Copy } from "@/lib/copy";
import type { Lang } from "@/lib/i18n";

export type { Drafts } from "@/lib/site-data";

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
 * deriving a new pair rather than editing a string. The server holds the same
 * passcode as a secret (EDIT_PASSCODE) and checks it independently before it
 * will write anything to the repository.
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
const PUBLISHED_KEY = "edit:published";

/** Old records fall off the end rather than growing without bound. */
const LOG_LIMIT = 300;

export type LogKind = "edit" | "reset" | "publish";

/** One line of history. Note what is missing: the words themselves. */
export type LogEntry = {
  id: string;
  at: number;
  lang: Lang;
  /** The field that was touched, as a content path. Empty for a reset. */
  path: string;
  kind: LogKind;
  /** How many lines went out in a publish. Absent on the other kinds. */
  count?: number;
};

/**
 * What the last successful publish did, so the bar can point at the commit.
 *
 * `sent` is the drafts as they went out. The commit exists the moment the
 * server answers, but the bundle this browser is running was built before it,
 * so the drafts have to stay on screen until a deploy catches up with them —
 * clearing them on success would make the page revert to the old words a
 * second after saying it had published the new ones. Keeping `sent` is how
 * those drafts stop being counted as unpublished without being thrown away.
 */
export type Published = {
  at: number;
  count: number;
  sha: string;
  url: string;
  sent: Drafts;
};

export type EditState = {
  unlocked: boolean;
  editing: boolean;
  publishing: boolean;
  drafts: Drafts;
  log: readonly LogEntry[];
  published: Published | null;
};

/**
 * What the server renders, and therefore what the first client render has to
 * agree with. Everything stored is read after hydration, never before.
 */
const EMPTY: EditState = {
  unlocked: false,
  editing: false,
  publishing: false,
  drafts: {},
  log: [],
  published: null,
};

/** The drafts of a page nobody has edited. Shared, so the caches key on it. */
export const NO_DRAFTS: Drafts = EMPTY.drafts;

let state: EditState = EMPTY;
let loaded = false;
let counter = 0;

/**
 * The passcode, for as long as this page is open.
 *
 * Publishing has to prove itself to the server on every attempt, and asking
 * for the passcode a second time thirty seconds after the first one is theatre.
 * It is held in a module variable rather than in storage: a reload asks again,
 * and nothing on disk ever holds it.
 */
let sessionPasscode: string | null = null;

const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson<T>(key: string, fallback: T, parse: (value: unknown) => T | null): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

function readDrafts(): Drafts {
  return readJson(DRAFTS_KEY, EMPTY.drafts, (parsed) => {
    if (!isRecord(parsed)) return null;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  });
}

function readLog(): readonly LogEntry[] {
  return readJson(LOG_KEY, EMPTY.log, (parsed) => {
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (row): row is LogEntry =>
        isRecord(row) && typeof row.at === "number" && typeof row.path === "string",
    );
  });
}

function readPublished(): Published | null {
  return readJson(PUBLISHED_KEY, EMPTY.published, (parsed) =>
    isRecord(parsed) && typeof parsed.at === "number" && typeof parsed.sha === "string"
      ? { ...(parsed as Published), sent: isRecord(parsed.sent) ? (parsed.sent as Drafts) : {} }
      : null,
  );
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

  // Drafts the content file has since caught up with — the deploy after a
  // publish landed, or the path stopped naming anything — are dropped here
  // rather than kept forever as changes that are not changes.
  const drafts = pruneDrafts(siteData, readDrafts());
  const published = readPublished();

  state = { ...EMPTY, unlocked, drafts, log: readLog(), published };

  if (Object.keys(drafts).length !== Object.keys(readDrafts()).length) {
    persist(drafts, state.log);
  }
}

function persist(drafts: Drafts, log: readonly LogEntry[], published?: Published | null): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    if (published !== undefined) {
      if (published) localStorage.setItem(PUBLISHED_KEY, JSON.stringify(published));
      else localStorage.removeItem(PUBLISHED_KEY);
    }
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

/** One line of prose, however it arrived out of a contenteditable. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function record(lang: Lang, path: string, kind: LogKind, count?: number): LogEntry {
  return { id: `${Date.now()}-${++counter}`, at: Date.now(), lang, path, kind, count };
}

function write(drafts: Drafts, log: readonly LogEntry[]): void {
  persist(drafts, log);
  set({ drafts, log });
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

  write(
    { ...state.drafts, [draftKey(lang, path)]: text },
    [...state.log, record(lang, path, "edit")].slice(-LOG_LIMIT),
  );
  return true;
}

/**
 * The same, for a value that is a list rather than a line — the paragraphs of
 * a body, or a row of tags. Whitespace inside is structural here, so the text
 * is compared and stored as it arrived rather than flattened.
 */
export function saveBlocks(lang: Lang, path: string, next: string, current: string): boolean {
  load();
  const text = next.trim();
  if (text === current.trim()) return false;

  write(
    { ...state.drafts, [draftKey(lang, path)]: text },
    [...state.log, record(lang, path, "edit")].slice(-LOG_LIMIT),
  );
  return true;
}

/** Puts every line back to what the content file says. Also a logged event. */
export function resetAll(lang: Lang): boolean {
  load();
  if (Object.keys(state.drafts).length === 0) return false;

  write(EMPTY.drafts, [...state.log, record(lang, "", "reset")].slice(-LOG_LIMIT));
  return true;
}

export function clearLog(): void {
  load();
  persist(state.drafts, EMPTY.log);
  set({ log: EMPTY.log });
}

/* -------------------------------------------------------------------------- */
/* The passcode                                                               */
/* -------------------------------------------------------------------------- */

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

  sessionPasscode = passcode.trim();
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
  sessionPasscode = null;
  try {
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* nothing was stored to begin with */
  }
  set({ unlocked: false, editing: false });
}

/** Whether publishing can go ahead without asking for the passcode again. */
export function hasSessionPasscode(): boolean {
  return sessionPasscode !== null;
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
/* Publishing                                                                 */
/* -------------------------------------------------------------------------- */

export type PublishFailure =
  | "empty"
  | "passcode"
  | "unconfigured"
  | "conflict"
  | "github"
  | "network";

export type PublishResult =
  | { ok: true; count: number; sha: string; url: string }
  | { ok: false; reason: PublishFailure; detail?: string };

/**
 * Drafts that are actually waiting to go out: ones that change something, and
 * that are not already sitting in a commit this browser has not caught up with.
 */
export function pendingDrafts(drafts: Drafts, published: Published | null): Drafts {
  const redundant = new Set(redundantDrafts(siteData, drafts));

  return Object.fromEntries(
    Object.entries(drafts).filter(
      ([key, value]) => !redundant.has(key) && published?.sent[key] !== value,
    ),
  );
}

export function pendingCount(drafts: Drafts, published: Published | null): number {
  return Object.keys(pendingDrafts(drafts, published)).length;
}

/** The content file as it would be committed right now. For the preview. */
export function previewOf(drafts: Drafts): SiteData {
  return applyDraftsVerbose(siteData, drafts).data;
}

function isFailure(value: unknown): value is PublishFailure {
  return (
    typeof value === "string" &&
    ["empty", "passcode", "unconfigured", "conflict", "github", "network"].includes(value)
  );
}

/**
 * Sends the drafts to the server, which checks the passcode, folds them over
 * the file GitHub currently holds and commits the result.
 *
 * The drafts go up as they are rather than as a finished file: the merge has
 * to happen against the live content, not against the copy this browser was
 * served, or an edit made in one tab would silently revert an edit published
 * from another.
 */
export async function publish(message: string, passcode?: string): Promise<PublishResult> {
  load();

  const secret = (passcode ?? sessionPasscode ?? "").trim();
  if (!secret) return { ok: false, reason: "passcode" };

  // Only what is actually outstanding goes up: re-sending a draft the last
  // publish already committed would produce a commit that changes nothing.
  const outgoing = pendingDrafts(state.drafts, state.published);
  if (Object.keys(outgoing).length === 0) return { ok: false, reason: "empty" };

  set({ publishing: true });

  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode: secret, drafts: outgoing, message }),
    });

    const payload: unknown = await response.json().catch(() => null);
    const body = isRecord(payload) ? payload : {};

    if (!response.ok || body.ok !== true) {
      const reason = isFailure(body.reason)
        ? body.reason
        : response.status === 401
          ? "passcode"
          : response.status === 409
            ? "conflict"
            : response.status === 501
              ? "unconfigured"
              : "github";
      return {
        ok: false,
        reason,
        detail: typeof body.detail === "string" ? body.detail : undefined,
      };
    }

    // The passcode was good enough for the server, so it is good enough to
    // keep for the rest of this page view.
    sessionPasscode = secret;

    const count = typeof body.count === "number" ? body.count : 0;
    const sha = typeof body.sha === "string" ? body.sha : "";
    const url = typeof body.url === "string" ? body.url : "";
    const published: Published = {
      at: Date.now(),
      count,
      sha,
      url,
      sent: { ...state.published?.sent, ...outgoing },
    };

    // The drafts stay. They are in the commit now, but the bundle running here
    // was built before it, so dropping them would revert every line on screen
    // until the deploy lands. `sent` is what stops them being counted twice;
    // the next load prunes whichever of them the new content has caught up to.
    const log = [...state.log, record("en", "", "publish", count)].slice(-LOG_LIMIT);
    persist(state.drafts, log, published);
    set({ log, published, publishing: false });

    return { ok: true, count, sha, url };
  } catch (cause) {
    return {
      ok: false,
      reason: "network",
      detail: cause instanceof Error ? cause.message : undefined,
    };
  } finally {
    if (state.publishing) set({ publishing: false });
  }
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
  const partFor = (field: string, fallback: string) => {
    const part = named(field);
    return typeof part === "string" ? part : fallback;
  };

  if (path.startsWith("shared.profile.")) {
    const field = path.slice("shared.profile.".length);
    return { place: places.profile, part: partFor(field.split(".")[0], field) };
  }

  if (path.startsWith("profile.")) {
    const field = path.slice("profile.".length);
    return { place: places.profile, part: partFor(field, field) };
  }

  const named2 = /^(entry|note)\.([\w-]+)\.(.+)$/.exec(path);
  if (named2) {
    const [, kind, id, field] = named2;
    const entry = content.allEntries.find((item) => item.id === id);
    const section = (["now", "before", "awards"] as const).find((key) =>
      content[key].some((item) => item.id === id),
    );
    const place = section ? `${label(section)} · ${entry?.title ?? id}` : id;
    const part =
      field === "body" ? parts.text : field === "lede" ? parts.lede : partFor(field, field);

    return { place: kind === "note" ? `${place} · ${parts.note}` : place, part };
  }

  if (path.startsWith("section.")) {
    return { place: label(path.slice("section.".length)), part: parts.heading };
  }

  if (path === "tools" || path === "school") {
    return { place: label(path), part: parts.text };
  }

  return { place: path, part: parts.text };
}
