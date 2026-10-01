/**
 * Re-export the existing showcase artwork as square 1:1 covers.
 *
 * Every cover in the Glass Crate is displayed at 1:1 in four places (Now
 * Playing, the disc label, the crate sleeve and the liner notes), so a wide
 * or portrait source has to be cropped rather than letterboxed. The disc
 * label crops a circle from the centre, so the subject is kept in the
 * middle of the frame.
 *
 *   node scripts/generate-work-covers.mjs
 *
 * Local files are centre-cropped with sharp. Remote ones are left as-is and
 * rendered through next/image, which already allow-lists res.cloudinary.com.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'public', 'work')
const SIZE = 1200

/** slug, source (local path or remote URL), and whether the source is remote. */
const SOURCES = [
  { slug: 'switchyard', src: 'public/assets/thumbnail-switchyard-2.webp' },
  { slug: 'primarindo-asia', src: 'public/assets/thumbnail-primarindo-2.webp' },
  {
    slug: 'habit-tracker',
    src: 'public/assets/thumbnail-habit-tracker-2.webp',
  },
  {
    slug: 'seaphantom',
    remote:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/y2l1g36bjudgsf6yr0eg.webp',
  },
  // seaphantom-p2p and labgrownbeasts used to be listed here against their
  // Cloudinary originals. Their `cover` is now empty in data/projects.ts, which
  // makes Cover draw the seeded generated art at runtime — the same treatment
  // the "More on GitHub" archive rows use, and the reason no local file is
  // generated for them. Adding one here would put the cover back on the network
  // path this was meant to leave.
]

async function buildLocal(slug, src) {
  const input = path.join(ROOT, src)
  const output = path.join(OUT_DIR, `${slug}-cover.webp`)

  await sharp(input)
    .rotate() // honour EXIF before cropping, or portrait shots land sideways
    .resize(SIZE, SIZE, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3',
    })
    .webp({ quality: 82 })
    .toFile(output)

  return output
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const report = []

  for (const entry of SOURCES) {
    if (entry.remote) {
      report.push({
        slug: entry.slug,
        cover: entry.remote,
        mode: 'remote (next/image)',
      })
      continue
    }
    const output = await buildLocal(entry.slug, entry.src)
    const { size } = await import('node:fs/promises').then((fs) =>
      fs.stat(output),
    )
    report.push({
      slug: entry.slug,
      cover: `/work/${path.basename(output)}`,
      mode: `generated 1:1 (${Math.round(size / 1024)}kb)`,
    })
  }

  await writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  )

  for (const line of report) {
    console.log(`${line.slug.padEnd(18)} ${line.mode.padEnd(28)} ${line.cover}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
