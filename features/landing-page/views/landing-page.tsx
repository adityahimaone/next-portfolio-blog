import Rack01LandingPage from '../rack-01/rack-01'
import type { GitHubRepo } from '@/features/projects/lib/github'

/**
 * The page is a server component and the rack is a client component, so the
 * repository rows cross that boundary as plain serialisable data. They cannot
 * be fetched lower down: an async server component cannot be rendered inside
 * this client tree.
 */
export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: GitHubRepo[]
}) {
  return <Rack01LandingPage archiveRepos={archiveRepos} />
}
