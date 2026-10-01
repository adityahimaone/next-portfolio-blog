import type { Metadata, Viewport } from 'next'
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  JetBrains_Mono,
  Syne,
  Orbitron,
  Inter,
  Cormorant_Garamond,
} from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AudioProvider } from '@/features/landing-page/spotify/audio-context'
import { MusicPlayer } from '@/features/landing-page/spotify/music-player'
import { MagneticDock } from '@/features/layout/components/magnetic-dock'
import Script from 'next/script'
import {
  WEBSITE_URL,
  GA_MEASUREMENT_ID,
  GSC_VERIFICATION,
} from '@/lib/constants'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e7e6dd' },
    { media: '(prefers-color-scheme: dark)', color: '#16191b' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_URL),
  title: {
    default: 'Aditya Himawan — Frontend Engineer',
    template: '%s | Aditya Himawan',
  },
  description:
    'Frontend Engineer with 4+ years building production web apps with React, Next.js, and TypeScript — leading platforms serving 15K+ users. Music-themed interactive portfolio.',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/memoji-1.png',
        href: '/memoji-1.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/memoji-1.png',
        href: '/memoji-1.png',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  // Search Console cannot verify site ownership without this, and every
  // "cannot verify" verdict in docs/seo-audit.md traces back to it being unset.
  ...(GSC_VERIFICATION
    ? {
        verification: { google: GSC_VERIFICATION },
      }
    : {}),
  openGraph: {
    title: 'Aditya Himawan — Frontend Engineer',
    type: 'website',
    images: ['/opengraph-image'],
    description:
      'Frontend Engineer with 4+ years building production web apps with React, Next.js, and TypeScript — leading platforms serving 15K+ users.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'Aditya Himawan — Frontend Engineer',
    description:
      'Frontend Engineer with 4+ years building production web apps with React, Next.js, and TypeScript.',
    images: ['/opengraph-image'],
  },
}

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  display: 'swap',
})

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/**
 * `data-scroll-behavior="smooth"` on <html> opts back into overriding
 * `scroll-behavior` during route changes. globals.css sets
 * `scroll-behavior: smooth` on html, and as of Next 16 the framework no
 * longer suppresses it for navigations by default — which would animate every
 * page transition into a jump-to-top scroll. This attribute restores the
 * previous behaviour: instant navigation, smooth scrolling within a page.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${syne.variable} ${orbitron.variable} ${inter.variable} ${cormorantGaramond.variable} bg-background text-foreground tracking-tight antialiased`}
      >
        <ThemeProvider
          enableSystem={false}
          attribute="class"
          storageKey="theme"
          defaultTheme="light"
          themes={['light', 'dark']}
        >
          <AudioProvider>
            <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-geist)]">
              <div className="relative flex-1">{children}</div>
              <MusicPlayer />
              <MagneticDock />
            </div>
          </AudioProvider>
        </ThemeProvider>
        {/* @vercel/analytics was removed here.

            It shipped a `<script src="/_vercel/insights/script.js">`, which is
            a same-origin path that only resolves behind a Vercel proxy. This
            site runs `next start` under PM2 behind its own Nginx (see
            deploy.sh / ecosystem.config.js), and the path returns 404 in
            production — verified with curl against the live domain. So it was
            a failed request on every pageview, and no data was ever collected.

            GA4 below is the replacement. It is an absolute third-party URL, so
            it resolves the same way on a VPS as it would on Vercel. */}
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}')`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
