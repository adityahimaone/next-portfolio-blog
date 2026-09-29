'use client'

import { useRef, type RefObject } from 'react'
import { useSpring, useTransform, type MotionValue } from 'motion/react'

/** Shared magnify constants, so nav icons and slot items move identically. */
export const DOCK_ICON_SIZE = 44
export const DOCK_MAX_SCALE = 1.38
export const DOCK_MAGNETIC_DISTANCE = 130
export const DOCK_SPRING = { damping: 20, stiffness: 300, mass: 0.5 }

export type DockMagnify = {
  /** 1 at rest, DOCK_MAX_SCALE directly under the pointer. */
  scale: MotionValue<number>
  /**
   * Height for a fixed-size item: the icon square. Only meaningful for items
   * that are square to begin with.
   */
  size: MotionValue<number>
  /** Vertical lift, so growth reads as rising rather than stretching. */
  lift: MotionValue<number>
  /**
   * A uniform scale for a slot item, applied as a transform so it never
   * reflows its siblings.
   *
   * Deliberately a multiplier and not an absolute `scale * DOCK_ICON_SIZE`: a
   * slot item may be a 44px round button or a text readout whose width depends
   * on its content, so an absolute value clamps both to the same size and
   * truncates any label wider than 44px. Scaling the element's own box lets
   * the magnify apply to whatever the item already measures.
   */
  itemTransform: MotionValue<string>
}

/**
 * Magnetic magnify for one dock item, driven by the dock's shared pointer
 * position.
 *
 * The item scales toward the pointer and lifts as it grows, so the capsule
 * reads as one object deforming rather than a row of independently bouncing
 * buttons. `ref` must point at the item itself: its box is what defines the
 * distance from the pointer.
 */
export function useDockMagnify(
  ref: RefObject<HTMLElement | null>,
  mouseX: MotionValue<number>,
  magnify: boolean,
): DockMagnify {
  const distance = useTransform(mouseX, (value) => {
    const node = ref.current
    if (!node || value === Infinity) return DOCK_MAGNETIC_DISTANCE + 1
    const bounds = node.getBoundingClientRect()
    return value - (bounds.left + bounds.width / 2)
  })

  const rawScale = useTransform(
    distance,
    [-DOCK_MAGNETIC_DISTANCE, 0, DOCK_MAGNETIC_DISTANCE],
    magnify ? [1, DOCK_MAX_SCALE, 1] : [1, 1, 1],
  )
  const scale = useSpring(rawScale, DOCK_SPRING)
  const size = useTransform(scale, (value: number) => value * DOCK_ICON_SIZE)
  const rawLift = useTransform(scale, (value: number) => (value - 1) * -10)
  const lift = useSpring(rawLift, DOCK_SPRING)
  const itemTransform = useTransform(
    scale,
    (value: number) => `scale(${value})`,
  )

  return { scale, size, lift, itemTransform }
}

export function useDockItemRef<T extends HTMLElement = HTMLDivElement>() {
  return useRef<T>(null)
}
