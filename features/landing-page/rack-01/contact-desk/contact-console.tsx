'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CHANNELS, nextChannel, typedSlice } from './contact-content'
import styles from './contact-desk.module.css'
import { useReveal } from './use-reveal'

/** Heights of the monitor's spectrum, fixed so the picture is the same twice. */
const SPECTRUM = Array.from({ length: 30 }, (_, i) =>
  Math.round(24 + 60 * Math.abs(Math.sin(i * 0.83) * Math.cos(i * 0.31))),
)

/**
 * The recall console: the old FAQ, rebuilt as a mixer.
 *
 * Each question is a channel strip, and selecting one plays its answer on the
 * monitor, typed out the way the controller's own LCD prints. It is a tabs
 * pattern underneath (one tablist, one panel, arrow keys, roving tabindex) so
 * it is exactly as operable by keyboard and screen reader as the accordion it
 * replaces: the panel carries the full answer as real text, and the typed copy
 * is `aria-hidden`, so a screen reader never hears half a sentence.
 */
export function ContactConsole() {
  const [active, setActive] = useState(0)
  const [reveal, revealState] = useReveal<HTMLElement>()
  const typed = useRef<HTMLSpanElement | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const channel = CHANNELS[active]

  // Type the answer. Written to a node, not to state, so sixty frames of
  // typing are sixty text writes and no renders. Reduced motion prints it whole.
  useEffect(() => {
    const node = typed.current
    if (!node) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) {
      node.textContent = channel.answer
      return
    }
    const duration = Math.min(1500, Math.max(520, channel.answer.length * 9))
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      node.textContent = typedSlice(channel.answer, t)
      if (t < 1) raf = requestAnimationFrame(frame)
    }
    node.textContent = ''
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [channel])

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = nextChannel(event.key, index, CHANNELS.length)
    if (next === null) return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section
      ref={reveal}
      data-reveal={revealState}
      className={`${styles.panel} ${styles.console}`}
      aria-labelledby={`${id}-title`}
    >
      <header className={styles.panelHead}>
        <div>
          <strong>AH / RECALL</strong>
          <span>Printed insert · five channels</span>
        </div>
        <h3 id={`${id}-title`}>Before you write</h3>
        <small>
          CH {String(active + 1).padStart(2, '0')}/
          {String(CHANNELS.length).padStart(2, '0')}
        </small>
      </header>

      <div className={styles.consoleBody}>
        <div
          role="tablist"
          aria-label="Questions"
          aria-orientation="vertical"
          className={styles.strips}
        >
          {CHANNELS.map((item, index) => (
            <button
              key={item.tag}
              ref={(node) => {
                tabs.current[index] = node
              }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`${id}-panel`}
              tabIndex={index === active ? 0 : -1}
              className={styles.strip}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className={styles.stripNum}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.stripTag}>{item.tag}</span>
              <span className={styles.stripMeter} aria-hidden="true">
                {[0, 1, 2, 3, 4].map((led) => (
                  <i
                    key={led}
                    style={{ '--led': led } as React.CSSProperties}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          className={styles.monitor}
        >
          <div className={styles.monitorTop} aria-hidden="true">
            <span>
              CH {String(active + 1).padStart(2, '0')} · {channel.tag}
            </span>
            <span className={styles.play}>PLAY</span>
          </div>
          <h4 className={styles.monitorQuestion}>{channel.question}</h4>
          {/* The whole answer, as text, for everything that is not looking at
              the typed copy. */}
          <p className={styles.srOnly}>{channel.answer}</p>
          <p className={styles.monitorAnswer} aria-hidden="true">
            <span ref={typed} />
            <span className={styles.caret} />
          </p>
          <div className={styles.spectrum} aria-hidden="true">
            {SPECTRUM.map((h, i) => (
              <i
                key={i}
                style={{ '--h': `${h}%`, '--i': i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
