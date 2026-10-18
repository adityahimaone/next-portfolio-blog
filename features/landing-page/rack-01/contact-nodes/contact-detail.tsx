'use client'

import { Fragment, useEffect, useId, useRef, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { FAQ_ITEMS, type FaqEntry } from '../contact-desk/contact-content'
import { ShapeMark } from './contact-wireframe'
import { TRACK_META, nodeNumber, type Shape } from './contact-orbit'
import styles from './contact-nodes.module.css'

export type StageOrigin = {
  top: number
  right: number
  bottom: number
  left: number
}

const SPRING = { stiffness: 190, damping: 26, mass: 0.7 }

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * One answer, opened out of the field.
 *
 * The overlay is portalled to `body` on purpose: `.contact` sets a
 * `perspective`, and a perspective ancestor becomes the containing block for
 * fixed children — without the portal the stage would be fixed to the section
 * rather than the viewport.
 *
 * The expansion is a clip-path from the clicked node's rectangle to the full
 * viewport. It reads as the node itself growing, not as a generic modal
 * fading in. Reduced motion gets a short opacity change instead.
 *
 * Focus moves to Close on mount, Tab is trapped inside the dialog, Escape
 * closes, and the rest of the page is made inert for the duration. The answer
 * is a polite live region so changing nodes from the orbital dock is
 * announced.
 */
export function ContactDetail({
  item,
  index,
  origin,
  onClose,
  onSelect,
  email,
}: {
  item: FaqEntry
  index: number
  origin: StageOrigin
  onClose: () => void
  onSelect: (index: number) => void
  email: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const titleId = `${uid}-question`
  const answerId = `${uid}-answer`
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion() ?? false
  const meta = TRACK_META[item.track]
  const shape: Shape = meta.shape

  const viewportWidth = typeof window === 'undefined' ? 1440 : window.innerWidth
  const viewportHeight =
    typeof window === 'undefined' ? 900 : window.innerHeight
  const closedClip = `inset(${clamp(origin.top, 0, viewportHeight)}px ${clamp(
    origin.right,
    0,
    viewportWidth,
  )}px ${clamp(origin.bottom, 0, viewportHeight)}px ${clamp(
    origin.left,
    0,
    viewportWidth,
  )}px round 999px)`

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const contact = document.getElementById('contact')
    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    contact?.setAttribute('inert', '')
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    const focusTimer = window.setTimeout(
      () => closeButton.current?.focus({ preventScroll: true }),
      20,
    )

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      contact?.removeAttribute('inert')
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      previous?.focus({ preventScroll: true })
    }
  }, [onClose])

  const pick = (next: number) => {
    if (next === index) return
    onSelect(next)
  }

  return (
    <motion.div
      id="faq-detail"
      ref={panel}
      className={styles.detail}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={answerId}
      style={
        {
          '--accent': meta.color,
          '--accent-ink': meta.ink,
        } as CSSProperties
      }
      initial={reduce ? { opacity: 0 } : { opacity: 0.9, clipPath: closedClip }}
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, clipPath: 'inset(0px 0px 0px 0px round 0px)' }
      }
      exit={reduce ? { opacity: 0 } : { opacity: 0.65, clipPath: closedClip }}
      transition={{
        duration: reduce ? 0.16 : 0.66,
        ease: reduce ? 'easeOut' : [0.16, 1, 0.3, 1],
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <header className={styles.detailTop}>
        <div className={styles.detailBrand}>
          <strong>AH / FAQ INDEX</strong>
          <span>
            Node {nodeNumber(index)} · {meta.label}
          </span>
        </div>

        <div className={styles.detailTopMeta} aria-hidden="true">
          {nodeNumber(index)} / {nodeNumber(FAQ_ITEMS.length - 1)}
        </div>

        <button
          ref={closeButton}
          type="button"
          className={styles.detailClose}
          aria-label="Close the answer"
          onClick={onClose}
        >
          <span className={styles.detailCloseText}>Close</span>
          <span className={styles.detailCloseIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      </header>

      <div className={styles.detailScroll}>
        <ShapeMark shape={shape} className={styles.stageMark} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className={styles.detailGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
          >
            <div className={styles.detailQuestion}>
              <p className={styles.detailTrack} style={{ color: meta.color }}>
                <i aria-hidden="true" />
                {meta.label} <span>/ orbit {meta.span}</span>
              </p>
              <h3 id={titleId} className={styles.detailTitle}>
                <MaskedWords text={item.question} variant="title" />
              </h3>
              <p className={styles.detailFoot}>
                Question {nodeNumber(index)} of{' '}
                {nodeNumber(FAQ_ITEMS.length - 1)}
              </p>
            </div>

            <div className={styles.detailAnswer}>
              <p className={styles.answerLabel}>
                <span aria-hidden="true">Answer</span>
                <i aria-hidden="true" />
              </p>
              <p id={answerId} className={styles.answerText} aria-live="polite">
                <MaskedWords text={item.answer} variant="answer" />
              </p>
              <a className={styles.detailMail} href={`mailto:${email}`}>
                Ask about this one
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className={styles.orbitDock} aria-label="All questions">
        <span className={styles.orbitLine} aria-hidden="true" />
        <div className={styles.dockTrack}>
          {FAQ_ITEMS.map((entry, entryIndex) => {
            const active = entryIndex === index
            const entryMeta = TRACK_META[entry.track]
            return (
              <button
                key={entry.id}
                type="button"
                className={styles.dockNode}
                data-active={active}
                aria-current={active ? 'true' : undefined}
                aria-label={`${nodeNumber(entryIndex)} ${entryMeta.label}: ${entry.question}`}
                style={
                  {
                    '--d': `${entryIndex % 2 === 0 ? 4 : -4}px`,
                    '--accent': entryMeta.color,
                    '--accent-ink': entryMeta.ink,
                  } as CSSProperties
                }
                onClick={() => pick(entryIndex)}
              >
                {active ? (
                  <motion.span
                    className={styles.dockActive}
                    layoutId="faq-dock-active"
                    transition={SPRING}
                  />
                ) : null}
                <span className={styles.dockIndex}>
                  {nodeNumber(entryIndex)}
                </span>
                <span className={styles.dockLabel}>{entryMeta.label}</span>
              </button>
            )
          })}
        </div>
        <span className={styles.dockHint}>Esc to close</span>
      </nav>
    </motion.div>
  )
}

/**
 * A sentence revealed as a row of masked words.
 *
 * Each word sits in an `overflow: hidden` box and rotates up from behind its
 * own baseline. The title gets a longer, slower cascade than the answer so the
 * eye lands on the question first. The space after each mask is a real text
 * node, which keeps wrapping and copy/paste natural.
 */
function MaskedWords({
  text,
  variant,
}: {
  text: string
  variant: 'title' | 'answer'
}) {
  const reduce = useReducedMotion() ?? false
  const words = text.split(/\s+/)
  const title = variant === 'title'

  return (
    <span className={title ? styles.titleWords : styles.answerWords}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={styles.wordMask}>
            <motion.span
              className={styles.word}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: '112%', rotateX: -74 }
              }
              animate={
                reduce ? { opacity: 1 } : { opacity: 1, y: '0%', rotateX: 0 }
              }
              transition={{
                duration: reduce ? 0.14 : title ? 0.82 : 0.56,
                delay: reduce ? 0 : index * (title ? 0.045 : 0.018),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
