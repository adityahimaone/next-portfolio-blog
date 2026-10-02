import type { Metadata } from 'next'
import { WEBSITE_URL } from '@/lib/constants'

/**
 * The two guide routes, in one place.
 *
 * Both were full page components that inlined their own layout — a Tailwind
 * `max-w-3xl` column, a hand-written breadcrumb, an h1 — so the two guides
 * looked like neither each other nor the blog detail they sit beside. Moving
 * the shared parts here means a guide gets the reader shell for free and the
 * two pages become content plus metadata.
 *
 * `updated` is deliberately hand-written rather than derived from git. A
 * build-time `git log` call makes the output depend on a `.git` directory that
 * does not exist in most deploys, which silently drops the date instead of
 * failing. The blog does the same thing, so the two stay consistent.
 */

export interface GuideSection {
  /** Heading, rendered as an h2 and picked up as a chapter. */
  title: string
  /** One of `prose`, `steps`, `table`, `choices`, `faq`. */
  kind: 'prose' | 'steps' | 'table' | 'choices' | 'faq'
  intro?: string
  paragraphs?: string[]
}

export interface GuideStep {
  slug: string
  title: string
  summary: string
}

export interface GuideChoice {
  pick: string
  when: string
  why: string
}

export interface GuideTable {
  columns: string[]
  rows: { label: string; cells: string[] }[]
}

export interface GuideMeta {
  slug: string
  title: string
  /** Short uppercase eyebrow, the way the deck labels a section. */
  eyebrow: string
  description: string
  /** Long form standfirst, shown under the h1. */
  standfirst: string
  /** ISO date, formatted by `formatDate` at render. */
  updated: string
  /** One tag, used to pick the cover hue the way blog posts use theirs. */
  tag: string
  /** The correction line under the last section. */
  correction: string
}

export const GUIDES: Record<string, GuideMeta> = {
  'self-hosting-nextjs': {
    slug: 'self-hosting-nextjs',
    title: 'Self-Hosting a Next.js App on a VPS',
    eyebrow: 'Guide · Self-hosting',
    description:
      'A complete guide to running Next.js in production on your own VPS: Nginx reverse proxy, PM2, SSL, monitoring, and the trade-offs against Vercel.',
    standfirst:
      'Everything needed to run Next.js in production on your own server: the reverse proxy, the process manager, the certificate, and the monitoring that tells you when any of it stops working. Written while doing exactly this, not assembled from documentation.',
    updated: '2026-09-18',
    tag: 'self-hosting',
    correction: 'Send a note',
  },
  'vps-vs-vercel': {
    slug: 'vps-vs-vercel',
    title: 'VPS vs Vercel vs Netlify for Next.js',
    eyebrow: 'Comparison',
    description:
      'An honest comparison of self-hosting a Next.js app on a VPS against Vercel and Netlify: real costs, real limits, and when each one is the right call.',
    standfirst:
      'All three will serve your Next.js app in production. They differ in who handles the failure modes, and what it costs you to find out. This site runs on a VPS, so the third column is not theoretical here.',
    updated: '2026-09-24',
    tag: 'infrastructure',
    correction: 'Tell me',
  },
}

export const GUIDE_SLUGS = Object.keys(GUIDES)

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
const VPS_SECTIONS: GuideSection[] = [
  {
    title: 'Side by side',
    kind: 'table',
    paragraphs: [
      'Pricing moves; the shape of the trade-off does not. Check current numbers before deciding.',
    ],
  },
  {
    title: 'Which one to pick',
    kind: 'choices',
  },
  {
    title: 'The part people forget',
    kind: 'prose',
    paragraphs: [
      'A VPS is not free hosting — it is hosting you pay for with your time. Someone has to renew certificates, patch the OS, replace a disk that fills up at 3am, and notice that the response time quietly doubled. None of that is hard. It is just continuous, and it is invisible until it stops.',
      'If nobody on your team wants that job, use a platform and spend the difference on something else. If you want the job, the self-hosting guide is the path.',
    ],
  },
]

export const VPS_TABLE: GuideTable = {
  columns: ['VPS', 'Vercel', 'Netlify'],
  rows: [
    { label: 'Monthly cost, small site', cells: ['~$5', '$0–20', '$0–19'] },
    { label: 'Who patches the OS', cells: ['You', 'They', 'They'] },
    { label: 'Custom Node flags', cells: ['Yes', 'Limited', 'Limited'] },
    {
      label: 'Background jobs',
      cells: ['Yes', 'Separate service', 'Separate service'],
    },
    { label: 'Cold starts', cells: ['None', 'Frequent', 'Frequent'] },
    { label: 'Lock-in', cells: ['None', 'Moderate', 'Moderate'] },
    {
      label: 'Time to first deploy',
      cells: ['An afternoon', 'Two minutes', 'Two minutes'],
    },
  ],
}

export const VPS_CHOICES: GuideChoice[] = [
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
const SELF_HOSTING_STEPS: GuideStep[] = [
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

const SELF_HOSTING_FAQ = [
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

export const SELF_HOSTING_SECTIONS: GuideSection[] = [
  {
    title: 'The order to do it in',
    kind: 'steps',
  },
  {
    title: 'Should you self-host at all?',
    kind: 'prose',
    paragraphs: [
      'Honest answer: for most projects, no. Managed platforms are cheaper in time and the failure modes you take on are real — you become the operations team.',
      'It is worth it when you need custom middleware, specific Node flags, persistent background jobs, or when avoiding vendor lock-in matters more than avoiding a weekend of certificate debugging.',
      'This site runs on a VPS. The posts below are the actual setup, not a retelling of it.',
    ],
  },
  {
    title: 'Common questions',
    kind: 'faq',
  },
]

/**
 * The FAQ doubles as the page's `FAQPage` structured data, so it is stored
 * once and rendered twice — once visibly, once as JSON-LD by the route.
 */
export function guideFaq(slug: string) {
  return slug === 'self-hosting-nextjs' ? SELF_HOSTING_FAQ : []
}

export function guideSections(slug: string): GuideSection[] {
  return slug === 'self-hosting-nextjs' ? SELF_HOSTING_SECTIONS : VPS_SECTIONS
}

export function guideSteps(slug: string): GuideStep[] {
  return slug === 'self-hosting-nextjs' ? SELF_HOSTING_STEPS : []
}

export function guideChoices(slug: string): GuideChoice[] {
  return slug === 'vps-vs-vercel' ? VPS_CHOICES : []
}

export function guideTable(slug: string): GuideTable | null {
  return slug === 'vps-vs-vercel' ? VPS_TABLE : null
}

/**
 * Next's `Metadata` for a guide.
 *
 * Both routes were writing the same object by hand and had already drifted —
 * one set an `openGraph` block, the other set nothing past the canonical. A
 * shared builder is what stops the third guide from shipping a fourth
 * variation.
 */
export function guideMetadata(slug: string): Metadata {
  const meta = GUIDES[slug]
  const url = `${WEBSITE_URL}/guides/${slug}`

  if (!meta) {
    return { title: 'Guide not found' }
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: 'article',
      // A guide is revised in place — the cost figures and the commands both
      // move — so the pair is published/modified rather than published alone.
      publishedTime: meta.updated,
      modifiedTime: meta.updated,
      authors: [WEBSITE_URL],
      tags: [meta.tag],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}

/** Word count across the rendered copy, at the 220wpm the blog assumes. */
function wordsIn(parts: (string | undefined)[]): number {
  return parts
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/**
 * A reading time, derived rather than typed.
 *
 * The blog stores one per post because posts are markdown and the count is
 * fixed at authoring. A guide's length depends on which sections its route
 * passed, so the number is computed from the same copy that renders — it
 * cannot drift from the page the way a hand-written string would.
 */
export function guideReadingTime(slug: string): string {
  const meta = GUIDES[slug]
  if (!meta) return '1 min read'

  const words = wordsIn([
    meta.standfirst,
    meta.title,
    meta.description,
    ...guideSections(slug).flatMap((section) => [
      section.title,
      section.intro,
      ...(section.paragraphs ?? []),
    ]),
    ...guideSteps(slug).map((step) => `${step.title} ${step.summary}`),
    ...guideChoices(slug).map(
      (choice) => `${choice.pick} ${choice.when} ${choice.why}`,
    ),
    ...(guideTable(slug)?.rows.map(
      (row) => `${row.label} ${row.cells.join(' ')}`,
    ) ?? []),
    ...guideFaq(slug).map((entry) => `${entry.question} ${entry.answer}`),
  ])

  return `${Math.max(1, Math.round(words / 220))} min read`
}
