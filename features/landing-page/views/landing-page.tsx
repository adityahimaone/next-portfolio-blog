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
 */
export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  return <Rack01LandingPage archiveRepos={archiveRepos} />
}
