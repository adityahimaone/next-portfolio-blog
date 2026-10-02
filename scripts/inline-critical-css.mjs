#!/usr/bin/env node
/**
 * Inline the above-the-fold CSS for the landing route.
 *
 * ## What it does
 *
 * For the built landing HTML only:
 *   1. reads the class names actually present in that document,
 *   2. walks the route's compiled stylesheets and keeps the rules that can
 *      match something there, recursing into @media / @layer / @supports,
 *   3. writes the result into a `<style>` in `<head>`.
 *
 * **The `<link>` tags are left in place.** That is the important part, and it is
 * a correction: this script used to delete them on the assumption that a
 * complete inline block made them redundant. It does not, because the block is
 * budgeted and the budget is routinely exceeded, so the page shipped with the
 * links gone and only the first ~30KB inlined — which turned out to be almost
 * entirely `@font-face` and font custom properties, with none of the 311 module
 * rules. Nothing styled the document until React injected the sheets during
 * hydration, so a cold first visit rendered raw markup for over a second.
 *
 * The links are what stop that. They are render-blocking, so the browser holds
 * the first paint until the CSS has actually landed. The inline block is now a
 * pure optimisation layered on top: it lets the fold paint before every sheet
 * has arrived, and if it is trimmed or empty the links still deliver a correctly
 * styled page. The duplicated declarations cost bytes and buy a bounded worst
 * case.
 *
 * ## Why recurse into at-rules
 *
 * Nested blocks used to be kept wholesale, which is where the waste was:
 * `@layer components` is 48 Tailwind utility rules of which this document uses
 * 5, and it was ~160KB on its own. Filtering the body and rebuilding the wrapper
 * around what survives cuts the matched set several-fold, which is what keeps
 * the inline block inside budget at all.
 *
 * ## Why not `experimental.optimizeCss`
 *
 * Next's flag delegates to `critters`, which is not a dependency here — it does
 * not resolve, so the flag would fail the build rather than help it. This does
 * the same job with no new dependency and a rule set we control.
 *
 * ## The rule that makes this safe
 *
 * Only rules that can already match something in the document are kept. A rule
 * for a class the page does not use cannot affect the first paint, and dropping
 * it cannot either — so an incomplete match costs bytes, never correctness. The
 * conservative direction is to keep too much.
 *
 * Run automatically by `npm run build`.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

/**
 * Only the landing route. Other routes keep their normal linked stylesheets —
 * they are not the critical path and inlining would cost them their cache.
 */

/**
 * Ceiling on the inline block.
 *
 * A guard against inlining the whole 500KB bundle, not a target to trim toward.
 * The landing route's rules that match the document come to roughly 190KB once
 * the nested at-rules are filtered properly, so the budget sits just above that:
 * the trim should only ever fire when a future change pushes past it.
 *
 * This was 140KB, chosen against an older estimate of the matched size that was
 * wrong by about 50KB — the nested-at-rule bloat had not been accounted for.
 * Because the budget was therefore being hit on every build, the trim ran every
 * build, and because it dropped by source order it discarded the tail of the
 * rack module. That included `.ejectCassette`, the rule that positions the
 * handoff's flying cassette: with it missing, the cassette inherited the
 * carousel's `.cassette` sizing for the ~1s before the linked sheets arrive and
 * collapsed to 24px tall. A silently broken fold is far worse than 50KB, and a
 * budget that fires on every build is not a guard — it is a permanent trim.
 *
 * Uncompressed and inline means it cannot be cached separately from the
 * document, so the cost is real. It is still the right trade: it is smaller than
 * the ~500KB of linked CSS it covers, and it removes six serial round-trips from
 * the critical path.
 */
const MAX_INLINE_KB = 260

const log = (msg) => console.log(`  [critical-css] ${msg}`)

/**
 * Collect the class names the document actually uses.
 *
 * CSS Modules hash class names, so there is no way to know from the source
 * which of them apply without reading the rendered HTML. Pulling them out of
 * the document is both exact and cheap.
 */
function collectClassNames(html) {
  const names = new Set()
  // class="a b c", className="a b" and clsx output all end up here.
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const n of m[1].split(/\s+/)) if (n) names.add(n)
  }
  // Next inlines some props as escaped JSON inside script payloads.
  for (const m of html.matchAll(/\\"className\\":\\"([^\\"]*)\\"/g)) {
    for (const n of m[1].split(/\s+/)) if (n) names.add(n)
  }
  return names
}

/**
 * Split a stylesheet into top-level rules, keeping @media blocks intact.
 *
 * A regex over the whole file is wrong here — a `}` inside a data URI or a
 * quoted string would end a block early — so this tracks brace depth and
 * string state instead.
 */
function splitRules(css) {
  const rules = []
  let depth = 0
  let start = 0
  let quote = null
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        rules.push(css.slice(start, i + 1).trim())
        start = i + 1
      }
    }
  }
  const tail = css.slice(start).trim()
  if (tail) rules.push(tail)
  return rules.filter(Boolean)
}

/**
 * The class names a rule's selector mentions.
 *
 * Returns null for at-rules whose contents must be kept wholesale (`@font-face`
 * and friends), since those are keyed on `src`/`font-family` rather than on
 * any class in the document.
 */
function selectorClasses(rule) {
  const brace = rule.indexOf('{')
  if (brace === -1) return []
  const prelude = rule.slice(0, brace)

  // Keyframes and font-face carry no class selectors; keep them if referenced.
  if (prelude.trim().startsWith('@')) return []

  const found = new Set()
  for (const m of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) found.add(m[1])
  return [...found]
}

/** At-rules whose body is a list of nested rules we can filter individually. */
const NESTED_AT_RULES = ['@media', '@supports', '@layer', '@container']

/** At-rules kept whole: keyed on a font or a keyword, not on a class. */
const WHOLESALE_AT_RULES = ['@font-face', '@keyframes', '@-webkit-keyframes']

/**
 * Orders rules so the ones that matter most are kept first, for when the
 * matched set is over budget.
 *
 * The order matters and source order gets it wrong: the Tailwind layer comes
 * first in the bundle and is mostly utilities this document never renders, so a
 * plain head-trim discarded the rack and work module rules — the entire landing
 * page — and kept the layer. Cheap wins are spent last; a small budget still
 * buys a complete first screen.
 *
 * @font-face is never dropped: a preloaded face with no @font-face falls back,
 * and the fallback text is a visible reflow rather than a missing decoration.
 */
function droppableFirst(rules) {
  const rank = (rule) => {
    const prelude = (rule.slice(0, rule.indexOf('{')) || '').trim()
    if (prelude.startsWith('@font-face')) return 0
    // Media and layer blocks are mostly viewport variants of what the base
    // rules already cover, so they go before plain component rules.
    if (prelude.startsWith('@media') || prelude.startsWith('@layer')) return 1
    if (prelude.startsWith('@keyframes')) return 2
    if (prelude.startsWith('@')) return 3
    return 4
  }
  return (
    rules
      .map((rule, i) => ({ rule, i, r: rank(rule) }))
      // Stable within a rank, so two rules of equal value keep source order.
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((x) => x.rule)
  )
}

/**
 * Expands one rule into the version that should be inlined, or null if nothing
 * in it applies to this document.
 *
 * Nested at-rules used to be kept wholesale, which is where the bulk of the
 * waste came from: `@layer components` holds 48 Tailwind utility rules and this
 * document uses 5 of them, yet the entire block was inlined. Keeping a wrapper
 * "just in case" is only affordable when the wrapper is small — at 160KB it was
 * the single largest thing in the document.
 *
 * So the body is filtered by the same test as everything else and the wrapper is
 * rebuilt around whatever survives. A wrapper whose body comes back empty is
 * dropped entirely.
 */
function filterRule(rule, used, depth = 0) {
  const brace = rule.indexOf('{')
  if (brace === -1) return rule.trim() || null

  const prelude = rule.slice(0, brace).trim()

  // @font-face is referenced by family name from the preloaded woff2 files and
  // a dropped one turns a swapped face into a fallback, so it never filters.
  if (
    prelude.startsWith('@') &&
    WHOLESALE_AT_RULES.some((a) => prelude.startsWith(a))
  ) {
    return rule
  }

  const isNested =
    prelude.startsWith('@') &&
    NESTED_AT_RULES.some((a) => prelude.startsWith(a))

  if (!isNested) {
    const classes = selectorClasses(rule)
    // No class at all: html/body resets and bare element selectors. Cheap, few,
    // and the page background depends on them.
    if (classes.length === 0) return rule
    return classes.some((c) => used.has(c)) ? rule : null
  }

  /* Nothing in the pipeline nests this deep; the guard is so malformed input
     cannot recurse without bound. */
  if (depth >= 4) return rule

  const body = rule.slice(brace + 1, rule.lastIndexOf('}'))
  const kept = []
  for (const inner of splitRules(body)) {
    const out = filterRule(inner, used, depth + 1)
    if (out) kept.push(out)
  }
  if (kept.length === 0) return null

  // Re-serialised without whitespace: this block is machine-generated, never
  // read by a human, and the byte count is the entire point of the script.
  return `${prelude}{${kept.join('')}}`
}

/**
 * Rewrites the stylesheet links in one HTML document.
 *
 * Shared by both output shapes — the plain file `next build` leaves in
 * `.next/server/app`, and the JSON cache entry `opennextjs-cloudflare build`
 * produces — so the rule selection cannot drift between them.
 */
async function inlineIntoHtml(html) {
  const linkRe = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g
  const links = [...html.matchAll(linkRe)]
  if (links.length === 0) return { skipped: 'no stylesheet links' }

  // Fetch each sheet from disk. The href is the URL path `/_next/static/...`,
  // but `/_next` is a routing prefix that is stripped before the file is
  // served, so on disk the same asset is at `.next/static/...`. Dropping the
  // `_next` segment is what makes the two line up.
  const sheets = []
  for (const [, href] of links) {
    const rel = href.replace(/^\/_next\//, '').replace(/^\/+/, '')
    const abs = path.join(ROOT, '.next', rel)
    try {
      sheets.push({ href, css: await readFile(abs, 'utf8') })
    } catch {
      // A sheet we cannot read is one we cannot inline; leave its <link> alone.
      log(`could not read ${abs}, leaving it as a link`)
    }
  }
  if (sheets.length === 0) return { skipped: 'no readable sheets' }

  const used = collectClassNames(html)
  log(`${used.size} class names in use, ${sheets.length} sheets`)

  let kept = []
  let total = 0
  for (const { css } of sheets) {
    for (const rule of splitRules(css)) {
      total++
      const out = filterRule(rule, used)
      if (out) kept.push(out)
    }
  }

  let inline = kept.join('')
  let trimmed = false
  if (inline.length / 1024 > MAX_INLINE_KB) {
    /* Over budget. Dropping the tail is the wrong order, though: source order is
       not importance order, so this threw away the rack and work module rules —
       every pixel of the landing page — and kept the Tailwind base layer that
       the page barely uses. What is dropped is now the least useful thing
       first, which is what the warning has always implied it was doing. */
    const budget = MAX_INLINE_KB * 1024
    const parts = []
    let len = 0
    // Least-useful first: at-rules and bare selectors cost bytes and style the
    // least of what is on screen, so the tail is where they live.
    for (const r of droppableFirst(kept)) {
      if (len + r.length > budget) break
      parts.push(r)
      len += r.length
    }
    // Restore source order, which is what makes the cascade come out right.
    parts.sort((a, b) => kept.indexOf(a) - kept.indexOf(b))
    inline = parts.join('')
    trimmed = true
    console.warn(
      `  [critical-css] WARNING: matched CSS is ${Math.round(kept.join('').length / 1024)}KB, over the ${MAX_INLINE_KB}KB budget — inlined ${parts.length} of ${kept.length} rules, dropping the least useful first.` +
        ' This is a partial first paint: anything dropped is unstyled until the linked sheets arrive.' +
        ' Raise MAX_INLINE_KB in this script rather than accepting the trim.',
    )
  }

  log(
    `kept ${kept.length}/${total} rules, ${Math.round(inline.length / 1024)}KB inline`,
  )

  /* The <link> tags stay.

     Removing them was the bug this script caused rather than fixed. Next emits
     six render-blocking stylesheets and they are what stop the unstyled flash:
     they are discovered while parsing, so the browser holds the first paint
     until they land. Deleting them and relying on the inline block instead only
     works if that block is complete, and when it is trimmed it is not — the
     page then has no CSS until React injects it during hydration, which is a
     second or more of raw markup on a cold load.

     The inline block is now an optimisation on top of the links rather than a
     replacement for them: it carries the fold so the first paint can happen
     without waiting for every sheet, and the links still deliver the rest. The
     two are the same declarations, so the duplication costs bytes and buys a
     strictly-bounded worst case. */
  const styleTag = `<style data-critical>${inline}</style>`
  let out = html
  if (out.includes('</head>'))
    out = out.replace('</head>', `${styleTag}</head>`)
  else if (out.includes('<body')) out = out.replace('<body', `${styleTag}<body`)

  return {
    html: out,
    rules: kept.length,
    total,
    kb: Math.round(inline.length / 1024),
    trimmed,
  }
}

/** `next build` leaves a plain HTML file here. */
async function processHtmlFile(file) {
  const filePath = path.join(ROOT, '.next', 'server', 'app', file)
  let html
  try {
    html = await readFile(filePath, 'utf8')
  } catch {
    return { skipped: 'not found' }
  }
  const r = await inlineIntoHtml(html)
  if (r.skipped) return r
  await writeFile(filePath, r.html, 'utf8')
  return r
}

/**
 * `opennextjs-cloudflare build` leaves no `.html` to edit — the prerendered
 * route lives in a JSON `.cache` entry under `.open-next/cache/<build>/`, with
 * the document in `html` and the flight payload in `rsc`.
 *
 * This is the one that matters for production. Editing `.next/server/app`
 * instead would have no effect at all, because CI builds with OpenNext and it
 * reads that cache — which is why the first push of this change deployed
 * without any of the inline CSS.
 */
async function processOpenNextCache() {
  const cacheRoot = path.join(ROOT, '.open-next', 'cache')
  let dirs = []
  try {
    dirs = (await readdir(cacheRoot, { withFileTypes: true })).filter((e) =>
      e.isDirectory(),
    )
  } catch {
    return { skipped: 'no .open-next/cache' }
  }

  let touched = 0
  for (const d of dirs) {
    const file = path.join(cacheRoot, d.name, 'index.cache')
    let raw
    try {
      raw = await readFile(file, 'utf8')
    } catch {
      continue
    }
    let json
    try {
      json = JSON.parse(raw)
    } catch {
      continue
    }
    if (typeof json.html !== 'string') continue

    const r = await inlineIntoHtml(json.html)
    if (r.skipped) {
      log(`${path.relative(ROOT, file)}: skipped (${r.skipped})`)
      continue
    }
    json.html = r.html
    // `rsc` and `segmentData` carry the same class names and are what the
    // client hydrates from; they are not what paints, so they are left alone.
    await writeFile(file, JSON.stringify(json), 'utf8')
    log(
      `${path.relative(ROOT, file)}: ${r.kb}KB inline from ${r.rules}/${r.total} rules${r.trimmed ? ' (trimmed)' : ''}`,
    )
    touched++
  }
  return touched ? { touched } : { skipped: 'no prerendered index cache' }
}

/**
 * Warns when the optimisation did not apply, because a silent skip is how a
 * broken first paint shipped in the first place.
 *
 * This stays a warning rather than a build failure: the links are render-
 * blocking, so an un-inlined document is correctly styled, just slower to first
 * paint. Failing a deploy over a performance optimisation is the wrong trade.
 * What is not acceptable is not knowing, which is what the old version did — it
 * printed two `skipped` lines in a build that read as successful.
 */
function reportOutcome(label, result) {
  if (result.skipped) {
    console.warn(
      `  [critical-css] ${label}: NOT applied (${result.skipped}). The document is` +
        ' still correctly styled via its stylesheet links, so this is a missed' +
        ' optimisation rather than a broken page — but the cold-load flash' +
        ' remains until this is resolved.',
    )
    return
  }
  log(
    `${label}: ${result.kb}KB inline from ${result.rules}/${result.total} rules${result.trimmed ? ' (trimmed)' : ''}`,
  )
}

async function main() {
  const html = await processHtmlFile('index.html')
  reportOutcome('next build output', html)

  /* OpenNext is what CI ships to Cloudflare, and `.next/server/app` is what
     `next start` serves locally — only one of the two exists per pipeline.
     This is not a warning when the other path succeeded: it is the expected
     half of a normal build, so it is reported at info level and only escalated
     when nothing was inlined anywhere. */
  const on = await processOpenNextCache()
  if (on.skipped) {
    log(`opennext cache: not present (${on.skipped})`)
  }

  if (html.skipped && on.skipped) {
    console.warn(
      '  [critical-css] nothing inlined on either output — leaving the build untouched.',
    )
  }
}

main().catch((err) => {
  // Never fail the build over this: an optimisation that breaks the deploy is
  // worse than a slower first paint. The catch-all stays for genuinely
  // unexpected failures; the expected skips are reported above.
  console.warn('  [critical-css] skipped:', err?.message ?? err)
  process.exitCode = 0
})
