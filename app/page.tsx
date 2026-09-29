import { getRepos } from '@/features/projects/lib/github'
import { LandingPage } from '@/features/landing-page'

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himawan',
    url: 'https://adityahimaone.space',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage archiveRepos={repos} />
    </>
  )
}
