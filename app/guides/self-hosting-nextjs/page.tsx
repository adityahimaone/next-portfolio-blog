import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbList, faqPage } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Self-Hosting a Next.js App on a VPS',
  description:
    'A complete guide to running Next.js in production on your own VPS: Nginx reverse proxy, PM2, SSL, monitoring, and the trade-offs against Vercel.',
  alternates: { canonical: '/guides/self-hosting-nextjs' },
  openGraph: {
    title: 'Self-Hosting a Next.js App on a VPS',
    description:
      'Nginx, PM2, SSL and monitoring — running Next.js in production on a $5/month VPS, and when not to.',
    type: 'article',
  },
}

type Step = {
  slug: string
  title: string
  summary: string
}

const STEPS: Step[] = [
  {
    slug: 'deploy-nextjs-vps-nginx-pm2-custom-domain',
    title: 'Deploying Next.js to a VPS with Nginx',
    summary:
      'The baseline setup: provisioning, Node, the Nginx reverse proxy, PM2 process management, custom domains and SSL. Start here if this is your first time.',
  },
  {
    slug: 'deploying-portfolio-from-zero-to-production',
    title: 'Deploying a Next.js Portfolio to a VPS',
    summary:
      'Takes the baseline further: a staging environment, GitHub Actions on push, health checks, and a rollback path when a deploy goes wrong.',
  },
  {
    slug: 'vps-monitoring-grafana-prometheus-blackbox',
    title: 'VPS Monitoring: Prometheus + Grafana',
    summary:
      'Once it is running, you need to know when it stops. Blackbox Exporter for uptime, Prometheus for metrics, Grafana for the dashboards, Alertmanager for the 3am page.',
  },
  {
    slug: 'tailscale-access-any-device-anywhere',
    title: 'Tailscale: Access Any Device From Anywhere',
    summary:
      'Getting into the server without opening SSH to the world — and reaching your own devices from anywhere, which is how the deploys actually get triggered.',
  },
]

/**
 * `/guides/self-hosting-nextjs` — the pillar page for the cluster the blog
 * already contained but never named.
 *
 * Four posts covered VPS hosting, Nginx, PM2, Prometheus and Tailscale, all
 * with overlapping tags, and nothing on the site tied them together. Each was
 * individually findable and collectively incoherent: a reader arriving on any
 * one of them had no route to the other three.
 *
 * This page is the hub. It carries `FAQPage` structured data, which is the
 * "answer People Also Ask questions" item from the SEO checklist, and it is
 * built entirely from material already published — no new claims are made here
 * that the linked posts do not support.
 */
const FAQ = [
  {
    question: 'How much does it cost to self-host Next.js on a VPS?',
    answer:
      'A $5/month VPS with 1GB RAM and 1 vCPU comfortably serves a typical Next.js app and a few side services. Equivalent traffic on Vercel Pro starts around $20/month, and the gap widens with scale.',
  },
  {
    question: 'Is a VPS cheaper than Vercel?',
    answer:
      'At small scale, roughly comparable. A VPS wins when you need custom middleware, specific Node flags, background jobs, or when you want to avoid vendor lock-in. You trade the platform fee for being the operations team: monitoring, patching and debugging become your job.',
  },
  {
    question: 'Do I still need Nginx in front of Next.js?',
    answer:
      'Yes, for anything public. Node handles the application but not TLS termination, static asset caching, compression, or rate limiting. Nginx does those in front and proxies to Node on a local port.',
  },
  {
    question: 'Should I use PM2 or systemd for a Next.js app?',
    answer:
      'Both work. PM2 gives you cluster mode, zero-downtime reloads and log rotation without much configuration, which is why the guides here use it. systemd is the more native choice and has fewer moving parts if you only run one process.',
  },
  {
    question: 'How do I get an SSL certificate for a VPS?',
    answer:
      "Let's Encrypt, via Certbot. With Nginx the setup is a single certbot command. For a wildcard certificate use the DNS-01 challenge, which works even before DNS has fully propagated and does not require exposing port 80.",
  },
  {
    question: 'How do I monitor a Next.js app on a VPS?',
    answer:
      'Blackbox Exporter checks that the endpoint answers, Prometheus stores the metrics, Grafana visualises them, and Alertmanager notifies you. A cron-based curl against a health endpoint is a reasonable floor if that is more than you need yet.',
  },
  {
    question: 'How do I deploy without downtime?',
    answer:
      'Build ahead of the cutover, then reload rather than restart. `next build` into a separate directory and `pm2 reload` gives you zero-downtime deploys; keeping a known-good release directory and a rollback script covers the case where the new build is broken.',
  },
]

export default function SelfHostingGuide() {
  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    {
      name: 'Self-hosting Next.js on a VPS',
      path: '/guides/self-hosting-nextjs',
    },
  ])

  return (
    <>
      <JsonLd data={faqPage(FAQ)} />
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground"
          >
            ← All notes
          </Link>
        </nav>

        <header className="mb-12">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            Guide · Self-hosting
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Self-Hosting a Next.js App on a VPS
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything needed to run Next.js in production on your own server:
            the reverse proxy, the process manager, the certificate, and the
            monitoring that tells you when any of it stops working. Written
            while doing exactly this, not assembled from documentation.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            The order to do it in
          </h2>
          <ol className="space-y-8">
            {STEPS.map((step, index) => (
              <li key={step.slug} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="text-muted-foreground mt-1 font-mono text-sm"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="mb-1 text-lg font-medium">
                    <Link
                      href={`/blog/${step.slug}`}
                      className="hover:underline"
                    >
                      {step.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground">{step.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Should you self-host at all?
          </h2>
          <p className="mb-4">
            Honest answer: for most projects, no. Managed platforms are cheaper
            in time and the failure modes you take on are real — you become the
            operations team.
          </p>
          <p className="mb-4">
            It is worth it when you need custom middleware, specific Node flags,
            persistent background jobs, or when avoiding vendor lock-in matters
            more than avoiding a weekend of certificate debugging.
          </p>
          <p className="text-muted-foreground">
            This site runs on a VPS. The posts below are the actual setup, not a
            retelling of it.
          </p>
        </section>

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
          Something here out of date?{' '}
          <Link href="/#contact" className="text-primary hover:underline">
            Send a note
          </Link>{' '}
          — corrections are welcome.
        </p>
      </main>
    </>
  )
}
