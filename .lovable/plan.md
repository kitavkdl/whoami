# Jiyul Ahn · personal site

A short single-page site: who I am, what I'm working on, how to reach me.
Built on TanStack Start, deployed on Vercel.

## Design

Plain reading page. Warm paper background (`#fbfaf7`), near-black text, one
brown accent for links, and a dark palette that follows the system setting.
Newsreader for text, the system sans for dates and small labels. One column,
640px wide, no animation. `ContentProtect` and the user-select rules in
`styles.css` still block right-click saving and copying; the contact list is
marked `data-allow-copy` so the email and phone number stay copyable.

## Pages

- `/` · name and ID photo, two short paragraphs, then Now / Before / Awards /
  Tools / School / Contact. Role entries are a date column plus a paragraph or two.
  Content lives in the `now`, `before` and `awards` arrays at the top of
  `src/routes/index.tsx`.
- `/study` · 오늘의 학점 운세, a grade fortune-teller. Type a subject, get a
  grade for the day. Deterministic: the same subject on the same date always
  returns the same result (`hash(subject + date)`), so it can't be rerolled.
  Korean/English toggle. Printed-ticket styling, separate from the main page.

## Notes

- Fonts load from Google Fonts in `src/routes/__root.tsx`.
- Colors are Tailwind v4 theme tokens in `src/styles.css`
  (`paper`, `ink`, `soft`, `rule`, `mark`).
- No OG image yet: `og:image` stays out until there's a real one.
