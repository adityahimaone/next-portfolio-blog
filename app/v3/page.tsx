import type { Metadata } from 'next'
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Instrument_Serif,
  Inter_Tight,
} from 'next/font/google'
import { LandingPageV3 } from '@/features/landing-page-v3'
import {
  EMAIL,
  SOCIAL_LINKS_LANDING,
} from '@/features/landing-page-v3/constants'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['wdth'],
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aditya Himaone — Portfolio 2026 (V3 / Spatial Edition)',
  description:
    'Frontend developer based in Bandung. Portfolio v3 — a spatial, motion-first edition. Building interfaces with depth, rhythm, and a sense of physical space.',
  alternates: {
    canonical: '/v3',
  },
  openGraph: {
    title: 'Aditya Himaone — V3 / Spatial Edition',
    description:
      'A spatial, motion-first portfolio edition. Building interfaces with depth, rhythm, and a sense of physical space.',
    type: 'website',
    url: 'https://adityahimaone.space/v3',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aditya Himaone — V3 / Spatial Edition',
    description:
      'A spatial, motion-first portfolio edition. Building interfaces with depth, rhythm, and a sense of physical space.',
  },
}

export default function V3Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himaone',
    url: 'https://adityahimaone.space/v3',
    jobTitle: 'Frontend Developer',
    email: `mailto:${EMAIL}`,
    sameAs: SOCIAL_LINKS_LANDING.map((s) => s.link),
  }

  return (
    <div
      className={`${bricolage.variable} ${interTight.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageV3 />
    </div>
  )
}
