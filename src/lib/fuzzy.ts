/**
 * Subsequence matcher for the command palette.
 *
 * Scores the way people expect a palette to score: a hit at the start of a
 * word beats a hit in the middle of one, and a run of consecutive hits beats
 * the same characters scattered around. Returns the matched indices so the
 * caller can bold exactly the characters that earned the match.
 */

export type Match = { score: number; indices: number[] };

const BONUS_CONSECUTIVE = 8;
const BONUS_WORD_START = 10;
const BONUS_CAMEL = 6;
const PENALTY_SKIP = 1;
const PENALTY_LEADING = 3;

function isWordBreak(ch: string): boolean {
  return ch === " " || ch === "-" || ch === "_" || ch === "/" || ch === "." || ch === "·";
}

export function fuzzyMatch(needle: string, haystack: string): Match | null {
  const query = needle.trim().toLowerCase();
  if (!query) return { score: 0, indices: [] };
  if (query.length > haystack.length) return null;

  const lower = haystack.toLowerCase();
  const indices: number[] = [];

  let score = 0;
  let cursor = 0;
  let lastHit = -1;

  for (const ch of query) {
    if (ch === " ") continue;

    const at = lower.indexOf(ch, cursor);
    if (at === -1) return null;

    if (lastHit === at - 1) {
      score += BONUS_CONSECUTIVE;
    } else {
      const prev = haystack[at - 1];
      if (at === 0 || (prev !== undefined && isWordBreak(prev))) {
        score += BONUS_WORD_START;
      } else if (
        prev !== undefined &&
        prev === prev.toLowerCase() &&
        haystack[at] !== haystack[at].toLowerCase()
      ) {
        score += BONUS_CAMEL;
      }
      score -= Math.min(at - cursor, 10) * PENALTY_SKIP;
    }

    if (indices.length === 0) score -= Math.min(at, 6) * PENALTY_LEADING;

    indices.push(at);
    lastHit = at;
    cursor = at + 1;
  }

  // Shorter haystacks win ties: an exact-ish label beats a long paragraph.
  score -= Math.min(haystack.length, 60) / 12;

  return { score, indices };
}

/** Splits a label into alternating plain and matched runs, ready to render. */
export function segment(text: string, indices: number[]) {
  if (indices.length === 0) return [{ text, hit: false }];

  const hits = new Set(indices);
  const out: { text: string; hit: boolean }[] = [];

  let buffer = "";
  let bufferHit = hits.has(0);

  for (let i = 0; i < text.length; i++) {
    const hit = hits.has(i);
    if (hit !== bufferHit) {
      if (buffer) out.push({ text: buffer, hit: bufferHit });
      buffer = "";
      bufferHit = hit;
    }
    buffer += text[i];
  }
  if (buffer) out.push({ text: buffer, hit: bufferHit });

  return out;
}
