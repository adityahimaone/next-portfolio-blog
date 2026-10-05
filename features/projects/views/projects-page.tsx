'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Github, Pause, Play, Star } from 'lucide-react'
import {
  Cover,
  FilterRow,
  PageHeader,
  Record,
  useRoomChannel,
} from '@/features/booth'
import { useDockSlot } from '@/features/booth/dock-slot'
import { formatRelative } from '@/lib/date'
import {
  PROJECT_PREVIEW_DURATION,
  WORK_PROJECTS,
  formatProjectTime,
  trackLabel,
} from '@/data/projects'
import type { ContributionDay, FeaturedProject, GitHubRepo } from '../index'
import { Sleeve } from '../components/sleeve'
import { LinerSheet } from '../components/liner-sheet'
import ContributionSkyline from '@/components/ui/contribution-skyline'
import { GITHUB_USER } from '../lib/github'
import styles from '../crate.module.css'

/** One "playback" track per release, so progress is real and per-project. */
const ELAPSED = new Map<number, number>()

export function ProjectsPage({
  repos,
  featuredProjects,
  contributions = [],
  contributionsFailed = false,
  feedFailed = false,
}: {
  repos: GitHubRepo[]
  featuredProjects: FeaturedProject[]
  contributions?: ContributionDay[]
  contributionsFailed?: boolean
  feedFailed?: boolean
}) {
  const setHue = useRoomChannel()
  const [activeId, setActiveId] = useState(WORK_PROJECTS[0].id)
  const [playing, setPlaying] = useState(true)
  // Filters by problem shape rather than by genre. Every project's `genre` is
  // unique, so the old genre filter rendered seven chips for six projects and
  // each one narrowed the crate to a single sleeve — a control that looked like
  // a filter but could not group anything.
  const [problem, setProblem] = useState('All')
  const [elapsed, setElapsed] = useState(0)
  const [linerId, setLinerId] = useState<number | null>(null)

  const visible = useMemo(
    () =>
      problem === 'All'
        ? WORK_PROJECTS
        : WORK_PROJECTS.filter((p) => p.problem === problem),
    [problem],
  )

  // Ordered by size so the buckets read as a shape rather than alphabetically,
  // and counted so each chip can show how much is behind it.
  const problems = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of WORK_PROJECTS) {
      counts.set(p.problem, (counts.get(p.problem) ?? 0) + 1)
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )
  }, [])

  // The selection follows the filter during render rather than being corrected
  // in an effect. An effect needed a second pass to notice the active project
  // had been filtered out, so the panel showed a sleeve that was no longer in
  // the crate for one frame; deriving it here is correct on the first paint and
  // costs no extra render.
  const selectedId = visible.some((p) => p.id === activeId)
    ? activeId
    : (visible[0]?.id ?? WORK_PROJECTS[0].id)

  const project =
    WORK_PROJECTS.find((p) => p.id === selectedId) ?? WORK_PROJECTS[0]
  const index = WORK_PROJECTS.indexOf(project)
  const repo = repos.find((r) => r.name === featuredProjects[index]?.githubSlug)

  useEffect(() => {
    setHue(project.palette.a)
  }, [project, setHue])

  // Each release has its own elapsed clock, so switching back resumes it.
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (next >= PROJECT_PREVIEW_DURATION) {
          ELAPSED.set(project.id, 0)
          return 0
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, project.id])

  function select(id: number) {
    ELAPSED.set(activeId, elapsed)
    setActiveId(id)
    setElapsed(ELAPSED.get(id) ?? 0)
  }

  function go(delta: number) {
    const next = (index + delta + WORK_PROJECTS.length) % WORK_PROJECTS.length
    select(WORK_PROJECTS[next].id)
  }

  useDockSlot(
    <div className={styles.transport} role="group" aria-label="Crate transport">
      <button
        type="button"
        onClick={() => go(-1)}
        className={styles.transportBtn}
        aria-label="Previous release"
      >
        <Play
          size={13}
          aria-hidden="true"
          style={{ transform: 'rotate(180deg)' }}
        />
      </button>
      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        className={styles.transportPlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
      </button>
      <span className={styles.transportMeta}>
        {project.title} · {formatProjectTime(elapsed)} /{' '}
        {formatProjectTime(PROJECT_PREVIEW_DURATION)}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        className={styles.transportBtn}
        aria-label="Next release"
      >
        <Play size={13} aria-hidden="true" />
      </button>
    </div>,
    [project.id, elapsed, playing],
  )

  return (
    <>
      <main className={styles.page} id="main-content">
        <PageHeader
          index="01"
          eyebrow="Selected work"
          title="Proof in the product."
          description="Six shipped releases, strongest first. Pick one to put it on the turntable."
          hint={
            <>
              SIDE {trackLabel(index)[0]} · {trackLabel(index)} /{' '}
              {String(WORK_PROJECTS.length).padStart(2, '0')}
            </>
          }
        />

        <div className={styles.crate}>
          <section
            className={`${styles.nowSpinning} glass`}
            aria-label="Now spinning"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id}
                className={styles.nsArt}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                <Record
                  className={styles.nsRecord}
                  label={project.palette.b}
                  position="absolute"
                  spinning={playing}
                />
                <Cover
                  seed={project.slug}
                  title={project.title}
                  catalog={trackLabel(index)}
                  src={project.cover}
                  sizes="(max-width: 900px) 40vw, 230px"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={project.id}
                className={styles.nsBody}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className={styles.nsKicker}>
                  {project.problem} · {project.genre} · {project.year}
                  {repo && repo.stargazers_count > 0 && (
                    <span>
                      <Star size={12} aria-hidden="true" />{' '}
                      {repo.stargazers_count}
                    </span>
                  )}
                </p>
                <h2 className={styles.nsTitle}>{project.title}</h2>
                <p className={styles.nsDesc}>{project.description}</p>
                <p className={styles.nsCredits}>{project.stack.join(' · ')}</p>

                <div className={styles.nsActions}>
                  {/* Two destinations, deliberately separate. This link is the
                      internal case study at /projects/[slug]; the one beside it
                      is the artefact itself. Before the detail pages existed the
                      only link out was "Open", which sent every visitor off-site
                      and left nothing on this domain describing the work.

                      Anchor text carries the project name and, for the outbound
                      link, what is actually on the other end. Six identical
                      "Open" labels read as six identical links to a crawler,
                      which is a weaker signal than six named ones — and "read the
                      Switchyard case study" is also a better label for anyone
                      scanning the page. */}
                  <Link
                    href={`/projects/${project.slug}`}
                    className={styles.genre}
                    style={{ textDecoration: 'none' }}
                  >
                    {project.title} case study
                  </Link>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.genre}
                    style={{ textDecoration: 'none' }}
                  >
                    <ArrowUpRight size={14} aria-hidden="true" />
                    {project.url.includes('github.com')
                      ? `${project.title} on GitHub`
                      : `${project.title} live`}
                  </a>
                  <button
                    type="button"
                    onClick={() => setLinerId(project.id)}
                    className={styles.genre}
                  >
                    <Github size={14} aria-hidden="true" />
                    Liner notes
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          <section>
            <div className={styles.crateHead}>
              <h2 className={styles.crateTitle}>
                Crate
                <span className={styles.crateCount}>
                  {visible.length} releases
                </span>
              </h2>
              <FilterRow
                label="Filter by problem"
                value={problem}
                onChange={(next) => setProblem(next || 'All')}
                options={[
                  { value: 'All', label: 'All', count: WORK_PROJECTS.length },
                  ...problems.map(([name, count]) => ({
                    value: name,
                    label: name,
                    count,
                  })),
                ]}
              />
            </div>

            <div className={styles.sleeveGrid}>
              {visible.map((item) => {
                const i = WORK_PROJECTS.indexOf(item)
                return (
                  <Sleeve
                    key={item.slug}
                    project={item}
                    index={i}
                    active={item.id === selectedId}
                    onPromote={() => select(item.id)}
                  />
                )
              })}
            </div>
          </section>

          <section>
            <div className={styles.crateHead}>
              <h2 className={styles.crateTitle}>
                Contribution skyline
                <span className={styles.crateCount}>live from GitHub</span>
              </h2>
              <a
                href={`https://github.com/${GITHUB_USER}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.genre}
                style={{ textDecoration: 'none' }}
              >
                <Github size={14} aria-hidden="true" />
                github.com/{GITHUB_USER}
              </a>
            </div>

            {/* Real counts when the fetch lands. With no data the component
                draws its own seeded sample year, so a failed scrape degrades
                to a labelled placeholder instead of an empty panel — hence the
                caption swap rather than hiding the section. */}
            <ContributionSkyline
              data={contributions}
              defaultView="3d"
              palette="ember"
              footer={
                contributions.length
                  ? 'Hover a day for its count · arrow keys to walk the year'
                  : contributionsFailed
                    ? 'Live counts unavailable — showing a generated sample year.'
                    : 'Showing a generated sample year.'
              }
            />
          </section>

          <section>
            <div className={styles.crateHead}>
              <h2 className={styles.crateTitle}>
                Recently played
                <span className={styles.crateCount}>live from GitHub</span>
              </h2>
            </div>

            {repos.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className="sr-only">
                    Recent repositories pushed to github.com/adityahimaone
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Repo</th>
                      <th scope="col" className={styles.colLang}>
                        Language
                      </th>
                      <th
                        scope="col"
                        className={`${styles.colStars} ${styles.num}`}
                      >
                        ★
                      </th>
                      <th scope="col" className={styles.num}>
                        Pushed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {repos.slice(0, 8).map((repoItem) => (
                      <tr key={repoItem.name}>
                        <td>
                          <a
                            href={repoItem.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.repoName}
                          >
                            {repoItem.name}
                          </a>
                        </td>
                        <td className={styles.cellLang}>
                          {repoItem.language && (
                            <span
                              className={styles.langDot}
                              aria-hidden="true"
                            />
                          )}
                          {repoItem.language ?? '—'}
                        </td>
                        <td className={`${styles.cellStars} ${styles.num}`}>
                          {repoItem.stargazers_count || '—'}
                        </td>
                        <td className={styles.num}>
                          {formatRelative(repoItem.pushed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>
                {feedFailed
                  ? 'Session log unavailable — the last fetch from GitHub failed. The releases above are cached.'
                  : 'No recent pushes to report.'}
              </p>
            )}
          </section>
        </div>
      </main>

      <LinerSheet
        project={
          linerId === null
            ? null
            : (WORK_PROJECTS.find((p) => p.id === linerId) ?? null)
        }
        index={
          linerId === null
            ? 0
            : WORK_PROJECTS.findIndex((p) => p.id === linerId)
        }
        onClose={() => setLinerId(null)}
      />
    </>
  )
}
