import StudioLandingPage from '../studio-01/studio-landing'
import type { ArchiveRepo } from '@/features/projects/lib/github'

/**
 * The landing page's composition boundary.
 *
 * The page is a server component and the landing page is a client tree, so the
 * repository rows cross that boundary as plain serialisable `ArchiveRepo`
 * values. They are narrowed by `app/page.tsx` before they arrive, which keeps
 * the RSC payload small and means the client is not handed fields it never
 * renders.
 *
 * The previous rack shipped behind a session preloader. This page does not:
 * the hero's first frame is the page, and the 3D ring arrives with hydration
 * rather than sitting behind a cover that has to be dismissed. That is the
 * seamless half of the redesign, and it is why `LandingGate` is absent here.
 */
export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  return <StudioLandingPage archiveRepos={archiveRepos} />
}
