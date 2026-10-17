'use client'

import { useEffect, useRef } from 'react'
import styles from './contact-desk.module.css'

/**
 * The channel's three status lamps, as the strip along the top of the section:
 * the line is open, replies are measured in days, and what time it is where the
 * replies come from.
 *
 * The clock is written to the DOM on a timer rather than held in state, so a
 * tick never re-renders anything, and the server renders a placeholder so
 * hydration has nothing to disagree about.
 */
export function ContactStatus({
  timeZone = 'Asia/Jakarta',
  place = 'Jakarta',
}: {
  timeZone?: string
  place?: string
}) {
  const clock = useRef<HTMLTimeElement | null>(null)

  useEffect(() => {
    const node = clock.current
    if (!node) return
    let format: Intl.DateTimeFormat
    try {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return
    }
    const tick = () => {
      node.textContent = format.format(new Date())
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return (
    <ul className={styles.status} aria-label="Channel status">
      <li>
        <i className={styles.lamp} aria-hidden="true" />
        <span>Channel</span>
        <b>Open</b>
      </li>
      <li>
        <span>Reply</span>
        <b>~2 days</b>
      </li>
      <li>
        <span>{place}</span>
        <b>
          <time ref={clock}>--:--:--</time>
        </b>
      </li>
    </ul>
  )
}
