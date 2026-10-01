'use client'

import { memo, useCallback, useRef, useState, type ReactNode } from 'react'
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
  /**
   * Forwarded to the <li> by SharedLayoutBg, which instruments the list's
   * direct children to place the moving pill. A custom component receives those
   * props but ignores them unless it spreads them, and the pill lands nowhere
   * if it does not.
   */
  className?: string
  onMouseEnter?: () => void
  /**
   * The injected pill container, rendered as the <li>'s first child.
   *
   * SharedLayoutBg injects the pill by wrapping each item's children, which
   * works for a plain <li> because React replaces its children. This component
   * builds its own content instead, so it has to render what it was handed or
   * the pill container is silently dropped.
   */
  children?: ReactNode
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
  className,
  onMouseEnter,
  children,
}: TrackRowProps) {
  const rowRef = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const handleEdit = useCallback(() => {
    onEdit(bookmark)
  }, [onEdit, bookmark])

  const handleDelete = useCallback(() => {
    onDelete(bookmark)
  }, [onDelete, bookmark])

  /*
    The hover that the pill replaces is this handler's only real job now, so it
    is kept for the SitePeek iframe alone. `canHover` still gates it: on touch
    the peek never opens, because `:hover` sticks after the first tap.

    Memo does not re-run on `onMouseEnter` changing identity — `memo`'s default
    comparison is shallow, and SharedLayoutBg hands out one cached closure per
    row key, so it stays stable for the life of the list.
  */
  const handleEnter = useCallback(() => {
    if (canHover) setHovered(true)
    onMouseEnter?.()
  }, [canHover, onMouseEnter])

  const handleLeave = useCallback(() => {
    setHovered(false)
  }, [])

  /*
    The <li> is the shared-layout item, not the <a>: the pill is injected here
    as a sibling of the anchor, and a pill inside the anchor would put an empty
    span inside the thing the reader is clicking.

    `--led` moves up from the anchor to the <li> so the pill — which is a
    sibling of the anchor, not a descendant — resolves the same channel colour.
    The anchor keeps it too, for the ::before rail and the number tint.
  */
  return (
    <li
      className={className}
      data-active={active || undefined}
      style={{ ['--led' as string]: channelColor(bookmark.category) }}
      onMouseEnter={handleEnter}
    >
      {/* The shared-layout pill container SharedLayoutBg injects here, as a
          sibling of the anchor rather than inside it. */}
      {children}

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
        // The <li> also carries --led, but the pill is a sibling of this
        // anchor and the rail is a pseudo-element of it — neither inherits from
        // the other, so both declare it.
        style={{ ['--led' as string]: channelColor(bookmark.category) }}
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
