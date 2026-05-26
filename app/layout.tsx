import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, Lora, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AudioProvider } from '@/features/landing-page/spotify/audio-context'
import { MusicPlayer } from '@/features/landing-page/spotify/music-player'
import { Analytics } from '@vercel/analytics/next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090912',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://adityahimaone.space'),
  title: 'adityahimaone — frontend developer',
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

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} ${jetbrainsMono.variable} ${lora.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}
        style={
          {
            '--font-bricolage-grotesque': 'var(--font-bricolage)',
            '--font-jetbrains-mono': 'var(--font-jetbrains-mono)',
            '--font-lora': 'var(--font-lora)',
          } as React.CSSProperties
        }
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
            </div>
          </AudioProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
