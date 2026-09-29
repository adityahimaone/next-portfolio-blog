'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Github, Pause, Play, Star } from 'lucide-react'
import { Cover, PageHeader, Record, useRoomChannel } from '@/components/booth'
import { useDockSlot } from '@/components/booth/dock-slot'
import { formatRelative } from '@/lib/date'
import {
  PROJECT_PREVIEW_DURATION,
  WORK_PROJECTS,
  formatProjectTime,
  trackLabel,
} from '@/data/projects'
import type { FeaturedProject, GitHubRepo } from '../index'
import { Sleeve } from '../components/sleeve'
import { LinerSheet } from '../components/liner-sheet'
import styles from '../crate.module.css'

/** One "playback" track per release, so progress is real and per-project. */
const ELAPSED = new Map<number, number>()

export function ProjectsPage({
  repos,
  featuredProjects,
  feedFailed = false,
}: {
  repos: GitHubRepo[]
  featuredProjects: FeaturedProject[]
  feedFailed?: boolean
}) {
  const setHue = useRoomChannel()
  const [activeId, setActiveId] = useState(WORK_PROJECTS[0].id)
  const [playing, setPlaying] = useState(true)
  const [genre, setGenre] = useState('All')
  const [elapsed, setElapsed] = useState(0)
  const [linerId, setLinerId] = useState<number | null>(null)

  const project =
    WORK_PROJECTS.find((p) => p.id === activeId) ?? WORK_PROJECTS[0]
  const index = WORK_PROJECTS.indexOf(project)
  const repo = repos.find((r) => r.name === featuredProjects[index]?.githubSlug)

  const genres = useMemo(
    () => ['All', ...new Set(WORK_PROJECTS.map((p) => p.genre))],
    [],
  )
  const visible = useMemo(
    () =>
      genre === 'All'
        ? WORK_PROJECTS
        : WORK_PROJECTS.filter((p) => p.genre === genre),
    [genre],
  )

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
          index="05"
          eyebrow="Selected work"
          title="Proof in the product."
          description="Six shipped releases, newest first. Pick one to put it on the turntable."
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
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.3 }}
              >
                <p className={styles.nsKicker}>
                  {project.genre} · {project.year}
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
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.genre}
                    style={{ textDecoration: 'none' }}
                  >
                    <ArrowUpRight size={14} aria-hidden="true" />
                    Open
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
              <div
                className={styles.genres}
                role="group"
                aria-label="Filter by genre"
              >
                {genres.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={genre === name}
                    onClick={() => setGenre(name)}
                    className={styles.genre}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sleeveGrid}>
              {visible.map((item) => {
                const i = WORK_PROJECTS.indexOf(item)
                return (
                  <Sleeve
                    key={item.slug}
                    project={item}
                    index={i}
                    active={item.id === activeId}
                    onPromote={() => select(item.id)}
                  />
                )
              })}
            </div>
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
