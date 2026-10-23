import type { Metadata, Viewport } from 'next'
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Syne,
  Orbitron,
  Inter,
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

/* `preload: false` on everything except Geist. Each font family emits a
   `<link rel="preload">`, and they were all competing for the same head
   bandwidth as the first contentful paint: eight families meant eight preloads
   queued ahead of the CSS and the hero, which is most of the 430ms render
   block PageSpeed reported. Only Geist is preload-worthy — it is the body face
   and paints every glyph on the page. The rest are section-level faces
   (Orbitron reads a frequency readout, Space Grotesk a heading) that `swap`
   into place a beat later without anyone noticing a swap on a label. */
const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

/* JetBrains Mono and Cormorant Garamond were removed. They were reachable only
   through the `--font-whyte-inktrap-mono` and `--font-grandslang` aliases,
   which no rule in the app reads, and Cormorant was additionally asking for
   five weights in both normal and italic — ten font files, downloaded and
   preloaded on every page load, for a family nothing rendered. If either face
   is ever wanted, re-add it here and give it a real consumer in the same
   change. */

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
      <head>
        {/* Retire the dock before the landing page hydrates.

            The hero retires the dock until About owns the frame, but it does
            that from an effect — and an effect runs after the first paint. By
            then the dock has already begun its 450ms rise, so the visitor
            watches it arrive and immediately leave. Measured: it reached 89%
            opacity at 862ms, then unmounted.

            Writing the flag here, before React renders anything, makes the
            retired state the dock's *first* state instead of its second, so
            there is no arrival to watch.

            Deliberately narrow. It is the landing route, at the top of it, and
            not when the URL already points at About — and a body that throws
            leaves the flag alone rather than guessing. It does not run with
            scripting disabled at all, which is the point: a no-JS visitor
            keeps the dock they have today, exactly as the `scripting: none`
            rules elsewhere in this app already promise.

            The hero's hook still owns the flag from here on and restores it on
            the way out, so navigating away from the landing page brings the
            dock back.

            No `return`: this is a classic script, not a function body, and a
            top-level `return` is a SyntaxError that kills the whole block. It
            used to be written that way, which is why the dock kept arriving on
            the page it was supposed to be hidden from. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'&&location.hash!=='#about')document.documentElement.dataset.interface='hidden'}catch(e){}`,
          }}
        />
        {/* Put the boot's first frame up before the first paint.

            The landing page's preloader is a client component, so the server
            can only ship the hero: the overlay appears after hydration, which
            means the visitor sees the hero, then sees a boot land on top of it
            that was supposed to have been there all along. The gap is one frame
            on a fast machine and most of a second on a phone.

            Two things are written here, before the body is parsed:

            - `data-boot="on"`, which shows the boot cover (`StormCover`, in the
              landing page's HTML, hidden by default). The cover is the
              preloader's own first frame — the storm's rows start at opacity 0,
              so the first frame is the bare ground — which is why handing over
              to the real overlay a moment later is invisible.
            - `--boot-play: paused`, the variable the hero's letters read. They
              are held from their very first frame instead of being frozen
              mid-rise when the overlay's effect finally runs, so the release at
              1300ms is deterministic. Not written under reduced motion: there
              the letters do not animate at all, and the overlay's own restore
              skips them in that mode, so nothing would ever release them.

            The 8s failsafe is the price of painting something before knowing
            whether the app will ever hydrate. If the storm never mounts, the
            cover comes down and the letters run on their own, so the worst case
            is a slow page rather than a dark page with no title on it. With no
            JavaScript at all this block never runs, no attribute is written,
            the cover stays hidden and the page is exactly the page.

            The attribute goes on last. Everything above it can only fail by
            throwing, and if it does, no cover is shown — rather than a cover
            that is shown with no failsafe behind it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'&&sessionStorage.getItem('aditya-landing-session-boot')!=='1'){var d=document.documentElement,m=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!m)d.style.setProperty('--boot-play','paused');setTimeout(function(){if(d.getAttribute('data-boot')==='on'){d.removeAttribute('data-boot');d.style.removeProperty('--boot-play')}},8000);d.setAttribute('data-boot','on')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${syne.variable} ${orbitron.variable} ${inter.variable} bg-background text-foreground tracking-tight antialiased`}
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
