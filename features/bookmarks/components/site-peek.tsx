'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PREVIEWABLE_HOSTS } from '../constants/previewable'
import { extractDomain } from '../utils/favicon'
import styles from '../library.module.css'

/** How long the pointer must rest on a row before the frame is mounted. */
const DWELL_MS = 350

/** The window the scaled page is seen through. */
const CARD_WIDTH = 320
const CARD_HEIGHT = 208
const GAP = 12

/**
 * The width the framed page is laid out at.
 *
 * An iframe is laid out at its own CSS width, so a 320px frame gets the
 * mobile layout of every site — the peek looked like a phone screenshot inside
 * a desktop-shaped box. The frame is therefore rendered at a real desktop
 * width and scaled down into the card, so the site lays out responsively for a
 * desktop and we shrink the result. The scale is derived from the card's width
 * at render time, so a card that gives up width to a narrow viewport scales
 * with it instead of cropping the previewed page.
 */
const PAGE_WIDTH = 1280

/** The card never grows, and on a narrow window it gives up width to the
 *  viewport rather than claiming 320px of it. The caller is gated on
 *  `(hover: hover)`, so this is the narrow-desktop-window case, not a phone. */
function cardWidth(): number {
  return Math.min(CARD_WIDTH, window.innerWidth - GAP * 2)
}

/**
 * The dock is a fixed capsule at the bottom of the viewport at the same
 * z-index, so a card centred on a low row would sit underneath it. Keep the
 * card clear of that band rather than stacking on the glass.
 */
const DOCK_CLEARANCE = 92

interface Position {
  left: number
  top: number
  width: number
}

/**
 * Anchors the card to the right of the row's title rather than to the row's
 * right edge: the row spans the full column, so its edge lands the card far
 * from the text the pointer is actually over.
 *
 * The card measures the viewport it is being placed in, so a window narrower
 * than the card plus its margins gets a narrower card rather than one pinned
 * to the edge and overlapping the row it describes.
 */
function placeBeside(rect: DOMRect): Position {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = cardWidth()

  let left = rect.left + width
  if (left + width > vw - GAP) {
    const flipped = rect.left - GAP - width
    left = flipped >= GAP ? flipped : Math.max(GAP, rect.left)
  }
  left = Math.min(Math.max(GAP, left), Math.max(GAP, vw - width - GAP))

  const centred = rect.top + rect.height / 2 - CARD_HEIGHT / 2
  const lowest = vh - DOCK_CLEARANCE - CARD_HEIGHT
  const top = Math.min(Math.max(GAP, centred), Math.max(GAP, lowest))

  return { left, top, width }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * A live peek of the linked site, shown while its row is hovered.
 *
 * The row is an anchor, so this is a sibling of it rather than a child — an
 * iframe nested inside the link would swallow the click the row exists to make.
 *
 * Only hosts in PREVIEWABLE_HOSTS are attempted. A site that refuses framing
 * loads a blank frame and raises no error event, so an unlisted host simply
 * keeps its favicon instead of an empty box.
 *
 * The frame mounts after a dwell and unmounts on leave, which is what keeps a
 * 550-row list cheap: nothing loads at rest, and sweeping the pointer down the
 * list creates at most one.
 */
export function SitePeek({
  url,
  anchorRef,
  hovered,
}: {
  url: string
  anchorRef: React.RefObject<HTMLElement | null>
  hovered: boolean
}) {
  const [position, setPosition] = useState<Position | null>(null)
  const [mounted, setMounted] = useState(false)
  const host = hostnameOf(url)
  const previewable = host !== null && PREVIEWABLE_HOSTS.has(host)

  // A dwell that has already elapsed must not be restarted by the scroll
  // handler firing on the very event that began the hover, so the open is
  // driven from the pointer state rather than from a refilled timer.
  const pointerInside = useRef(false)

  const open = useCallback(() => {
    const element = anchorRef.current
    if (element) setPosition(placeBeside(element.getBoundingClientRect()))
  }, [anchorRef])

  const close = useCallback(() => {
    setPosition(null)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    pointerInside.current = hovered
    if (!hovered) {
      close()
      return
    }
    if (!previewable) return

    // A pointer that lands without resting is a scroll, not an intent to peek.
    const timer = setTimeout(open, DWELL_MS)
    return () => clearTimeout(timer)
  }, [hovered, previewable, open, close])

  // Scrolling invalidates the measured rect. If the pointer is still resting on
  // the row, re-measure after the scroll settles rather than dropping the card,
  // so it follows the row instead of stranding it at a stale position.
  useEffect(() => {
    if (!position) return
    let frame = 0
    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (pointerInside.current) open()
        else close()
      })
    }
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [position, open, close])

  // A resize moves the row under the pointer without firing mouseenter.
  useEffect(() => {
    if (!position) return
    function onResize() {
      if (pointerInside.current) open()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [position, open])

  if (!position || !host || !mounted) return null

  // Portalled to the body on purpose. The list applies content-visibility to
  // each row, which is paint containment: an overlay left inside the <li> is
  // clipped to the row's own box and can never be seen.
  return createPortal(
    <div
      className={styles.peek}
      style={{ left: position.left, top: position.top, width: position.width }}
      aria-hidden="true"
    >
      <div className={styles.peekWindow}>
        <iframe
          className={styles.peekFrame}
          style={{
            width: PAGE_WIDTH,
            // Scale is derived from the width the card actually got, and the
            // height is the inverse: scale * height must still equal the card's
            // fixed 208px, or the preview either crops or letterboxes.
            height: (CARD_HEIGHT * PAGE_WIDTH) / position.width,
            transform: `scale(${position.width / PAGE_WIDTH})`,
          }}
          src={url}
          title={`Live preview of ${host}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <span className={styles.peekHost}>{extractDomain(url)}</span>
    </div>,
    document.body,
  )
}
