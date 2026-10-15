import { LandingGate } from '../components/landing-gate'
import Rack01LandingPage from '../rack-01/rack-01'
import type { ArchiveRepo } from '@/features/projects/lib/github'

/**
 * The page is a server component and the rack is a client component, so the
 * repository rows cross that boundary as plain serialisable data. They cannot
 * be fetched lower down: an async server component cannot be rendered inside
 * this client tree.
 *
 * The rows are `ArchiveRepo`, not `GitHubRepo` — the page narrows them before
 * passing, so only the fields the archive reads cross the boundary.
 *
 * `LandingGate` wraps the rack rather than replacing it. The gate renders the
 * rack first and the boot overlay after it, so the landing page is already in
 * the DOM and already measured when the blinds leave — no layout shift, and no
 * second layout pass for the camera to be re-measured through.
 */
export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  return (
    <LandingGate>
      <Rack01LandingPage archiveRepos={archiveRepos} />
    </LandingGate>
  )
}
