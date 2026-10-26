'use client'

import Image from 'next/image'
import Link from 'next/link'

import { WORK_PROJECTS, type WorkProject } from '@/data/projects'

import { ArrowUpRight } from './doodles'
import { Reveal } from './reveal'
import { SectionHead, SectionNext } from './section-head'
import styles from './studio.module.css'

/** All six releases, in the order they belong on the shelf. */
const SHOWCASE_SLUGS = [
  'switchyard',
  'primarindo-asia',
  'habit-tracker',
  'seaphantom',
  'seaphantom-p2p',
  'labgrownbeasts',
] as const

const SHOWCASE = SHOWCASE_SLUGS.map((slug) =>
  WORK_PROJECTS.find((project) => project.slug === slug),
).filter((project): project is WorkProject => Boolean(project))

/** The grid cells, in order: one lead single, then five deep cuts. */
const CELLS = [
  'projectLead',
  'projectWide',
  'projectMid',
  'projectWideAlt',
  'projectMidAlt',
  'projectSmall',
] as const

/**
 * Two releases have no artwork in the data. Rather than an empty box, they get
 * a generated sleeve in the same print language as the Show & Tell studies:
 * catalogue code, a fat word, a ring, and a dot screen.
 */
function GeneratedCover({
  project,
  index,
}: {
  project: WorkProject
  index: number
}) {
  const lab = project.slug === 'labgrownbeasts'

  return (
    <div
      className={styles.generatedCover}
      data-variant={lab ? 'petri' : 'orbit'}
      aria-hidden
    >
      <div className={styles.genGrid} />
      <span className={styles.genCode}>
        AH—{String(index + 1).padStart(3, '0')} / generated sleeve
      </span>
      <span className={styles.genGhost}>{lab ? 'LAB' : 'P2P'}</span>
      <span className={styles.genRing} />
      {lab ? (
        <>
          <span className={styles.genCell} data-size="lg" />
          <span className={styles.genCell} data-size="sm" />
        </>
      ) : (
        <span className={styles.genOrbit} />
      )}
      <span className={styles.genNote}>
        {lab ? 'grown, not assembled' : 'peer to peer / settle'}
      </span>
    </div>
  )
}

function ProjectCard({
  project,
  index,
  lead,
  compact,
}: {
  project: WorkProject
  index: number
  lead?: boolean
  compact?: boolean
}) {
  return (
    <article
      className={`${styles.projectCard} ${lead ? styles.projectCardLead : ''} ${
        compact ? styles.projectCardCompact : ''
      }`}
    >
      <span className={styles.projectTape} aria-hidden />
      <Link className={styles.projectLink} href={`/projects/${project.slug}`}>
        <div className={styles.projectMedia}>
          {project.cover ? (
            <Image
              src={project.cover}
              alt={`${project.title} interface`}
              fill
              sizes={
                lead
                  ? '(min-width: 1024px) 58vw, 100vw'
                  : '(min-width: 1024px) 34vw, 100vw'
              }
              className="object-cover"
            />
          ) : (
            <GeneratedCover project={project} index={index} />
          )}
        </div>
        <div className={styles.projectBody}>
          <div className={styles.projectKicker}>
            <span>
              <b>{String(index + 1).padStart(2, '0')}</b> · {project.genre}
            </span>
            <span>{project.year}</span>
          </div>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <p className={styles.projectDesc}>{project.description}</p>
          <ul className={styles.stack}>
            {project.stack.slice(0, lead ? 5 : compact ? 2 : 3).map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <span className={styles.projectCta}>
            Read the notes
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  )
}

export function Projects() {
  const [lead, ...rest] = SHOWCASE

  return (
    <section
      id="work"
      className={`${styles.work} scroll-mt-24`}
      aria-labelledby="work-title"
    >
      <div className={styles.shell}>
        <SectionHead
          onDark
          number="03"
          label="Selected work"
          script="the good stuff"
          title={
            <span id="work-title">
              Work that
              <br />
              shipped.
            </span>
          }
          intro="Six releases from the catalogue. One lead single, five deep cuts: a control plane, a manufacturing group, a habit tracker, two trading floors and a biotech brand."
        />

        <div className={styles.workGrid}>
          {lead ? (
            <Reveal className={styles.projectLead} y={30}>
              <ProjectCard project={lead} index={0} lead />
            </Reveal>
          ) : null}
          {rest.map((project, index) => (
            <Reveal
              key={project.slug}
              className={styles[CELLS[index + 1]]}
              delay={0.06 + index * 0.045}
              y={30}
            >
              <ProjectCard
                project={project}
                index={index + 1}
                compact={index >= 3}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className={styles.archiveBand}>
            <p>Six releases · one shelf · 2022–26</p>
            <Link className={styles.archiveLink} href="/projects">
              The full discography
              <ArrowUpRight className="size-5" />
            </Link>
          </div>
        </Reveal>

        <SectionNext onDark href="skills" label="Skills" note="the toolbox" />
      </div>
    </section>
  )
}
