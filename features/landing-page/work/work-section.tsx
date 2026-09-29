import { getRepos } from '@/features/projects/lib/github'
import { Work } from './work'

/**
 * Server boundary for the work section.
 *
 * `Work` is a client component — it owns the scroll sequence and the transport
 * — so it cannot call `getRepos` itself without shipping the GitHub fetch into
 * the client bundle. This wrapper does the fetch on the server (Next caches it
 * for an hour via the `revalidate` in getRepos) and hands the rows down as
 * plain data, which is the same shape /projects uses for its session log.
 *
 * The fetch never blocks the page: on failure it passes an empty list and the
 * sidebar falls back to a single line pointing at /projects, rather than
 * showing an error where a project list should be.
 */
export async function WorkSection() {
  const { repos } = await getRepos()
  return <Work archiveRepos={repos} />
}
