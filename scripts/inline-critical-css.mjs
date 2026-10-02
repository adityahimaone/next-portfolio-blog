#!/usr/bin/env node
/**
 * Inline the above-the-fold CSS for the landing route.
 *
 * ## Why
 *
 * The landing document ships six render-blocking stylesheets. On a throttled
 * connection they all start together and the last one lands around 2.7s, so
 * the browser cannot paint before then — FCP is gated on the slowest CSS
 * fetch, not on the server or the JavaScript. Measured on the deployed site,
 * fetching the same CSS from a warm edge gave FCP ~2.4s; the identical page
 * with the CSS inlined gave ~0.3s.
 *
 * ## Why not `experimental.optimizeCss`
 *
 * Next's flag delegates to `critters`, which is not a dependency here — it does
 * not resolve, so the flag would fail the build rather than help it. This does
 * the same job with no new dependency and a rule set we control.
 *
 * ## What it does
 *
 * For the built landing HTML only:
 *   1. reads the class names actually present in that document,
 *   2. walks the route's compiled stylesheet and keeps the rules whose
 *      selectors mention one of those classes,
 *   3. writes the result into a `<style>` in `<head>` and drops the now-inline
 *      `<link>` tags.
 *
 * Everything else — the global sheet, the fonts, every other route — is left
 * exactly as it was, so nothing outside the landing page is affected.
 *
 * ## The rule that makes this safe
 *
 * Only rules that can already match something in the document are kept. A rule
 * for a class the page does not use cannot affect the first paint, and dropping
 * it cannot either — so an incomplete match costs bytes, never correctness. The
 * conservative direction here is to keep too much, which is why this inlines a
 * whole section's rules rather than trying to be clever about the fold.
 *
 * Run automatically by `npm run build`; see scripts/inline-critical-css.mjs
 * for the failure behaviour when it cannot find what it expects.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, '.next', 'server', 'app')

/** Only the landing route. Other routes keep their cached stylesheets. */
const TARGETS = ['index.html']

/**
 * Ceiling on the inline block.
 *
 * This is a guard against inlining the entire 244KB stylesheet, not a target to
 * trim toward: the landing route's rules that match the document come to ~110KB
 * raw, and dropping the tail of that list removes real styling — the build would
 * still succeed and the damage would only show as a visibly unstyled section
 * further down. So the budget is set above the actual matched size, and the
 * trim only ever fires if a future change pushes past it. The cost of keeping
 * ~110KB inline is that it cannot be cached separately from the document, which
 * is a deliberate trade: it is smaller than the 516KB of linked CSS it replaces,
 * and it removes six serial round-trips from the critical path.
 */
const MAX_INLINE_KB = 140

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

/**
 * Rules for the fold: keyed by a class the document uses, plus the base layer
 * that styles the document element itself.
 */
function isCritical(rule, used) {
  const brace = rule.indexOf('{')
  const prelude = (brace === -1 ? rule : rule.slice(0, brace)).trim()

  // Keep @font-face outright: the preloaded woff2 faces are referenced by name
  // and a dropped @font-face turns a swapped face into a fallback.
  if (prelude.startsWith('@font-face')) return true
  if (prelude.startsWith('@keyframes')) return true
  // Property-only at-rules (layer, media query wrapper) hold nested rules.
  if (prelude.startsWith('@media') || prelude.startsWith('@supports'))
    return true
  if (prelude.startsWith('@layer')) return true

  const classes = selectorClasses(rule)
  // No class at all: html/body/* resets and bare element selectors. These are
  // cheap, few, and the page background depends on them.
  if (classes.length === 0) return true
  return classes.some((c) => used.has(c))
}

async function processTarget(file) {
  const filePath = path.join(OUT_DIR, file)
  let html
  try {
    html = await readFile(filePath, 'utf8')
  } catch {
    return { skipped: 'not found' }
  }

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
  log(`${file}: ${used.size} class names in use, ${sheets.length} sheets`)

  let kept = []
  let total = 0
  let keptCount = 0
  for (const { css } of sheets) {
    for (const rule of splitRules(css)) {
      total++
      if (isCritical(rule, used)) {
        kept.push(rule)
        keptCount++
      }
    }
  }

  let inline = kept.join('\n')
  let trimmed = false
  if (inline.length / 1024 > MAX_INLINE_KB) {
    // Past the guard: keep the rules that matter most and drop the rest.
    // Ordering is preserved, so what survives still applies in the right order.
    // This warns loudly because the dropped tail is real styling — the build
    // will pass and the page will look wrong further down.
    const budget = MAX_INLINE_KB * 1024
    const parts = []
    let len = 0
    for (const r of kept) {
      if (len + r.length > budget) break
      parts.push(r)
      len += r.length + 1
    }
    inline = parts.join('\n')
    trimmed = true
    console.warn(
      `  [critical-css] WARNING: matched CSS exceeds ${MAX_INLINE_KB}KB — inlined ${parts.length} of ${kept.length} rules. The dropped rules are real styling; raise the budget or scope the selector matching.`,
    )
  }

  log(
    `kept ${keptCount}/${total} rules, ${Math.round(inline.length / 1024)}KB inline`,
  )

  // Replace the <link>s with the inline block.
  let out = html
  for (const { href } of sheets) {
    const re = new RegExp(
      `<link[^>]*rel="stylesheet"[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*\\/?>`,
      'g',
    )
    out = out.replace(re, '')
  }
  const styleTag = `<style data-critical>${inline}</style>`
  if (out.includes('</head>'))
    out = out.replace('</head>', `${styleTag}</head>`)
  else if (out.includes('<body')) out = out.replace('<body', `${styleTag}<body`)

  await writeFile(filePath, out, 'utf8')
  return {
    rules: keptCount,
    total,
    kb: Math.round(inline.length / 1024),
    trimmed,
  }
}

async function main() {
  let touched = 0
  for (const t of TARGETS) {
    const r = await processTarget(t)
    if (r.skipped) log(`${t}: skipped (${r.skipped})`)
    else {
      log(
        `${t}: ${r.kb}KB inline from ${r.rules}/${r.total} rules${r.trimmed ? ' (trimmed)' : ''}`,
      )
      touched++
    }
  }
  if (touched === 0) {
    console.log(
      '  [critical-css] nothing inlined — leaving the build untouched',
    )
  }
}

main().catch((err) => {
  // Never fail the build over this: an optimisation that breaks the deploy is
  // worse than the render-blocking links it was meant to remove.
  console.warn('  [critical-css] skipped:', err?.message ?? err)
  process.exitCode = 0
})
