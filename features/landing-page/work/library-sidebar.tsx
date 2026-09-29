'use client'

import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { motion, useSpring, useTransform } from 'motion/react'
import {
  ARCHIVE_TRACKS,
  GITHUB_URL,
  type ArchiveTrack,
  type LibraryTrack,
} from './library-data'
import styles from './work.module.css'

/** Keeps the archive a hint rather than a second list. */
const ARCHIVE_LIMIT = 3

type LibrarySidebarProps = {
  tracks: readonly LibraryTrack[]
  activeIndex: number
  query: string
  onSelect: (index: number) => void
}

export function LibrarySidebar({
  tracks,
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
          <li className={styles.libraryEmpty}>No matches</li>
        )}
      </ul>

      {/* Read-only. Not selectable, and not part of the scroll sequence.
          Capped at three so the column stays compact; the rest live on GitHub. */}
      <div className={styles.archive}>
        <div className={styles.archiveHead}>
          <span>More on GitHub</span>
        </div>
        <ul className={styles.archiveList}>
          {ARCHIVE_TRACKS.slice(0, ARCHIVE_LIMIT).map((item) => (
            <ArchiveRow key={item.name} item={item} />
          ))}
        </ul>
        {/* The full set stays reachable without widening the column. */}
        {ARCHIVE_TRACKS.length > ARCHIVE_LIMIT && (
          <a
            className={styles.archiveMore}
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            +{ARCHIVE_TRACKS.length - ARCHIVE_LIMIT} more
          </a>
        )}
      </div>
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
          <Image src={track.cover} alt="" fill sizes="44px" />
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
        <span className={styles.archiveArt}>
          <Image src={item.cover} alt="" fill sizes="28px" />
        </span>
        <span className={styles.archiveMeta}>
          <span className={styles.archiveName}>{item.name}</span>
          <span className={styles.archiveSub}>{item.tech[0]}</span>
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
