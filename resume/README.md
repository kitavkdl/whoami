# Resume

A standalone print document, independent of the site. Nothing here reads `content/site.json`
at build time — the copy was lifted from it once and edited for print, so changing the site
will not silently change the resume.

| File | |
| --- | --- |
| `Jiyul-Ahn-Resume.pdf` | the deliverable — A4, 2 pages, fonts embedded |
| `resume.html` | the source; edit this |
| `fonts.css` | Archivo and Source Serif 4, base64-embedded (Latin subset only) |
| `build.mjs` | renders `resume.html` to the PDF |

English only — no photo, no Hangul, no scripts, no clock, no console. The PDF is fully
self-contained and renders identically anywhere.

If you add Korean text you will also need a Korean face in `fonts.css`; without one it will
render as blank boxes.

Section order follows the usual CV convention for a current student: profile, education,
skills, experience (employment), projects (self-directed), awards, leadership. Dates read
`Oct 2025 - Present` rather than `2025.10`.

## On the photo

There is deliberately no photo. US resumes omit them, and public universities -- including
SBU, for on-campus jobs -- avoid pre-hire material that signals race, age or sex, so a photo
reads as off-convention there and some applicant-tracking systems drop it.

For a Korean or European application, where a photo is standard, add one back:

```sh
# produces a 300px-wide, EXIF-stripped data URI from the ID photo in src/assets
node -e "..."   # see commit 43541da for the version that had it
```

Then drop an `<img class="photo" src="data:image/jpeg;base64,...">` at the end of
`.masthead` and give it `width: 22mm; border: 0.5pt solid var(--rule)`. Budget about 5mm of
extra header height and re-check the page count.

## Editing

Open `resume.html` in a browser to preview, then rebuild. The layout is a two-column grid:
a right-aligned date rail and a content column that carries the continuous hairline spine.
Each entry is one `.row`; each row draws its own segment of the spine, which is what keeps
the line unbroken across the page break.

`break-inside: avoid` on `.row` stops an entry splitting across pages, so adding content
tends to move whole entries rather than reflow them. It currently fits two pages with about
3mm to spare on page 2 — adding more than a couple of lines will push to a third page.

## Rebuilding

Needs Puppeteer, which is deliberately not in the project's `package.json`:

```sh
npm i -D puppeteer
node resume/build.mjs
```

On a bare Linux box Chromium also needs system libraries that headless installs often lack
(`libatk-1.0`, `libatk-bridge-2.0`, `libatspi`, `libasound2`, `libcups2`, `libXdamage`,
`libXRes`, `libavahi-client3`). On Debian/Ubuntu:

```sh
sudo apt install -y libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 \
                    libasound2t64 libcups2t64 libxdamage1 libxres1 libavahi-client3
```

To refresh the embedded fonts (only needed if you change typefaces), re-download them from
Google Fonts and re-inline them as `data:` URLs; `fonts.css` is generated, not hand-written.
