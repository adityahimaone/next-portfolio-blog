'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../types'
import { ARCHIVE } from '../../data/projects'
import { ProjectCard } from './project-card'
import { ProjectDialog } from './project-dialog'
import { Reveal, Stagger, StaggerItem } from '../motion/reveal'
import { padIndex } from '../../lib/format'

export function WorksSection({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null)

  return (
    <section id="works" className="relative py-[clamp(88px,11vw,144px)]">
      <div className="lg-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
            <div>
              <p className="lg-eyebrow lg-mono text-[var(--lg-ink-faint)]">
                Side Two — Selected works
              </p>
              <h2 className="lg-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">
                Selected works
              </h2>
              <p className="lg-body mt-4 max-w-[52ch] text-[15px]">
                A small, deliberate catalogue — products, tools and interfaces
                built to be listened to.
              </p>
            </div>

            <div className="flex items-center gap-6 pb-2">
              <span className="lg-mono text-[var(--lg-ink-faint)]">
                {padIndex(projects.length)} releases
              </span>
              <span
                className="hidden h-3 w-px bg-white/15 sm:block"
                aria-hidden="true"
              />
              <span className="lg-mono hidden text-[var(--lg-ink-faint)] sm:inline">
                2021 — 2026
              </span>
            </div>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem
              key={project.id}
              className={
                project.span === 'feature'
                  ? 'lg:col-span-2 lg:row-span-2'
                  : project.span === 'wide'
                    ? 'sm:col-span-2 lg:col-span-2'
                    : ''
              }
            >
              <ProjectCard project={project} onOpen={setOpen} />
            </StaggerItem>
          ))}
        </Stagger>

        {/* The rest of the shelf */}
        <Reveal delay={0.1}>
          <div className="mt-14">
            <div className="flex items-center justify-between pb-3">
              <p className="lg-mono text-[var(--lg-ink-faint)]">
                The rest of the shelf
              </p>
              <p className="lg-mono text-[var(--lg-ink-faint)]">
                14 in the archive
              </p>
            </div>

            <div className="border-t border-white/[0.08]">
              {ARCHIVE.map((entry) => (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group flex items-center gap-5 border-b border-white/[0.06] py-4 transition-colors duration-500 hover:border-white/15"
                >
                  <span className="lg-mono w-8 shrink-0 text-[var(--lg-ink-ghost)] transition-colors duration-500 group-hover:text-[var(--lg-amber)]">
                    {entry.index}
                  </span>
                  <span className="flex-1 text-[15px] font-medium tracking-[-0.01em] text-[var(--lg-ink-dim)] transition-colors duration-500 group-hover:text-[var(--lg-ink)]">
                    {entry.title}
                  </span>
                  <span className="lg-mono hidden text-[var(--lg-ink-faint)] sm:inline">
                    {entry.meta}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-[var(--lg-ink-faint)] transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--lg-ink)]"
                  />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
