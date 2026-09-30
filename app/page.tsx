import { getRepos } from '@/features/projects/lib/github'
import { LandingPage } from '@/features/landing-page'
import { JsonLd, webSite } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himawan',
    url: WEBSITE_URL,
    // Without an `image` a Person entity has nothing for a knowledge panel to
    // show, and the site already has a public avatar to point at.
    image: `${WEBSITE_URL}/memoji-1.png`,
    jobTitle: 'Frontend Engineer',
    email: 'adityahimaone@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jakarta',
      addressCountry: 'ID',
    },
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
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Universitas AMIKOM Yogyakarta' },
      { '@type': 'EducationalOrganization', name: 'Binar Academy' },
      { '@type': 'EducationalOrganization', name: 'Alterra Academy' },
      { '@type': 'EducationalOrganization', name: 'Bangkit Academy' },
    ],
    sameAs: [
      'https://github.com/adityahimaone',
      'https://linkedin.com/in/adityahimaone',
      'https://x.com/adityahimaone',
    ],
  }

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
      <LandingPage archiveRepos={repos} />
    </>
  )
}
