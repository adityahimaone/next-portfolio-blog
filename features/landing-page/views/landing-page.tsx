import { LandingGate } from '../components/landing-gate'
import { Studio } from '../studio'
import type { ArchiveRepo } from '@/features/projects/lib/github'

/**
 * The landing page is the "track timeline" studio. `LandingGate` still wraps
 * it: the boot overlay is driven by a `<head>` script in `app/layout.tsx`, so
 * the gate has to stay mounted for that cover to be released.
 *
 * `archiveRepos` is still accepted so `app/page.tsx` and its server-side fetch
 * are untouched; the studio does not read it.
 */
export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  void archiveRepos
  return (
    <LandingGate>
      <Studio />
    </LandingGate>
  )
}
