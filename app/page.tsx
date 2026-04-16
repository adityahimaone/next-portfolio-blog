import { LandingPage } from '@/features/landing-page'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himaone',
    url: 'https://adityahimaone.space',
    jobTitle: 'Frontend Developer',
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
