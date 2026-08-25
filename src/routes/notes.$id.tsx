import { createFileRoute, notFound } from "@tanstack/react-router";

import { NotePage } from "@/components/site/NotePage";
import { entryIds, getContent } from "@/lib/content";
import { headForNote } from "@/lib/head";
import type { Lang } from "@/lib/i18n";

/**
 * One page per entry, not two: the language rides in a search param the way it
 * does on /study, so a note keeps one URL and one set of inbound links however
 * it is being read.
 */
export const Route = createFileRoute("/notes/$id")({
  // Optional rather than defaulted: a default would make /notes/<id> redirect
  // to /notes/<id>?lang=en, so the plain URL — the one that gets shared — would
  // never be the one the reader ends up on.
  validateSearch: (search: Record<string, unknown>): { lang?: "ko" } =>
    search.lang === "ko" ? { lang: "ko" } : {},
  beforeLoad: ({ params }) => {
    if (!entryIds.includes(params.id)) throw notFound();
  },
  head: ({ params, match }) => {
    const lang: Lang = match.search.lang ?? "en";
    const entry = getContent(lang).allEntries.find((item) => item.id === params.id);
    return headForNote(lang, params.id, entry);
  },
  component: NoteRoute,
});

function NoteRoute() {
  const { id } = Route.useParams();
  const { lang } = Route.useSearch();
  return <NotePage id={id} lang={lang ?? "en"} />;
}
