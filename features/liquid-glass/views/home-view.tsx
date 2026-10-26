'use client'

import Link from 'next/link'
import type { Note, Project } from '../types'
import { Atmosphere } from '../components/atmosphere'
import { Hero } from '../components/hero/hero'
import { WorksSection } from '../components/work/works-section'
import { NotesSection } from '../components/notes/notes-section'
import { useNotes, useProjects } from '../lib/use-content'
import { WEBSITE_URL } from '@/lib/constants'

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.07] pt-12 pb-28">
      <div className="lg-page flex flex-col gap-10">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <p className="lg-mono text-[var(--lg-ink-faint)]">Signal Records</p>
            <p className="mt-3 max-w-[32ch] text-[15px] leading-[1.5] tracking-[-0.01em] text-[var(--lg-ink-dim)]">
              Frontend engineering and interface design, from Jakarta. Open for
              selected work — Side Three is unrecorded.
            </p>
            <a
              href={`mailto:hello@${new URL(WEBSITE_URL).hostname}`}
              className="group mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--lg-ink)]"
            >
              Start a conversation
              <span className="h-px w-8 origin-left bg-current transition-transform duration-500 group-hover:scale-x-125" />
            </a>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-14 gap-y-2.5"
            aria-label="Footer"
          >
            {[
              { label: 'Projects', href: '/projects' },
              { label: 'Liner notes', href: '/notes' },
              { label: 'Bookmarks', href: '/bookmarks' },
              { label: 'The booth', href: '/music' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-6">
          <p className="lg-mono text-[var(--lg-ink-faint)]">
            © {new Date().getFullYear()} Aditya Himawan
          </p>
          <p className="lg-mono text-[var(--lg-ink-faint)]">
            Built with Next.js · GSAP · Web Audio
          </p>
          <a
            href="/rss.xml"
            className="lg-mono text-[var(--lg-ink-faint)] hover:text-[var(--lg-ink)]"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  )
}

/**
 * The home surface: one instrument, one shelf, one tracklist.
 *
 * `projects` and `notes` arrive already rendered from the server component, so
 * the first paint has real content. The hooks only revalidate if a remote
 * content endpoint is configured.
 */
export function HomeView({
  projects,
  notes,
}: {
  projects: Project[]
  notes: Note[]
}) {
  const { data: projectData } = useProjects(projects)
  const { data: noteData } = useNotes(notes)

  return (
    <div className="lg-root relative min-h-[100svh] overflow-x-clip">
      <Atmosphere />
      <main className="lg-shell relative z-10">
        <Hero />
        <WorksSection projects={projectData} />
        <NotesSection notes={noteData} />
        <SiteFooter />
      </main>
    </div>
  )
}
