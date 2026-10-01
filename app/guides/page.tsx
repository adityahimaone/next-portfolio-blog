import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbList, itemList } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Step-by-step guides built from the self-hosting, deployment and monitoring write-ups on this site.',
  alternates: { canonical: '/guides' },
}

const GUIDES = [
  {
    href: '/guides/self-hosting-nextjs',
    title: 'Self-Hosting a Next.js App on a VPS',
    description:
      'The complete path from an empty server to a monitored production app: Nginx, PM2, SSL, and the deployment pipeline.',
    steps: 4,
  },
]

export default function GuidesIndex() {
  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
  ])

  const jsonLd = itemList({
    name: 'Guides',
    description: 'Step-by-step guides built from the notes on this site.',
    items: GUIDES.map((guide) => ({
      name: guide.title,
      url: guide.href,
      description: guide.description,
    })),
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="mb-12">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            Guides
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Guides
          </h1>
          <p className="text-muted-foreground text-lg">
            Longer paths through material the notes cover in pieces. Each one
            assembles several posts into a single order of operations.
          </p>
        </header>

        <ul className="space-y-8">
          {GUIDES.map((guide) => (
            <li
              key={guide.href}
              className="border-border border-b pb-8 last:border-b-0"
            >
              <h2 className="mb-2 text-xl font-medium tracking-tight">
                <Link href={guide.href} className="hover:underline">
                  {guide.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-2">{guide.description}</p>
              <p className="text-muted-foreground text-sm">
                {guide.steps} steps ·{' '}
                <Link href="/blog" className="hover:underline">
                  all notes
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
