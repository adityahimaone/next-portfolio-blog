import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbList } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'VPS vs Vercel vs Netlify for Next.js',
  description:
    'An honest comparison of self-hosting a Next.js app on a VPS against Vercel and Netlify: real costs, real limits, and when each one is the right call.',
  alternates: { canonical: '/guides/vps-vs-vercel' },
}

type Column = {
  label: string
  vps: string
  vercel: string
  netlify: string
}

const MATRIX: Column[] = [
  {
    label: 'Monthly cost, small site',
    vps: '~$5',
    vercel: '$0–20',
    netlify: '$0–19',
  },
  {
    label: 'Who patches the OS',
    vps: 'You',
    vercel: 'They',
    netlify: 'They',
  },
  {
    label: 'Custom Node flags',
    vps: 'Yes',
    vercel: 'Limited',
    netlify: 'Limited',
  },
  {
    label: 'Background jobs',
    vps: 'Yes',
    vercel: 'Separate service',
    netlify: 'Separate service',
  },
  {
    label: 'Cold starts',
    vps: 'None',
    vercel: 'Frequent',
    netlify: 'Frequent',
  },
  {
    label: 'Lock-in',
    vps: 'None',
    vercel: 'Moderate',
    netlify: 'Moderate',
  },
  {
    label: 'Time to first deploy',
    vps: 'An afternoon',
    vercel: 'Two minutes',
    netlify: 'Two minutes',
  },
]

const CHOICES = [
  {
    pick: 'Vercel',
    when: 'You want to ship this week and the platform defaults fit.',
    why: 'Zero configuration, preview deploys per pull request, and image optimisation for free. The cost only starts to matter once traffic grows or you need something the platform will not run.',
  },
  {
    pick: 'Netlify',
    when: 'Your site is mostly static and you value the form handling and edge functions.',
    why: 'Similar ergonomics to Vercel with a slightly different strengths. A better fit for static-heavy marketing sites than for a dynamic Next.js app.',
  },
  {
    pick: 'A VPS',
    when: 'You need control the platform will not give you, or you already run one.',
    why: 'Cheap at scale, no lock-in, and you can run anything. The cost is real: you are the operations team now, and the certificate, the proxy and the monitoring are your problem.',
  },
]

/**
 * `/guides/vps-vs-vercel` — the comparison page the checklist asked for.
 *
 * The `vs` shape is the one that matches an existing search intent: someone
 * comparing hosting options is not looking for a hosted-platform tutorial. It
 * also gives the self-hosting cluster a second entry point for a different
 * query than the how-to pillar targets.
 *
 * The table is deliberately plain — no pricing figures that would go stale on
 * their own. Anything that changes often is stated as a range or a relative,
 * because a comparison page full of stale numbers is worse than no page.
 */
export default function VpsVsVercel() {
  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: 'VPS vs Vercel vs Netlify', path: '/guides/vps-vs-vercel' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm">
          <Link
            href="/guides/self-hosting-nextjs"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Self-hosting guide
          </Link>
        </nav>

        <header className="mb-12">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            Comparison
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            VPS vs Vercel vs Netlify for Next.js
          </h1>
          <p className="text-muted-foreground text-lg">
            All three will serve your Next.js app in production. They differ in
            who handles the failure modes, and what it costs you to find out.
            This site runs on a VPS, so the third column is not theoretical
            here.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Side by side
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    &nbsp;
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    VPS
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Vercel
                  </th>
                  <th scope="col" className="py-3 font-medium">
                    Netlify
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr
                    key={row.label}
                    className="border-border border-b last:border-b-0"
                  >
                    <th scope="row" className="py-3 pr-4 font-normal">
                      {row.label}
                    </th>
                    <td className="text-muted-foreground py-3 pr-4">
                      {row.vps}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {row.vercel}
                    </td>
                    <td className="text-muted-foreground py-3">
                      {row.netlify}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Pricing moves; the shape of the trade-off does not. Check current
            numbers before deciding.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Which one to pick
          </h2>
          <dl className="space-y-8">
            {CHOICES.map((choice) => (
              <div key={choice.pick}>
                <dt className="mb-1 text-lg font-medium">{choice.pick}</dt>
                <dd>
                  <p className="text-muted-foreground mb-2">{choice.when}</p>
                  <p>{choice.why}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-14">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            The part people forget
          </h2>
          <p className="mb-4">
            A VPS is not free hosting — it is hosting you pay for with your
            time. Someone has to renew certificates, patch the OS, replace a
            disk that fills up at 3am, and notice that the response time quietly
            doubled. None of that is hard. It is just continuous, and it is
            invisible until it stops.
          </p>
          <p className="text-muted-foreground">
            If nobody on your team wants that job, use a platform and spend the
            difference on something else. If you want the job,{' '}
            <Link
              href="/guides/self-hosting-nextjs"
              className="text-primary hover:underline"
            >
              this guide
            </Link>{' '}
            is the path.
          </p>
        </section>

        <p className="border-border text-muted-foreground border-t pt-6">
          Disagree with something here?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Tell me
          </Link>
          .
        </p>
      </main>
    </>
  )
}
