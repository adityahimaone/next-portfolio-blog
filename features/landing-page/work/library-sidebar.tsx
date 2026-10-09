'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
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
  const [archiveExpanded, setArchiveExpanded] = useState(false)

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
          <button
            type="button"
            className={styles.archiveHead}
            aria-expanded={archiveExpanded}
            aria-controls="github-archive-list"
            onClick={() => setArchiveExpanded((expanded) => !expanded)}
          >
            <span>More on GitHub</span>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={styles.archiveChevron}
              data-expanded={archiveExpanded}
            />
          </button>
          <div
            id="github-archive-list"
            className={styles.archiveContent}
            hidden={!archiveExpanded}
          >
            <ul className={styles.archiveList}>
              {archiveTracks.slice(0, ARCHIVE_LIMIT).map((item) => (
                <ArchiveRow key={item.slug} item={item} />
              ))}
            </ul>
          </div>
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
  /** True for the row the scroll is travelling toward, before it arrives. */
  isPending?: boolean
  onSelect: () => void
}

function LibraryRow({
  track,
  position,
  total,
  isActive,
  isPending,
  onSelect,
}: LibraryRowProps) {
  /* The active row used to lift itself 2px while each of the others sat still,
     so changing track read as two rows twitching rather than as one thing moving
     down the list. Now the rows hold still and a single rule travels between
     them — the same reading as a playhead on a tape deck, and it means the
     distance between track 01 and track 04 is legible as distance. */
  return (
    /* The button carries the option role and is the listbox's DIRECT child.
       An option has to be a direct child of its listbox, and a list item
       cannot sit between the two — a `<li>` wrapper broke the required-parent
       and required-children relationship in both directions.

       So the row is a button rather than an `<li>`. The list semantics live on
       the button's own `role="option"`, which supersedes its implicit listitem
       role, and `<li>` would additionally be an interactive role containing a
       focusable descendant. `list-style: none` on the list already suppresses
       the markers, and the ul/li pairing carries no meaning here that the
       explicit roles do not already state. */
    <button
      id={`library-item-${track.id}`}
      type="button"
      role="option"
      aria-selected={isActive}
      aria-posinset={position + 1}
      aria-setsize={total}
      data-pending={isPending || undefined}
      className={`${styles.libraryItem} ${styles.libraryRow} ${
        isActive ? styles.libraryRowActive : ''
      }`}
      onClick={onSelect}
    >
      {/* One rule that travels between rows. Previously each row lifted itself
          2px, so a change read as two rows twitching rather than as one thing
          moving down the list. `layoutId` hands Motion the old box and the new
          one and it interpolates between them, which also makes the gap between
          track 01 and track 04 legible as distance.

          Rendered only on the active row: that is what gives layoutId the second
          box to measure, and it keeps the element out of the listbox's own
          children, which the role requires to be options. */}
      {isActive && (
        <motion.span
          aria-hidden="true"
          className={styles.libraryIndicator}
          layoutId="library-indicator"
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 34,
            mass: 0.6,
          }}
        />
      )}
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
