/**
 * The FAQ's pure logic: ids, search, highlighting, the open set, keyboard
 * movement. No React, no DOM, so every rule is testable.
 *
 * It is the logic half of the slit-type FAQ pattern (ink floods a row, the
 * question inverts where the edge has passed, the answer is printed in the
 * flood's counter-colour), with the pieces re-checked rather than trusted:
 * the whole-word search, the overlapping-highlight merge, the excerpt window
 * and the id de-duplication each have a test below them.
 */

/** A URL-safe id from a question. Never empty, so a hash always has a target. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'question'
  )
}

/** An id per item: its own, or a slug of its question, made unique. */
export function itemIds(
  questions: string[],
  explicit: (string | undefined)[] = [],
): string[] {
  const seen: Record<string, number> = {}
  return questions.map((question, index) => {
    const base = explicit[index] || slugify(question)
    seen[base] = (seen[base] || 0) + 1
    return seen[base] > 1 ? `${base}-${seen[base]}` : base
  })
}

export const queryWords = (query: string) =>
  query.toLowerCase().split(/\s+/).filter(Boolean)

/** Every word of the query must appear somewhere in the text. */
export function matches(text: string, query: string): boolean {
  const words = queryWords(query)
  if (!words.length) return true
  const haystack = text.toLowerCase()
  return words.every((word) => haystack.includes(word))
}

export type Run = { text: string; hit: boolean }

/** Split text into plain and matched runs. Overlapping matches merge. */
export function highlightRuns(text: string, query: string): Run[] {
  const words = queryWords(query)
  if (!words.length || !text) return [{ text, hit: false }]
  const haystack = text.toLowerCase()
  const marks = new Array<boolean>(text.length).fill(false)
  for (const word of words) {
    let at = haystack.indexOf(word)
    while (at > -1) {
      for (let k = at; k < at + word.length; k += 1) marks[k] = true
      at = haystack.indexOf(word, at + 1)
    }
  }
  const runs: Run[] = []
  for (let k = 0; k < text.length; k += 1) {
    const last = runs[runs.length - 1]
    if (last && last.hit === marks[k]) last.text += text[k]
    else runs.push({ text: text[k], hit: marks[k] })
  }
  return runs
}

/** A short excerpt around the first matched word, or "" when nothing matches. */
export function snippet(text: string, query: string, radius = 44): string {
  const words = queryWords(query)
  if (!words.length || !text) return ''
  const haystack = text.toLowerCase()
  let at = -1
  for (const word of words) {
    const found = haystack.indexOf(word)
    if (found > -1 && (at < 0 || found < at)) at = found
  }
  if (at < 0) return ''
  let from = Math.max(0, at - radius)
  let to = Math.min(text.length, at + radius * 2)
  if (from > 0) from = text.indexOf(' ', from) + 1 || from
  if (to < text.length) {
    const space = text.lastIndexOf(' ', to)
    to = space > at ? space : to
  }
  return (
    (from > 0 ? '…' : '') +
    text.slice(from, to).trim() +
    (to < text.length ? '…' : '')
  )
}

/** Which ids start open, from an index, an id, or a list of either. */
export function resolveOpen(
  spec: number | string | (number | string)[] | undefined,
  ids: string[],
  single: boolean,
): string[] {
  if (spec === undefined) return []
  const out: string[] = []
  for (const entry of Array.isArray(spec) ? spec : [spec]) {
    const id =
      typeof entry === 'number' ? ids[entry] : ids.find((i) => i === entry)
    if (id && !out.includes(id)) out.push(id)
  }
  return single ? out.slice(0, 1) : out
}

/** Roving focus between question buttons. -1 for a key it does not handle. */
export function nextFocus(key: string, index: number, count: number): number {
  if (!count) return -1
  if (key === 'ArrowDown') return (index + 1) % count
  if (key === 'ArrowUp') return (index - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return -1
}

/** The open set after toggling `id`. */
export function toggled(open: string[], id: string, single: boolean): string[] {
  if (open.includes(id)) return open.filter((o) => o !== id)
  return single ? [id] : [...open, id]
}

/**
 * The words of an answer with their stagger index, or `null` when the answer
 * is too long to stagger. A word-by-word reveal of a paragraph is a pleasure;
 * of a page it is a wait, so past `limit` words the answer simply appears.
 */
export function wordsOf(text: string, limit = 70): string[] | null {
  const words = text.split(/\s+/).filter(Boolean)
  return words.length <= limit ? words : null
}
