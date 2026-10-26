import type { Metadata } from 'next'
import { getRepos, toArchiveRepos } from '@/features/projects/lib/github'
import { LandingPage } from '@/features/landing-page'
import { JsonLd, person, webSite } from '@/lib/structured-data'

/**
 * The previous landing movement, kept reachable at /classic.
 *
 * Side Two replaced the homepage, not the work behind it: the rack, the
 * turntable chapters and the archive are all still here and still worth being
 * able to open. This route is also the fastest way to compare the two
 * directions without a deploy.
 */
export const metadata: Metadata = {
  title: 'Side One — The rack',
  description:
    'The previous studio-rack portfolio: chapters, instruments and the archive, preserved as Side One.',
  alternates: { canonical: '/classic' },
  // A preserved copy of the previous homepage. Kept reachable, but it should
  // never compete with Side Two for an index slot.
  robots: { index: false, follow: true },
}

export default async function ClassicHome() {
  const jsonLd = person({
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Zustand',
      'React Query',
      'Node.js',
      'Golang',
      'Docker',
      'PostgreSQL',
      'MySQL',
    ],
    sameAs: [
      'https://github.com/adityahimaone',
      'https://linkedin.com/in/adityahimaone',
      'https://x.com/adityahimaone',
    ],
    alumniOf: [
      'Universitas AMIKOM Yogyakarta',
      'Binar Academy',
      'Alterra Academy',
      'Bangkit Academy',
    ],
  })

  const { repos } = await getRepos()

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={webSite()} />
      <LandingPage archiveRepos={toArchiveRepos(repos)} />
    </>
  )
}
