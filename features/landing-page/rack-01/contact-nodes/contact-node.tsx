'use client'

import { useRef, type CSSProperties } from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react'

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
 * One question, floating.
 *
 * The node is deliberately three elements deep:
 *
 *   `.cell`      the grid slot and the static organic offset;
 *   `.magnetic`  the spring-driven pointer response;
 *   `.levitate`  the slow sine drift, running as a CSS animation.
 *
 * Keeping them apart is what lets the idle drift keep its own timing while the
 * magnetic field retargets from wherever the drift left it. The pointer work
 * never touches React state: nine nodes read one pair of motion values and
 * write their own transforms.
 */
export function ContactNode({
  item,
  index,
  pointerX,
  pointerY,
  active,
  muted,
  controlId,
  onOpen,
}: {
  item: FaqEntry
  index: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  active: boolean
  muted: boolean
  controlId: string
  onOpen: (index: number, node: HTMLElement) => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  const meta = TRACK_META[item.track]

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

      // Inside the inner ring the node leans toward the cursor. In the ring
      // between the two radii its neighbours lean away, which is what turns a
      // hover into a local disturbance rather than a single moving pill.
      const strength =
        distance < PULL_RADIUS
          ? (1 - distance / PULL_RADIUS) * 0.16
          : -(1 - (distance - PULL_RADIUS) / (REPEL_RADIUS - PULL_RADIUS)) *
            0.05

      return {
        x: dx * strength,
        y: dy * strength,
        rotateX: clamp((dy / window.innerHeight) * -9, -4.5, 4.5),
        rotateY: clamp((dx / window.innerWidth) * 12, -6, 6),
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

  // The full string, rather than Motion's x/y shorthands: a composed transform
  // stays on the compositor while the page is loading.
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
          '--dur': `${7.6 + (index % 5) * 1.35}s`,
        } as CSSProperties
      }
    >
      <motion.div className={styles.magnetic} style={{ transform }}>
        <span className={styles.levitate}>
          <button
            ref={button}
            type="button"
            className={styles.node}
            aria-expanded={active}
            aria-controls={controlId}
            onClick={(event) => onOpen(index, event.currentTarget)}
          >
            <span className={styles.nodeCore}>
              <span className={styles.nodeIndex} aria-hidden="true">
                {nodeNumber(index)}
              </span>
              <span className={styles.nodeText}>{item.question}</span>
              <span className={styles.nodeArrow} aria-hidden="true">
                ↗
              </span>
            </span>
          </button>
        </span>
      </motion.div>
    </div>
  )
}
