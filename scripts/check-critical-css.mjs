// Fails the build if the landing document ever ships without render-blocking
// CSS in <head>. That was the cause of a >1s unstyled flash on a cold first
// visit: the critical-css script deleted the <link> tags and then inlined a
// trimmed block that turned out to be almost entirely @font-face.
import { readFileSync } from 'node:fs'

const html = readFileSync('.next/server/app/index.html', 'utf8')
const head = html.slice(0, html.indexOf('</head>'))

const links = [
  ...head.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g),
].map((m) => m[1])

if (links.length === 0) {
  console.error(
    'FAIL: the landing document has no stylesheet <link> in <head>.\n' +
      '      The page will render unstyled until React injects CSS during hydration.\n' +
      '      Check that scripts/inline-critical-css.mjs is not removing the links.',
  )
  process.exit(1)
}

// The inline block must not be the only thing standing between the document and
// a styled first paint.
const critical = head.match(/<style[^>]*data-critical[^>]*>([\s\S]*?)<\/style>/)
if (!critical) {
  console.warn(
    'WARN: no data-critical <style> — the fold waits on the links. That is slower\n' +
      '      but correct, so this is not failing the build.',
  )
} else {
  const css = critical[1]
  // Sanity: the block must carry real layout rules, not only font faces.
  const fontOnly = css.replace(/@font-face\{[^}]*\}/g, '').trim()
  if (fontOnly.length < 2000) {
    console.error(
      `FAIL: the inline critical CSS is ${fontOnly.length} bytes of non-font rules.\n` +
        '      It is almost entirely @font-face, so the links are doing all the work\n' +
        '      and the inline block is not reducing first paint at all.',
    )
    process.exit(1)
  }
}

console.log(
  `OK: ${links.length} stylesheet links in <head> + ` +
    `${critical ? Math.round(critical[1].length / 1024) : 0}KB inline critical CSS.`,
)
