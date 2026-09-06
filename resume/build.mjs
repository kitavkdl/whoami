/**
 * Renders resume.html to Jiyul-Ahn-Resume.pdf via headless Chromium.
 *
 *   node resume/build.mjs
 *
 * Fonts are already base64-embedded in fonts.css, so this runs offline.
 */
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import puppeteer from 'puppeteer'

const here = dirname(fileURLToPath(import.meta.url))
const source = pathToFileURL(join(here, 'resume.html')).href
const target = join(here, 'Jiyul-Ahn-Resume.pdf')

// The footer is rendered in its own document, so it needs its own copy of the
// typeface -- otherwise Chromium falls back to a system font and the page
// numbers sit in a different face from the rest of the page.
const archivo = readFileSync(join(here, 'fonts.css'), 'utf8')
  .match(/@font-face\s*\{(?:[^}]*?)font-family: 'Archivo'(?:[^}]*?)font-weight: 400(?:[^}]*?)\}/s)[0]

const footer = `
  <style>${archivo}</style>
  <div style="width:100%;padding:0 14mm 5mm;font:400 7pt Archivo,sans-serif;
              color:#8494a6;display:flex;justify-content:space-between;">
    <span>Jiyul Ahn</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await browser.newPage()

await page.goto(source, { waitUntil: 'networkidle0' })
await page.evaluateHandle('document.fonts.ready')

await page.pdf({
  path: target,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: footer,
})

await browser.close()
console.log('wrote', target)
