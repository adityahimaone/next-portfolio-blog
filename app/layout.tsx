import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { RecordGroove } from '@/components/record-groove'
import { Header } from '@/features/layout/components/header'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://adityahimaone.space'),
  title: 'adityahimaone — frontend developer',
  description:
    'Frontend developer crafting performant, expressive web experiences. A live concert in code.',
  icons: {
    icon: [
      { media: '(prefers-color-scheme: light)', url: '/memoji-1.png', href: '/memoji-1.png' },
      { media: '(prefers-color-scheme: dark)', url: '/memoji-1.png', href: '/memoji-1.png' },
    ],
  },
  openGraph: {
    title: 'adityahimaone — frontend developer',
    type: 'website',
    images:
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
    url: 'https://adityahimaone.space/',
    description: "adit's personal website — the concept album",
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'adit — frontend developer',
    description: "adit's personal website — the concept album",
    images:
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
  },
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable} dark`}
    >
      <body className="bg-base text-text-main grain min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          themes={['dark']}
        >
          <RecordGroove />
          <Header />
          <main className="relative">{children}</main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
