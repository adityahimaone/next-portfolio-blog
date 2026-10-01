'use client'

import { memo, useCallback, useRef, useState } from 'react'
import { ArrowUpRight, Pencil, Play, Star, Trash2 } from 'lucide-react'
import type { Bookmark } from '../types'
import { channelColor } from '../constants/categories'
import { extractDomain } from '../utils/favicon'
import { FaviconCell } from './favicon-cell'
import { SitePeek } from './site-peek'
import styles from '../library.module.css'

interface TrackRowProps {
  bookmark: Bookmark
  index: number
  active: boolean
  isAdmin?: boolean
  /** False on touch, where there is no hover to preview from. */
  canHover?: boolean
  onEdit: (bookmark: Bookmark) => void
  onDelete: (bookmark: Bookmark) => void
}

/**
 * One saved link as a library row. The index becomes a play glyph on hover,
 * the way a music list does — the row is still a plain anchor underneath, so
 * the affordance is decorative and the link always works.
 *
 * The live peek is a sibling of the anchor, never a child: an iframe inside the
 * link would consume the click the row exists to make. Preview is bound to
 * hover only, never to `active`, so arrowing the list with j/k does not fire a
 * request per row.
 *
 * Memoized, and the reason is the pagination. Appending a page re-renders the
 * list, and without this every row already on screen re-renders too — so a
 * reader who has loaded four pages pays for 240 rows to gain 60, five times
 * over, and each row carries a favicon hook and two peek effects. That is what
 * reads as a hitch when the sentinel fires repeatedly during a fast scroll.
 *
 * Memo only pays off because the props are stable. The two callbacks take the
 * bookmark as an argument rather than closing over it, so a row's identity
 * across renders is its bookmark object, not a fresh arrow function; the
 * parent memoizes them on the state they actually read.
 */
export const TrackRow = memo(function TrackRow({
  bookmark,
  index,
  active,
  isAdmin = false,
  canHover = true,
  onEdit,
  onDelete,
}: TrackRowProps) {
  const rowRef = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const handleEdit = useCallback(() => {
    onEdit(bookmark)
  }, [onEdit, bookmark])

  const handleDelete = useCallback(() => {
    onDelete(bookmark)
  }, [onDelete, bookmark])

  // Stable across renders so memo actually holds: `canHover` is the only thing
  // these read besides the row's own state, and it changes only on a pointer
  // capability change.
  const handleEnter = useCallback(() => {
    if (canHover) setHovered(true)
  }, [canHover])

  const handleLeave = useCallback(() => {
    setHovered(false)
  }, [])

  return (
    <li data-active={active || undefined}>
      <a
        ref={rowRef}
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        title={bookmark.description || bookmark.url}
        className={styles.track}
        // The active-row treatment (LED rail, number→play swap, title colour,
        // arrow) is keyed off this attribute on the anchor. It is mirrored on
        // the <li> for the list-level hooks.
        data-active={active || undefined}
        style={{ ['--led' as string]: channelColor(bookmark.category) }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span className={styles.index}>
          <span className={styles.num}>{index + 1}</span>
          <Play size={14} className={styles.playGlyph} aria-hidden="true" />
        </span>

        <span className={styles.art}>
          <FaviconCell url={bookmark.url} faviconUrl={bookmark.faviconUrl} />
        </span>

        <span className={styles.name}>
          <span className={styles.nameText}>{bookmark.title}</span>
          {bookmark.featured && (
            <Star size={12} className={styles.pinStar} aria-label="Pinned" />
          )}
        </span>

        <span className={styles.host}>{extractDomain(bookmark.url)}</span>
        {isAdmin ? (
          <span className={styles.rowActions}>
            <button
              type="button"
              onClick={handleEdit}
              className={styles.rowAction}
              aria-label={`Edit ${bookmark.title}`}
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.rowAction}
              aria-label={`Delete ${bookmark.title}`}
            >
              <Trash2 size={13} />
            </button>
          </span>
        ) : (
          <ArrowUpRight size={14} className={styles.arrow} aria-hidden="true" />
        )}
      </a>

      <SitePeek url={bookmark.url} anchorRef={rowRef} hovered={hovered} />
    </li>
  )
})
