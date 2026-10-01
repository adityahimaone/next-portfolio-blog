import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WORK_PROJECTS, getProject } from '@/data/projects'
import { breadcrumbList, creativeWork, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

/**
 * `/projects/[slug]` — the first URL on this domain that describes any of the
 * shipped work.
 *
 * Every project in `data/projects.ts` carries an external `url` (a repo or a
 * live client site), and detail was previously reachable only through a modal.
 * So all six projects were indexable solely as outbound links from `/projects`:
 * the strongest material on the site was earning its authority for whichever
 * host it happened to sit on.
 *
 * The off-site `url` is kept, and linked from the page rather than replacing it
 * — the local page is the case study, the external link is the artefact.
 */
export function generateStaticParams() {
  return WORK_PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) {
    return { title: 'Project not found' }
  }

  const description = `${project.description} Built with ${project.stack.join(', ')} — ${project.role.toLowerCase()}, ${project.year}.`

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — Aditya Himawan`,
      description,
      url: `${WEBSITE_URL}/projects/${project.slug}`,
      type: 'article',
      images: project.cover ? [project.cover] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — Aditya Himawan`,
      description,
    },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProject(slug)

  // An unknown slug renders the 404 rather than a thin page. Better no index
  // entry than an empty one.
  if (!project) notFound()

  const url = `${WEBSITE_URL}/projects/${project.slug}`

  const work = creativeWork({
    title: project.title,
    description: project.description,
    url,
    // `cover` is empty on two of the six; the builder falls back to the site
    // image rather than emitting an image-less CreativeWork.
    image: project.cover || undefined,
    genre: project.genre,
    year: project.year,
    stack: project.stack,
  })

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: project.title, path: `/projects/${project.slug}` },
  ])

  // Previous/next in the curated ORDER, so every detail page is reachable from
  // its neighbours and the set is a chain rather than six isolated pages.
  const index = WORK_PROJECTS.findIndex((p) => p.slug === project.slug)
  const previous = WORK_PROJECTS[index - 1]
  const next = WORK_PROJECTS[index + 1]

  return (
    <>
      <JsonLd data={work} />
      <JsonLd data={breadcrumbs} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm">
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground"
          >
            ← All projects
          </Link>
        </nav>

        <header className="mb-10">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            {project.genre} · {project.year}
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-muted-foreground text-lg">{project.description}</p>
        </header>

        <dl className="mb-10 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground mb-1 font-mono text-xs tracking-[0.14em] uppercase">
              Role
            </dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1 font-mono text-xs tracking-[0.14em] uppercase">
              Year
            </dt>
            <dd>{project.year}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground mb-2 font-mono text-xs tracking-[0.14em] uppercase">
              Stack
            </dt>
            <dd className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="border-border bg-muted rounded-full border px-3 py-1 text-sm"
                >
                  {tech}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            What it does
          </h2>
          <ul className="space-y-2">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* The external link is a visit, not an exit: `nofollow` is not applied
            because the page is the case study and this is the artefact, but it
            opens in a new tab so the reader keeps their place in the set. */}
        <p className="mb-16">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium underline underline-offset-4"
          >
            Visit {project.title} ↗
          </a>
        </p>

        <nav
          aria-label="Other projects"
          className="border-border flex flex-wrap justify-between gap-4 border-t pt-6"
        >
          {previous ? (
            <Link
              href={`/projects/${previous.slug}`}
              className="hover:underline"
            >
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="hover:underline">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </>
  )
}
