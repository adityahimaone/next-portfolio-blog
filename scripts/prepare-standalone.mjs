// Assemble the standalone server directory after `next build`.
//
// `output: 'standalone'` emits a runnable server at .next/standalone/server.js,
// but the trace only covers the server's own module graph. Three things the
// running site needs are deliberately left behind:
//
//   public/       -- static files served from the site root (og images, favicons)
//   .next/static/ -- hashed build output; every page references these
//   .next/cache/  -- keeps the image optimizer's already-encoded variants warm,
//                    so a redeploy does not re-encode covers from scratch
//
// The Next docs say to `cp` these in by hand. Manual copies are what a deploy
// forgets, and a site missing .next/static serves HTML that points at JS and CSS
// that 404 -- the failure is a blank page in the browser, not an error in the
// deploy log. This runs as part of `npm run build` instead, so a standalone
// bundle cannot be produced half-assembled.

import { cp, mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const standaloneDir = path.join(projectDir, '.next', 'standalone')

const exists = async (p) => {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

// Replace the destination outright rather than copying over the top. The
// standalone bundle's own node_modules/.next tree must match the build that just
// happened, and a partial overlay from an earlier build is exactly the stale
// state this step exists to prevent.
const copyInto = async (from, to, { optional = false } = {}) => {
  if (!(await exists(from))) {
    if (optional) return false
    throw new Error(
      `Expected ${path.relative(projectDir, from)} to exist after build`,
    )
  }

  await rm(to, { recursive: true, force: true })
  await mkdir(path.dirname(to), { recursive: true })
  await cp(from, to, { recursive: true })
  return true
}

const main = async () => {
  if (!(await exists(path.join(standaloneDir, 'server.js')))) {
    throw new Error(
      "No .next/standalone/server.js. Is `output: 'standalone'` still set in next.config.mjs?",
    )
  }

  await copyInto(
    path.join(projectDir, 'public'),
    path.join(standaloneDir, 'public'),
    {
      optional: true,
    },
  )
  await copyInto(
    path.join(projectDir, '.next', 'static'),
    path.join(standaloneDir, '.next', 'static'),
  )
  // Optional: Next only writes this when something was cached during the build.
  await copyInto(
    path.join(projectDir, '.next', 'cache'),
    path.join(standaloneDir, '.next', 'cache'),
    {
      optional: true,
    },
  )

  console.log('Standalone bundle ready at .next/standalone')
}

await main()
