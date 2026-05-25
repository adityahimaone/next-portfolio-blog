import type { Metadata } from 'next'
import { Fraunces, Inter_Tight } from 'next/font/google'
import { LandingPageV2 } from '@/features/landing-page-v2'
import { EMAIL, SOCIAL_LINKS_LANDING } from '@/features/landing-page-v2/constants'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aditya Himaone — Portfolio 2026 (Side A)',
  description:
    'Frontend developer based in Bandung. Editorial portfolio v2 — liner notes for a working catalog of interfaces.',
  alternates: {
    canonical: '/v2',
  },
  openGraph: {
    title: 'Aditya Himaone — Portfolio 2026 (Side A)',
    description:
      'Editorial portfolio v2 — liner notes for a working catalog of interfaces.',
    type: 'website',
    url: 'https://adityahimaone.space/v2',
  },
}

export default function V2Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himaone',
    url: 'https://adityahimaone.space/v2',
    jobTitle: 'Frontend Developer',
    email: `mailto:${EMAIL}`,
    sameAs: SOCIAL_LINKS_LANDING.map((s) => s.link),
  }

  return (
    <div className={`${fraunces.variable} ${interTight.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageV2 />
    </div>
  )
}
