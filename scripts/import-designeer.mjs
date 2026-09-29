/**
 * Imports designeer.xyz and shoogle.dev into content/bookmarks.json.
 *
 * Both sites publish schema.org ItemList JSON-LD, so the catalogue is read from
 * <script type="application/ld+json"> rather than scraped from the DOM. Each
 * group declares a `numberOfItems`; the script asserts the parsed leaf count
 * matches, so an upstream change fails loudly instead of half-importing.
 *
 * Rows carry the `bm-des-` id prefix and are replaced wholesale on every run,
 * leaving the hand-written bookmarks in the file untouched. Re-running is safe
 * and is how the catalogue gets refreshed.
 *
 *   node scripts/import-designeer.mjs            # scrape and merge
 *   node scripts/import-designeer.mjs --no-probe # skip the framing probe
 */
import fs from 'node:fs'
import path from 'node:path'

const BOOKMARKS_PATH = path.join(process.cwd(), 'content', 'bookmarks.json')
const PREVIEW_OUT = path.join(
  process.cwd(),
  'features',
  'bookmarks',
  'constants',
  'previewable.ts',
)

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** The six designeer pages, each with the groups it declares. */
const DESIGNEER_PAGES = [
  {
    url: 'https://designeer.xyz/',
    tag: 'inspiration',
    groups: ['Design Galleries', 'Interface Design', 'Reading'],
  },
  {
    url: 'https://designeer.xyz/components',
    tag: 'components',
    groups: ['Component Libraries', 'Motion'],
  },
  {
    url: 'https://designeer.xyz/build',
    tag: 'build',
    groups: ['Development', 'Agents & MCP', 'Deploy'],
  },
  {
    url: 'https://designeer.xyz/visuals',
    tag: 'visuals',
    groups: ['Type', 'Color', '3D', 'Shaders', 'Icons'],
  },
  {
    url: 'https://designeer.xyz/utilities',
    tag: 'utilities',
    groups: ['Utilities', 'Desktop', 'Video & Capture', 'Whiteboard'],
  },
  { url: 'https://designeer.xyz/designers', tag: 'designers', groups: null },
]

/** shoogle.dev is a single tool rather than a list of them, so it is hand-added. */
const SHOOGLE = {
  id: 'bm-des-shoogle',
  title: 'Shoogle',
  url: 'https://shoogle.dev/',
  description:
    'Search engine for shadcn/ui components and blocks, spanning many community registries.',
  category: 'Component Libraries',
  tags: ['designeer', 'shoogle', 'shadcn', 'registry'],
  faviconUrl: 'https://www.google.com/s2/favicons?domain=shoogle.dev&sz=64',
  featured: false,
}

/**
 * The curated pin set — the twelve links that head the crate.
 *
 * Designeer carries no opinion about which of its 551 entries matter, so the
 * selection lives here rather than in the data: a re-run of the importer
 * rewrites every `bm-des-` row, and without this the pinned tiles would be
 * lost on the first refresh. Matched by URL, not id, so it survives the id
 * slugs changing. This project's own author is a designer and sound engineer,
 * so the set leans component libraries and animation over dev tooling.
 */
const PINNED_URLS = [
  'https://reactbits.dev',
  'https://ui.shadcn.com/',
  'https://magicui.design/',
  'https://ui.aceternity.com/',
  'https://motion.dev/',
  'https://gsap.com/',
  'https://beui.dev/',
  'https://21st.dev/',
  'https://lucide.dev',
  'https://www.awwwards.com',
  'https://emilkowal.ski/',
  'https://shoogle.dev/',
]

const normalise = (url) => String(url).replace(/\/$/, '')
const PINNED = new Set(PINNED_URLS.map(normalise))

const html = new Map()

async function loadHtml(url) {
  if (html.has(url)) return html.get(url)
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`${url} responded ${res.status}`)
  const text = await res.text()
  html.set(url, text)
  return text
}

/** Parses every JSON-LD block on a page. */
function jsonLdBlocks(pageHtml) {
  const out = []
  for (const match of pageHtml.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      out.push(JSON.parse(match[1]))
    } catch {
      // A malformed block costs us its entries, not the whole import.
    }
  }
  return out
}

/**
 * Collects {group, name, url, description, declared} from a page.
 * `wanted` is a list of group names, or null for a page with no groups.
 */
function extractEntries(pageHtml, wanted) {
  const found = new Map()
  const declared = new Map()
  const seen = new Set()

  const visitList = (list) => {
    if (!Array.isArray(list)) return
    for (const element of list) {
      const item = element?.item
      if (!item) continue
      if (Array.isArray(item.itemListElement)) {
        // A named group holding its own list.
        if (typeof item.name === 'string') {
          declared.set(item.name, item.numberOfItems ?? null)
        }
        if (wanted === null || wanted.includes(item.name)) {
          for (const child of item.itemListElement) {
            const leaf = child?.item
            if (leaf?.url && !seen.has(leaf.url)) {
              seen.add(leaf.url)
              if (!found.has(item.name)) found.set(item.name, [])
              found.get(item.name).push({
                group: item.name,
                name: leaf.name,
                url: leaf.url,
                description: leaf.description ?? '',
              })
            }
          }
        }
        visitList(item.itemListElement)
      } else if (item.url && wanted === null) {
        // A flat ItemList — the designers page has no group wrapper.
        const group = 'Design Engineers'
        if (!seen.has(item.url)) {
          seen.add(item.url)
          if (!found.has(group)) found.set(group, [])
          found.get(group).push({
            group,
            name: item.name,
            url: item.url,
            description: item.description ?? '',
          })
        }
      }
    }
  }

  for (const block of jsonLdBlocks(pageHtml)) {
    visitList(block.itemListElement)
    visitList(block.mainEntity?.itemListElement)
  }

  return { found, declared }
}

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

const IMPORTED_AT = new Date().toISOString()

const collected = []
let declaredTotal = 0

for (const page of DESIGNEER_PAGES) {
  const pageHtml = await loadHtml(page.url)
  const { found, declared } = extractEntries(pageHtml, page.groups)

  for (const [group, entries] of found) {
    const expected = declared.get(group)
    if (expected != null && expected !== entries.length) {
      throw new Error(
        `${page.url} / ${group}: declared ${expected} but parsed ${entries.length}`,
      )
    }
    declaredTotal += entries.length
    for (const entry of entries) {
      collected.push({
        id: `bm-des-${slug(entry.url)}`,
        title: entry.name,
        url: entry.url,
        description: entry.description,
        category: entry.group,
        tags: ['designeer', page.tag, entry.group.toLowerCase()],
        createdAt: IMPORTED_AT,
      })
    }
    console.error(`${group.padEnd(20)} ${entries.length}`)
  }
}

collected.push({ ...SHOOGLE, createdAt: IMPORTED_AT })

// A URL can appear in more than one group; the first occurrence wins.
const unique = new Map()
for (const row of collected) {
  const key = row.url.replace(/\/$/, '')
  if (!unique.has(key)) unique.set(key, row)
}
const deduped = [...unique.values()]

// The unique count is checked against the declared total only. The shoogle row
// is a fallback: shoogle.dev is itself listed on designeer's components page, so
// when designeer has it the dedupe above keeps their entry and drops ours.
if (deduped.length !== declaredTotal) {
  throw new Error(`expected ${declaredTotal} rows, collected ${deduped.length}`)
}
if (!deduped.some((row) => row.url === 'https://shoogle.dev/')) {
  throw new Error('shoogle.dev is missing from the import')
}

// A hand-written bookmark for a site designeer also lists would otherwise
// appear twice, once under its own channel and once under designeer's. The
// existing row is the curated one, so the import yields to it.
const existing = JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf-8'))
const handWritten = existing.filter(
  (row) => !String(row.id).startsWith('bm-des-'),
)
const handWrittenUrls = new Set(
  handWritten.map((row) => String(row.url).replace(/\/$/, '')),
)
const imported = deduped.filter(
  (row) => !handWrittenUrls.has(row.url.replace(/\/$/, '')),
)
for (const row of deduped) {
  if (!imported.includes(row)) {
    console.error(`skipped ${row.url} — already saved by hand`)
  }
}
console.error(`\ndesigneer+shoogle rows: ${imported.length}`)

/**
 * Probes each host for framing headers. A blocked frame fails silently — there is
 * no error event to catch — so preview is restricted to hosts that opt in.
 */
async function probeFraming(rows) {
  const hosts = new Map()
  for (const row of rows) {
    try {
      // Normalised the same way the row does it, so a www host still matches.
      hosts.set(new URL(row.url).hostname.replace(/^www\./, ''), row.url)
    } catch {
      // A URL we cannot parse also cannot be previewed.
    }
  }

  const allowed = []
  const entries = [...hosts.entries()]
  const CONCURRENCY = 16

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(async ([host, url]) => {
        try {
          const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(12000),
            headers: { 'user-agent': UA },
          })
          const xfo = (res.headers.get('x-frame-options') || '')
            .trim()
            .toLowerCase()
          const csp = res.headers.get('content-security-policy') || ''
          const frameAncestors =
            /frame-ancestors([^;]*)/i.exec(csp)?.[1]?.trim() ?? ''
          const cspBlocked =
            frameAncestors.length > 0 &&
            !/frame-ancestors[^;]*\*/i.test(frameAncestors) &&
            /\b(none|'none'|self|'self'|sameorigin|'sameorigin')\b/i.test(
              frameAncestors,
            )
          if (xfo.length > 0 || cspBlocked) return null
          return host
        } catch {
          return null
        }
      }),
    )
    for (const host of results) {
      if (host) allowed.push(host)
    }
    if (Math.floor(i / CONCURRENCY) % 10 === 0) {
      console.error(`  probed ${i + batch.length}/${entries.length}`)
    }
  }

  return [...new Set(allowed)].sort()
}

let previewable = []
if (!process.argv.includes('--no-probe')) {
  console.error(
    `\nprobing ${new Set([...imported, ...handWritten].map((r) => new URL(r.url).hostname)).size} hosts for framing`,
  )
  previewable = await probeFraming([...imported, ...handWritten])
  console.error(`previewable hosts: ${previewable.length}`)
  const body = `/**
 * Hosts that permit being framed, probed by scripts/import-designeer.mjs.
 *
 * A site that sends X-Frame-Options, or a CSP frame-ancestors that excludes us,
 * fails to load in an iframe and fires no error event — so the row preview is
 * limited to this list rather than attempting a frame and rendering a blank box.
 * Regenerate with: node scripts/import-designeer.mjs
 *
 * Generated file. Edit the importer, not this.
 */
export const PREVIEWABLE_HOSTS = new Set([
${previewable.map((h) => `  '${h}',`).join('\n')}
])
`
  fs.writeFileSync(PREVIEW_OUT, body, 'utf-8')
}

// Merge: keep every bookmark the importer did not write.
const merged = [...imported, ...handWritten]

// The pin set is a curation, not a scrape: re-apply it over the whole file so a
// refresh cannot silently drop it, and fail loudly if a pinned site has gone
// from the catalogue.
const stillPresent = []
for (const url of PINNED_URLS) {
  if (merged.some((row) => normalise(row.url) === normalise(url))) {
    stillPresent.push(url)
  } else {
    console.error(`pin target no longer in the catalogue: ${url}`)
  }
}
if (stillPresent.length !== PINNED_URLS.length) {
  throw new Error(
    `only ${stillPresent.length}/${PINNED_URLS.length} pinned urls are present`,
  )
}
for (const row of merged) {
  row.featured = PINNED.has(normalise(row.url))
}

fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(merged, null, 2), 'utf-8')
console.error(
  `\nbookmarks.json: ${handWritten.length} kept + ${imported.length} imported = ${merged.length}`,
)
console.error(`pinned: ${merged.filter((row) => row.featured).length}`)
