import type { Metadata } from 'next'

import { Sunnyside } from '@/features/design-system/sunnyside'

export const metadata: Metadata = {
  title: 'Sunnyside — Design System',
  description:
    'Sunnyside is the design system behind Side A: paper, cobalt, a felt-tip marker and a drawer of stickers. Colour, type, parts, motion and tokens.',
  alternates: {
    canonical: '/sunnyside',
  },
  openGraph: {
    title: 'Sunnyside — Design System',
    description:
      'The design system behind Side A. One warm paper, one cobalt room, three type voices and a number of very good stickers.',
    type: 'website',
    url: '/sunnyside',
  },
}

export default function SunnysidePage() {
  return <Sunnyside />
}
