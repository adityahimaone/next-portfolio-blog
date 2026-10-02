// Verifies the OpenNext artifact that is actually deployed: the cache entry
// must keep its stylesheet links and carry real layout CSS inline.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = '.open-next/cache'
const dirs = readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(root, e.name))
  .filter((d) => {
    try {
      return readFileSync(path.join(d, 'index.cache'), 'utf8')
    } catch {
      return false
    }
  })

if (dirs.length === 0) {
  console.log('no prerendered index cache — nothing to check')
  process.exit(0)
}

let failed = false
for (const dir of dirs) {
  const file = path.join(dir, 'index.cache')
  const json = JSON.parse(readFileSync(file, 'utf8'))
  const html = json.html || ''
  const head = html.slice(0, html.indexOf('</head>') + 7)

  const links = [
    ...head.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g),
  ].map((m) => m[1])

  const critical = head.match(
    /<style[^>]*data-critical[^>]*>([\s\S]*?)<\/style>/,
  )
  const nonFont = critical
    ? critical[1].replace(/@font-face\{[^}]*\}/g, '').trim().length
    : 0

  console.log(`${path.basename(dir)}:`)
  console.log(`  stylesheet links : ${links.length}`)
  console.log(
    `  inline critical  : ${critical ? Math.round(critical[1].length / 1024) + 'KB' : 'none'}`,
  )
  console.log(`  non-font rules   : ${nonFont} bytes`)

  if (links.length === 0) {
    console.error(
      '  FAIL: no stylesheet link in <head> — this is what caused the flash.',
    )
    failed = true
  }
  if (nonFont < 2000) {
    console.error('  FAIL: inline block is almost entirely @font-face.')
    failed = true
  }
}

process.exit(failed ? 1 : 0)
