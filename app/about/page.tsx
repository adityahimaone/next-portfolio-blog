import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbList, person } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Aditya Himawan is a frontend engineer in Jakarta building React, Next.js and TypeScript products — including platforms used by 15K+ people.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Aditya Himawan',
    description:
      'Frontend engineer in Jakarta. React, Next.js and TypeScript, and the infrastructure underneath.',
    url: `${WEBSITE_URL}/about`,
    type: 'profile',
  },
}

const STACK = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Zustand',
  'React Query',
  'Node.js',
  'Golang',
  'Docker',
  'PostgreSQL',
  'MySQL',
  'Prometheus',
  'Grafana',
  'Nginx',
]

/**
 * The six real engagements behind the work, with the outcome each one is
 * actually known for. These are the same rows the landing page's archive
 * credits come from (`ARTIST_ROWS` in `library-data.ts`) — the point of a
 * portfolio is that someone did the work, and an about page with no employers
 * in it is an assertion rather than evidence.
 */
const CLIENTS = [
  { name: 'Bisadaya', role: 'Job platform', note: '15K+ users' },
  { name: '80&Company', role: 'HR management', note: 'Kyoto' },
  { name: 'Primarindo Asia', role: 'Manufacturing', note: 'Jakarta' },
  { name: 'Niqcode', role: 'Product studio', note: 'Partner' },
  { name: 'Unzyp Solusi', role: 'E-commerce', note: 'Jakarta' },
  { name: 'Campus Connect', role: 'Launched in three months', note: '' },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/adityahimaone' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adityahimaone' },
  { label: 'X', href: 'https://x.com/adityahimaone' },
  { label: 'Email', href: 'mailto:adityahimaone@gmail.com' },
]

/**
 * `/about` — the on-page biography.
 *
 * The site had strong `Person` JSON-LD (job title, email, location, `knowsAbout`,
 * `alumniOf`, `sameAs`) and six real client credits, but no page a reader could
 * land on to read any of it. A knowledge panel describes you to a machine; an
 * about page describes you to a person deciding whether to email you.
 *
 * Deliberately plain typography rather than the rack language. The landing page
 * is an immersive audio-hardware metaphor, which is a poor container for a
 * factual bio, and the existing booth shell would frame a page of prose as
 * another album sleeve.
 */
export default function AboutPage() {
  const personSchema = person({
    description:
      'Frontend engineer in Jakarta building production React, Next.js and TypeScript products, and the infrastructure underneath them.',
    knowsAbout: STACK,
    sameAs: [
      'https://github.com/adityahimaone',
      'https://linkedin.com/in/adityahimaone',
      'https://x.com/adityahimaone',
    ],
    alumniOf: [
      'Universitas AMIKOM Yogyakarta',
      'Binar Academy',
      'Alterra Academy',
      'Bangkit Academy',
    ],
  })

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ])

  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="mb-14">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            About
          </p>
          <h1 className="mb-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Aditya Himawan
          </h1>
          <p className="text-xl">
            Frontend engineer in Jakarta. I build production web applications in
            React, Next.js and TypeScript — and the infrastructure underneath
            them when there is a reason to own that too.
          </p>
        </header>

        <section className="mb-14">
          <p className="mb-4">
            I have spent four years building interfaces that have to keep
            working: platforms used by tens of thousands of people, products
            where the hard part is not the styling but the state behind it. Most
            of my work has been the second kind — dashboards, operational tools,
            and the awkward flows that nobody wants to own.
          </p>
          <p className="mb-4">
            Lately that has meant running the infrastructure as well. This site
            is deployed on a VPS behind Nginx, monitored with Prometheus and
            Grafana, and I write about the parts that surprised me — which is
            most of them, and why the{' '}
            <Link
              href="/guides/self-hosting-nextjs"
              className="text-primary hover:underline"
            >
              self-hosting guide
            </Link>{' '}
            exists at all.
          </p>
          <p>
            I care about the parts of a product nobody demos: the loading state
            that tells the truth, the empty state that explains itself, the
            thing that still works when the API does not. That is usually where
            the real work is.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Who I have worked with
          </h2>
          <ul className="space-y-4">
            {CLIENTS.map((client) => (
              <li
                key={client.name}
                className="border-border flex items-baseline justify-between gap-4 border-b pb-4 last:border-b-0"
              >
                <span>
                  <span className="font-medium">{client.name}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    · {client.role}
                  </span>
                </span>
                {client.note ? (
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {client.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            What I work with
          </h2>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((tech) => (
              <li
                key={tech}
                className="border-border bg-muted rounded-full border px-3 py-1 text-sm"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Get in touch
          </h2>
          <p className="mb-5">
            Frontend work, design engineering, and the occasional hard interface
            problem. Replies within a couple of days.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  {...(link.href.startsWith('mailto:')
                    ? {}
                    : { target: '_blank', rel: 'noopener noreferrer' })}
                  className="text-primary underline underline-offset-4"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Résumé (PDF) ↗
            </Link>
          </p>
        </section>

        <p className="border-border text-muted-foreground border-t pt-6">
          Looking for the code instead?{' '}
          <Link href="/projects" className="hover:underline">
            Shipped work
          </Link>{' '}
          and{' '}
          <Link href="/blog" className="hover:underline">
            notes
          </Link>
          .
        </p>
      </main>
    </>
  )
}
