import { createFileRoute } from "@tanstack/react-router";

import { cleanMessage, commitDrafts, readSettings, safeEqual } from "@/lib/github";
import type { Drafts } from "@/lib/site-data";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Slows a script down without making a person wait for their own mistake. */
function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDrafts(value: unknown): Drafts | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "string") return null;
    // A key is a language and a content path; nothing here should be long.
    if (key.length > 200 || entry.length > 20_000) return null;
    out[key] = entry;
  }
  return out;
}

/**
 * The one door into the repository.
 *
 * Everything else about edit mode runs in the reader's own browser and is
 * therefore theatre — the reader owns the browser. This is the check that
 * decides whether words become a commit, so it happens here, against a secret
 * the browser has never seen.
 */
export const Route = createFileRoute("/api/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const settings = readSettings();
        if (!settings) {
          return json(
            {
              ok: false,
              reason: "unconfigured",
              detail: "Set GITHUB_TOKEN and EDIT_PASSCODE on the deployment.",
            },
            501,
          );
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, reason: "github", detail: "bad request body" }, 400);
        }

        const body = payload as { passcode?: unknown; drafts?: unknown; message?: unknown };
        const passcode = typeof body.passcode === "string" ? body.passcode.trim() : "";

        if (!passcode || !safeEqual(passcode, settings.passcode)) {
          await pause(500);
          return json({ ok: false, reason: "passcode" }, 401);
        }

        const drafts = readDrafts(body.drafts);
        if (!drafts) return json({ ok: false, reason: "github", detail: "bad drafts" }, 400);
        if (Object.keys(drafts).length === 0) return json({ ok: false, reason: "empty" }, 400);

        const outcome = await commitDrafts(
          settings,
          drafts,
          cleanMessage(body.message, Object.keys(drafts).length),
        );

        if (!outcome.ok) {
          return json(
            { ok: false, reason: outcome.reason, detail: outcome.detail },
            outcome.status,
          );
        }

        return json({ ok: true, count: outcome.count, sha: outcome.sha, url: outcome.url });
      },
    },
  },
});
