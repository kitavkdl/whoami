/**
 * Committing the content file back to GitHub.
 *
 * This module only ever runs on the server. It holds the two secrets the site
 * has — a token that can write to the repository, and the passcode edit mode
 * checks — and neither is ever sent to a browser.
 *
 * The merge happens here rather than in the page for one reason: the browser
 * that is publishing was served some particular version of content/site.json,
 * and by the time the reader presses the button that may not be the version
 * the repository holds any more. So the drafts travel as drafts, and they are
 * folded over whatever GitHub currently has. Two tabs editing different lines
 * both land; two tabs editing the same line resolve last-write-wins on that
 * line alone rather than one of them reverting the other's whole file.
 */

import { applyDraftsVerbose, serializeSiteData, type Drafts, type SiteData } from "@/lib/site-data";

export const CONTENT_PATH = "content/site.json";

const API = "https://api.github.com";

export type Settings = {
  token: string;
  passcode: string;
  repo: string;
  branch: string;
};

/**
 * Reads the deployment's secrets. Cloudflare Workers put bindings on
 * process.env under nodejs_compat, and Vercel puts environment variables
 * there too, so one lookup covers both hosts.
 */
export function readSettings(): Settings | null {
  const env: Record<string, string | undefined> = globalThis.process?.env ?? {};

  const token = env.GITHUB_TOKEN?.trim();
  const passcode = env.EDIT_PASSCODE?.trim();
  if (!token || !passcode) return null;

  return {
    token,
    passcode,
    repo: env.GITHUB_REPO?.trim() || "kitavkdl/jiyul-showcase-magic",
    branch: env.GITHUB_BRANCH?.trim() || "main",
  };
}

/**
 * Compares without leaking where the first difference is. It does leak the
 * length, which for a passcode is not worth the trouble of padding.
 */
export function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

/** Base64 that survives Hangul: GitHub wants bytes, not UTF-16 code units. */
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function headers(settings: Settings): HeadersInit {
  return {
    authorization: `Bearer ${settings.token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "jiyul-ahn-portfolio",
  };
}

export type CommitOutcome =
  | { ok: true; count: number; sha: string; url: string }
  | { ok: false; status: number; reason: "empty" | "conflict" | "github"; detail?: string };

/**
 * Reads the content file, folds the drafts over it and writes it back as one
 * commit. Returns the number of lines that actually changed, which is not the
 * number of drafts: a draft that names a deleted entry lands nowhere.
 */
export async function commitDrafts(
  settings: Settings,
  drafts: Drafts,
  message: string,
): Promise<CommitOutcome> {
  const base = `${API}/repos/${settings.repo}/contents/${CONTENT_PATH}`;

  const current = await fetch(`${base}?ref=${encodeURIComponent(settings.branch)}`, {
    headers: headers(settings),
  });

  if (!current.ok) {
    return {
      ok: false,
      status: 502,
      reason: "github",
      detail: `reading ${CONTENT_PATH} failed (${current.status})`,
    };
  }

  const file = (await current.json()) as { content?: string; sha?: string };
  if (!file.content || !file.sha) {
    return { ok: false, status: 502, reason: "github", detail: "unreadable content response" };
  }

  let data: SiteData;
  try {
    data = JSON.parse(decodeBase64(file.content)) as SiteData;
  } catch {
    return { ok: false, status: 502, reason: "github", detail: "content file is not valid JSON" };
  }

  const merged = applyDraftsVerbose(data, drafts);
  const next = serializeSiteData(merged.data);

  // Nothing to say. Either every draft named something that has since gone, or
  // the words were already what the repository holds.
  if (merged.applied.length === 0 || next === serializeSiteData(data)) {
    return { ok: false, status: 400, reason: "empty" };
  }

  const written = await fetch(base, {
    method: "PUT",
    headers: { ...headers(settings), "content-type": "application/json" },
    body: JSON.stringify({
      message,
      content: encodeBase64(next),
      sha: file.sha,
      branch: settings.branch,
    }),
  });

  if (written.status === 409 || written.status === 422) {
    return { ok: false, status: 409, reason: "conflict" };
  }

  if (!written.ok) {
    const detail = await written.text().catch(() => "");
    return {
      ok: false,
      status: 502,
      reason: "github",
      detail: `commit refused (${written.status}) ${detail.slice(0, 200)}`,
    };
  }

  const result = (await written.json()) as {
    commit?: { sha?: string; html_url?: string };
  };

  return {
    ok: true,
    count: merged.applied.length,
    sha: (result.commit?.sha ?? "").slice(0, 7),
    url: result.commit?.html_url ?? "",
  };
}

/** One line, no control characters, and short enough for a commit subject. */
export function cleanMessage(input: unknown, count: number): string {
  const raw = typeof input === "string" ? input.replace(/\s+/g, " ").trim() : "";
  const subject = raw.slice(0, 72);
  return subject || `Edit ${count} ${count === 1 ? "line" : "lines"} from the page`;
}
