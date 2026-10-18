'use client'

import { Fragment, useRef, type CSSProperties } from 'react'
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'

import type { FaqEntry } from '../contact-desk/contact-content'
import { TRACK_META, nodeNumber } from './contact-orbit'
import styles from './contact-nodes.module.css'

const FIELD_SPRING = { stiffness: 170, damping: 24, mass: 0.55 }

/** Pointer field, in CSS pixels. Outside this radius a node is at rest. */
const PULL_RADIUS = 300
const REPEL_RADIUS = 430

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

type Field = {
  x: number
  y: number
  rotateX: number
  rotateY: number
}

const REST: Field = { x: 0, y: 0, rotateX: 0, rotateY: 0 }

/**
 * One question, floating — and expanding in place.
 *
 * `.cell` is the grid slot, `.magnetic` the spring response, `.levitate` the
 * idle sine drift, and `.frame` the pill shell that opens into a card. The
 * answer is a sibling of the trigger button, never nested inside it, so the
 * question is a real disclosure button and the mail link inside the answer
 * stays independently focusable.
 *
 * The pointer field never touches React state: nine nodes read one pair of
 * motion values and write their own transforms.
 */
export function ContactNode({
  item,
  index,
  pointerX,
  pointerY,
  active,
  muted,
  reduced,
  triggerId,
  panelId,
  email,
  onToggle,
}: {
  item: FaqEntry
  index: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  active: boolean
  muted: boolean
  reduced: boolean
  triggerId: string
  panelId: string
  email: string
  onToggle: (index: number) => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  const meta = TRACK_META[item.track]
  const labelId = `${triggerId}-label`

  // One measurement per pointer update, shared by the four springs below.
  const field = useTransform<number, Field>(
    [pointerX, pointerY],
    ([rawX, rawY]): Field => {
      const node = button.current
      if (!node || !Number.isFinite(rawX) || !Number.isFinite(rawY)) {
        return REST
      }

      const box = node.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const dx = rawX - cx
      const dy = rawY - cy
      const distance = Math.hypot(dx, dy)

      if (distance > REPEL_RADIUS) return REST

      const strength =
        distance < PULL_RADIUS
          ? (1 - distance / PULL_RADIUS) * 0.14
          : -(1 - (distance - PULL_RADIUS) / (REPEL_RADIUS - PULL_RADIUS)) *
            0.045

      return {
        x: dx * strength,
        y: dy * strength,
        rotateX: clamp((dy / window.innerHeight) * -7, -3.5, 3.5),
        rotateY: clamp((dx / window.innerWidth) * 9, -4.5, 4.5),
      }
    },
  )

  const x = useSpring(
    useTransform(field, (value) => value.x),
    FIELD_SPRING,
  )
  const y = useSpring(
    useTransform(field, (value) => value.y),
    FIELD_SPRING,
  )
  const rotateX = useSpring(
    useTransform(field, (value) => value.rotateX),
    FIELD_SPRING,
  )
  const rotateY = useSpring(
    useTransform(field, (value) => value.rotateY),
    FIELD_SPRING,
  )

  const transform = useTransform<number, string>(
    [x, y, rotateX, rotateY],
    ([moveX, moveY, tiltX, tiltY]) =>
      `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`,
  )

  return (
    <div
      className={styles.cell}
      data-index={index}
      data-muted={muted}
      data-active={active}
      style={
        {
          '--accent': meta.color,
          '--accent-ink': meta.ink,
          '--i': index,
          '--dur': `${7.8 + (index % 5) * 1.3}s`,
        } as CSSProperties
      }
    >
      <motion.div className={styles.magnetic} style={{ transform }}>
        <span className={styles.levitate}>
          <div className={styles.frame} data-active={active}>
            <div className={styles.card}>
              <button
                ref={button}
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => onToggle(index)}
              >
                <span className={styles.triggerMeta}>
                  <span className={styles.nodeIndex} aria-hidden="true">
                    {nodeNumber(index)}
                  </span>
                  <span className={styles.nodeTrack} aria-hidden="true">
                    {meta.label}
                  </span>
                </span>

                <span id={labelId} className={styles.nodeText}>
                  {item.question}
                </span>

                <span className={styles.nodeToggle} aria-hidden="true">
                  <span className={styles.arrowOpen}>↗</span>
                  <span className={styles.arrowClose}>×</span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {active ? (
                  <motion.div
                    key="answer"
                    id={panelId}
                    className={styles.answerPanel}
                    role="region"
                    aria-labelledby={labelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.01 }
                        : {
                            height: {
                              duration: 0.44,
                              ease: [0.16, 1, 0.3, 1],
                            },
                            opacity: { duration: 0.24, ease: 'easeOut' },
                          }
                    }
                  >
                    <div className={styles.answerBody}>
                      <p className={styles.answerLabel}>
                        <span>Answer</span>
                        <i aria-hidden="true" />
                      </p>
                      <p className={styles.answerText} aria-live="polite">
                        <MaskedWords text={item.answer} reduced={reduced} />
                      </p>
                      <a className={styles.answerMail} href={`mailto:${email}`}>
                        Ask about this one
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </span>
      </motion.div>
    </div>
  )
}

/**
 * The answer's masked word cascade. The panel only mounts when its pill opens,
 * so the hidden start state is safe: the stagger runs on the interaction and
 * never on page load.
 */
function MaskedWords({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(/\s+/)

  return (
    <span className={styles.answerWords}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={styles.wordMask}>
            <motion.span
              className={styles.word}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: '112%', rotateX: -74 }
              }
              animate={
                reduced ? { opacity: 1 } : { opacity: 1, y: '0%', rotateX: 0 }
              }
              transition={{
                duration: reduced ? 0.14 : 0.52,
                delay: reduced ? 0 : index * 0.014,
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
