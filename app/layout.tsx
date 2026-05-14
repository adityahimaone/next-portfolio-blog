import type { Metadata, Viewport } from 'next'
import { VT323, Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AudioProvider } from '@/features/landing-page/spotify/audio-context'
import { MusicPlayer } from '@/features/landing-page/spotify/music-player'
import { Analytics } from '@vercel/analytics/next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://adityahimaone.space'),
  title: 'adityahimaone - frontend developer',
  description:
    'I am a frontend developer who loves to craft beautiful and performant websites.',
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
  openGraph: {
    title: 'adityahimaone — frontend developer',
    type: 'website',
    images:
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
    url: 'https://adityahimaone.space/',
    description: "adit's personal website",
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'adit — frontend developer',
    description: "adit's personal website",
    images:
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
  },
}

/* ─── RETRO CONSOLE FONTS ─── */
const display = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const heading = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-black-true text-white-bone tracking-tight antialiased">
        <ThemeProvider
          enableSystem={false}
          attribute="data-theme"
          storageKey="theme"
          defaultTheme="dark"
          themes={['light', 'dark']}
        >
          <AudioProvider>
            <div className="flex min-h-screen w-full flex-col">
              <div className="relative flex-1">{children}</div>
              <MusicPlayer />
            </div>
          </AudioProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}