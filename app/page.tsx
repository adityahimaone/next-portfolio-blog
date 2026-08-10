import { LandingPage } from '@/features/landing-page'

export default function Home() {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  )
}
