import type { Metadata } from 'next'
import Link from 'next/link'
import { WORK_PROJECTS } from '@/data/projects'
import { JsonLd, breadcrumbList, faqPage } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'What I Build',
  description:
    'The kinds of frontend problems I have actually shipped: internal tools that replace browser tabs, public sites that a sales team stops hand-maintaining, and products that survive a flaky connection.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'What I Build — Aditya Himawan',
    description:
      'Internal tools, marketing sites that hold up, and local-first products. Grounded in shipped work, not a services list.',
    url: `${WEBSITE_URL}/work`,
    type: 'website',
  },
}

/**
 * `/work` — the use-case page.
 *
 * `/projects` answers "what did you build". It does not answer the question
 * someone actually arrives with, which is "can you build the thing I need?".
 * A visitor who wants an operations dashboard should not have to read six
 * project entries to find out whether that is a thing I have done.
 *
 * Every case below is grouped from `WORK_PROJECTS` rather than invented, and
 * each links to the project that proves it. That is the whole constraint: a use
 * case with no shipped example behind it is a services page, and a services
 * page is a claim rather than evidence.
 */
type CaseStudy = {
  slug: string
  title: string
  problem: string
  approach: string[]
  projects: string[]
}

const CASES: CaseStudy[] = [
  {
    slug: 'internal-tools',
    title: 'Internal tools that replace a browser tab',
    problem:
      'The team is running the business out of three tabs and a spreadsheet. Someone is always the only person who knows how the process works, and nobody can tell which of those steps happened.',
    approach: [
      'Put the state where the work happens, not in a chat thread — one board, one queue, no handoff between systems.',
      'Make every automated action leave a trace a human can read later, so "the agent did it" is never the answer to a question.',
      'Keep the surface dense and keyboard-reachable. These tools are used for hours, not visited for a minute.',
    ],
    projects: ['switchyard'],
  },
  {
    slug: 'marketing-sites',
    title: 'Public sites a sales team stops hand-maintaining',
    problem:
      'Marketing owns the content, engineering owns the templates, and the result is duplicate pages that nobody will delete because deleting a page feels risky.',
    approach: [
      'One source of truth for the content model, so the catalogue cannot drift into two versions of the same page.',
      'Plain, fast, indexable — with the facts above the pitch, because that is what gets forwarded internally.',
      'A CMS the people who own the content can actually operate without filing a ticket.',
    ],
    projects: ['primarindo-asia'],
  },
  {
    slug: 'local-first-products',
    title: 'Products that survive a bad connection',
    problem:
      'The app is fine on office wifi and useless anywhere else. Every action depends on a round trip, and the product quietly becomes unavailable exactly when it is needed.',
    approach: [
      'Store on-device first and treat the network as an enhancement, not a precondition.',
      'Design the failure states properly — an offline user needs to know what is still true, not a spinner.',
      'Keep the daily interaction to a single tap. A tool used every morning has a very low bar for friction.',
    ],
    projects: ['habit-tracker'],
  },
  {
    slug: 'wallets-and-on-chain',
    title: 'Wallet-connected interfaces that still read on a phone',
    problem:
      'A Web3 product that assumes a desktop, a connected wallet, and an impatient user. Most of the audience is on a phone, in a queue, with a wallet extension that has not loaded yet.',
    approach: [
      'Treat the unreadable and not-yet-connected states as the first-class designs, not an error screen.',
      'Make verification legible rather than ceremonial — the user needs to know what was checked and what it proves.',
      'Assume the connection will fail and the tab will be backgrounded mid-transaction.',
    ],
    projects: ['seaphantom', 'seaphantom-p2p'],
  },
]

const FAQ = [
  {
    question: 'What kind of projects do you take on?',
    answer:
      'Frontend work where the hard part is the state or the edge cases rather than the styling: internal tools, content-heavy public sites, and products that need to work on a phone or on a bad connection. The shipped work is listed on the projects page.',
  },
  {
    question: 'Do you work with existing backends or build the whole thing?',
    answer:
      'Mostly the former. Most of the projects on this site are frontends over an existing service — Switchyard is a Go control plane, Primarindo Asia is a Next.js frontend over a CMS. Running the infrastructure as well is something I do when the product genuinely needs it.',
  },
  {
    question: 'Can you work with a design, or do you do the design too?',
    answer:
      'Both. Several projects here list the role as "Design and build", meaning the interface was designed alongside the implementation. Where a brand already exists, I work to it.',
  },
  {
    question: 'Do you do React Native or mobile apps?',
    answer:
      'The mobile work here is responsive web rather than native. The one habit that transfers is treating a phone as the primary case rather than the afterthought — several of these projects were built phone-first for exactly that reason.',
  },
  {
    question: 'What is your availability?',
    answer:
      'The contact page is the fastest way to reach me. Frontend work, design engineering, and hard interface problems — replies usually land within a couple of days.',
  },
]

export default function WorkPage() {
  const bySlug = new Map(WORK_PROJECTS.map((p) => [p.slug, p]))

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'What I build', path: '/work' },
  ])

  return (
    <>
      <JsonLd data={faqPage(FAQ)} />
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="mb-14">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            What I build
          </p>
          <h1 className="mb-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            The problems I have actually solved
          </h1>
          <p className="text-muted-foreground text-lg">
            Grouped by the shape of the problem rather than by job title. Each
            one links to the shipped work behind it, so nothing here is a claim
            without a link attached.
          </p>
        </header>

        {CASES.map((item) => (
          <section
            key={item.slug}
            id={item.slug}
            className="border-border mb-14 border-b pb-14 last:border-b-0"
          >
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              {item.title}
            </h2>

            <p className="mb-5">
              <span className="text-muted-foreground mr-2 font-mono text-xs tracking-[0.14em] uppercase">
                The problem
              </span>
              {item.problem}
            </p>

            <p className="text-muted-foreground mb-2 font-mono text-xs tracking-[0.14em] uppercase">
              How I approach it
            </p>
            <ul className="mb-6 space-y-2">
              {item.approach.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm">
              <span className="text-muted-foreground mr-2 font-mono text-xs tracking-[0.14em] uppercase">
                Proof
              </span>
              {item.projects.map((slug, index) => {
                const project = bySlug.get(slug)
                if (!project) return null
                return (
                  <span key={slug}>
                    {index > 0 && ' · '}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-primary hover:underline"
                    >
                      {project.title}
                    </Link>
                  </span>
                )
              })}
            </p>
          </section>
        ))}

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Common questions
          </h2>
          <dl className="space-y-8">
            {FAQ.map((entry) => (
              <div key={entry.question}>
                <dt className="mb-2 text-lg font-medium">{entry.question}</dt>
                <dd className="text-muted-foreground">{entry.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="border-border text-muted-foreground border-t pt-6">
          Have something that does not fit a category above?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Tell me about it
          </Link>{' '}
          — the{' '}
          <Link href="/about" className="hover:underline">
            about page
          </Link>{' '}
          has the longer version, and{' '}
          <Link href="/projects" className="hover:underline">
            all six projects
          </Link>{' '}
          are one click away.
        </p>
      </main>
    </>
  )
}
