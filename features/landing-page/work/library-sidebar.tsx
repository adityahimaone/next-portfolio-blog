'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { motion, useSpring, useTransform } from 'motion/react'
import { Cover } from '@/features/booth/cover'
import {
  GITHUB_URL,
  type ArchiveTrack,
  type LibraryTrack,
} from './library-data'
import styles from './work.module.css'

/** Keeps the archive a hint rather than a second list. */
const ARCHIVE_LIMIT = 3

type LibrarySidebarProps = {
  tracks: readonly LibraryTrack[]
  /** Live repositories, newest push first. Built by work-section.tsx. */
  archiveTracks: readonly ArchiveTrack[]
  activeIndex: number
  query: string
  onSelect: (index: number) => void
}

export function LibrarySidebar({
  tracks,
  archiveTracks,
  activeIndex,
  query,
  onSelect,
}: LibrarySidebarProps) {
  // Search narrows the playable list only. The archive is a reference panel
  // and stays put, so a filter never makes the column look emptied out.
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(needle) ||
          track.genre?.toLowerCase().includes(needle),
      )
    : tracks

  return (
    <aside className={styles.sidebar} aria-label="Library">
      <div className={styles.sidebarHead}>
        <span className={styles.sidebarTitle}>Library</span>
        <a
          className={styles.sidebarGithub}
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      <ul
        className={styles.libraryList}
        role="listbox"
        aria-label="Playable projects"
        aria-activedescendant={`library-item-${tracks[activeIndex]?.id ?? ''}`}
      >
        {visible.map((track) => {
          const index = tracks.indexOf(track)
          return (
            <LibraryRow
              key={track.id}
              track={track}
              position={index}
              total={tracks.length}
              isActive={index === activeIndex}
              onSelect={() => onSelect(index)}
            />
          )
        })}

        {visible.length === 0 && (
          <li className={styles.libraryEmpty}>
            {query.trim()
              ? `No project matches “${query.trim()}”`
              : 'No project to show yet'}
          </li>
        )}
      </ul>

      {/* Read-only. Not selectable, and not part of the scroll sequence.
          Capped at three so the column stays compact; the rest live on
          /projects, which lists the same repositories. */}
      {archiveTracks.length > 0 && (
        <div className={styles.archive}>
          <div className={styles.archiveHead}>
            <span>More on GitHub</span>
          </div>
          <ul className={styles.archiveList}>
            {archiveTracks.slice(0, ARCHIVE_LIMIT).map((item) => (
              <ArchiveRow key={item.slug} item={item} />
            ))}
          </ul>
          {/* The full set stays reachable without widening the column. Internal
              rather than out to GitHub: this is a portfolio, and /projects is
              the page that actually shows the work. */}
          <Link className={styles.archiveMore} href="/projects">
            All projects
            <ExternalLink size={11} aria-hidden="true" />
          </Link>
        </div>
      )}
    </aside>
  )
}

type LibraryRowProps = {
  track: LibraryTrack
  position: number
  total: number
  isActive: boolean
  onSelect: () => void
}

function LibraryRow({
  track,
  position,
  total,
  isActive,
  onSelect,
}: LibraryRowProps) {
  // Springs, then written as one transform string so the row stays on the GPU.
  const lift = useSpring(isActive ? -2 : 0, {
    stiffness: 320,
    damping: 26,
  })
  const transform = useTransform(
    lift,
    (value) => `translate3d(0, ${value}px, 0)`,
  )

  return (
    <motion.li
      id={`library-item-${track.id}`}
      style={{ transform }}
      className={styles.libraryItem}
    >
      <button
        type="button"
        role="option"
        aria-selected={isActive}
        aria-posinset={position + 1}
        aria-setsize={total}
        className={styles.libraryRow}
        onClick={onSelect}
      >
        <span className={styles.libraryArt}>
          {/* Through Cover rather than next/image: a project with no artwork
              (SeaPhantom P2P, Labgrownbeasts) has an empty `cover`, and
              next/image throws on an empty src. Cover draws the generated
              art in that case. */}
          <Cover
            seed={track.slug}
            title={track.title}
            src={track.cover || undefined}
            sizes="30px"
          />
        </span>
        <span className={styles.libraryMeta}>
          <span className={styles.libraryName}>{track.title}</span>
          <span className={styles.librarySub}>{track.genre}</span>
        </span>
        {isActive && (
          <span className={styles.equaliser} aria-label="Now playing">
            <i />
            <i />
            <i />
          </span>
        )}
      </button>
    </motion.li>
  )
}

function ArchiveRow({ item }: { item: ArchiveTrack }) {
  return (
    <li className={styles.archiveItem}>
      <a
        className={styles.archiveLink}
        href={item.url}
        target="_blank"
        rel="noreferrer"
      >
        {/* The same 1:1 unit the blog lead art and the project sleeves use, so
            the archive rows read as one catalogue rather than a second
            language. A repository has no artwork, so this always draws the
            generated cover; it is seeded by repo name, so a row never changes
            art between builds. */}
        <span className={styles.archiveArt}>
          <Cover
            seed={item.slug}
            title={item.name}
            catalog="SRC"
            src={item.cover || undefined}
            sizes="26px"
          />
        </span>
        <span className={styles.archiveMeta}>
          <span className={styles.archiveName}>{item.name}</span>
          <span className={styles.archiveSub}>
            {item.tech[0] ?? item.description}
          </span>
        </span>
        <ExternalLink
          size={11}
          aria-hidden="true"
          className={styles.archiveIcon}
        />
      </a>
    </li>
  )
}
