# jiyul-ahn-portfolio

The site at [ideantoe.com](https://ideantoe.com). Two languages, one content
file, and an edit mode that writes back to this repository.

## Where the words live

Everything the site says about the work is in **`content/site.json`** — both
languages, the entries, and the long-form notes behind each entry. Nothing
about the work is hard-coded in a component.

`src/lib/copy.ts` holds the other kind of string: buttons, the console, the
keyboard sheet. Interface, not content.

Four surfaces read the content and must never disagree — the front page, the
notes page behind each entry, the virtual filesystem behind the console, and
the command palette. They all go through `src/lib/content.ts`, so adding an
entry to the JSON adds it to all four.

## Edit mode

Unlock with the passcode (the masthead button, or the button on any notes
page) and every line of prose becomes editable in place. Paragraphs can be
added and deleted, not just rewritten.

Changes are **drafts**: they live in this browser only and no other reader
sees them. The corner bar counts them.

## Publishing

**Publish** on the corner bar sends the drafts to `/api/publish`, which:

1. checks the passcode again, on the server, against `EDIT_PASSCODE`;
2. reads the current `content/site.json` from GitHub;
3. folds the drafts over it — the merge happens against the live file, not
   against the copy this browser was served, so two tabs editing different
   lines both land;
4. commits the result and returns the commit URL.

The deploy that follows is what everyone else sees. Local drafts are cleared
once the commit lands, so the page stops claiming there is anything pending.

### Setting it up

Publishing needs two secrets on the deployment. Until they are set, the button
is there and says so — everything else about edit mode still works.

| Variable | Required | What it is |
| --- | --- | --- |
| `GITHUB_TOKEN` | yes | Fine-grained personal access token, scoped to this repository, **Contents: Read and write**. Nothing else. |
| `EDIT_PASSCODE` | yes | The passcode, in plain text. Must match the one edit mode asks for. |
| `GITHUB_REPO` | no | `owner/repo`. Defaults to `kitavkdl/jiyul-showcase-magic`. |
| `GITHUB_BRANCH` | no | Branch to commit to. Defaults to `main`. |

**Vercel** — Project → Settings → Environment Variables. Add both, then
redeploy so the running functions pick them up.

**Cloudflare Workers** — `wrangler secret put GITHUB_TOKEN` and
`wrangler secret put EDIT_PASSCODE`. For `wrangler dev`, put them in
`.dev.vars` (gitignored; see `.dev.vars.example`).

Neither secret ever reaches the browser: `src/lib/github.ts` is stripped from
the client bundle, and the passcode check that decides whether a commit
happens runs only on the server.

### The passcode

The passcode in the browser is a **latch, not a lock** — the reader owns the
browser, so no check running in it is authentication. What it does is keep the
passcode out of a public repository: `src/lib/edit.ts` holds a PBKDF2-SHA-256
derivation (salt, 1,200,000 iterations, 256 bits), not the passcode.

The check that matters is the server's, against `EDIT_PASSCODE`.

To rotate: run the snippet in the comment at the top of `src/lib/edit.ts`,
paste the two lines back, and set the new `EDIT_PASSCODE` on the deployment.
Both have to change together.

> The plaintext passcode `1029` is in this repository's history at commits
> `7d8dd26` and `d758539`. It has already been rotated. Do not reuse it.

## Running it

```sh
bun install
bun run dev      # http://localhost:8080
bun run build
bun run lint
```

Edit mode needs a secure context (`https` or `localhost`) because the passcode
check uses `crypto.subtle`.
