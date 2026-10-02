import { getRepos, toArchiveRepos } from '@/features/projects/lib/github'
import { LandingPage } from '@/features/landing-page'
import { JsonLd, person, webSite } from '@/lib/structured-data'

export default async function Home() {
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

  // Fetched here, in the page's own server component, rather than in a wrapper
  // inside the landing page. The landing page is a client component tree, so an
  // async server component rendered inside it throws at runtime — which fails
  // the whole subtree, leaving no hydrated handlers and no effects, so the page
  // silently stops being clickable and the GSAP timelines never start.
  // getRepos is cached for an hour by its own `next.revalidate`.
  const { repos } = await getRepos()

  return (
    <>
      {/* `JsonLd` escapes `<` before the payload reaches the script tag; the
          inline script this replaced did not. */}
      <JsonLd data={jsonLd} />
      <JsonLd data={webSite()} />
      {/* Narrowed to the five fields the archive reads. Passing the full repo
          objects put ~180KB of unused GitHub fields into the RSC payload that
          ships inline in this HTML, all of which is received and parsed before
          the first paint. */}
      <LandingPage archiveRepos={toArchiveRepos(repos)} />
    </>
  )
}
