'use client'

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react'
import { useDockSlotValue } from './dock-slot'
import { useDockMagnify, useDockItemRef } from './dock-magnify'
import { useRefraction } from './hooks'
import { NAV_ITEMS, isActiveNavItem } from './nav-items'
import styles from './dock.module.css'

const MotionLink = motion.create(Link)

/**
 * The one persistent glass surface. Destinations never disappear: the current
 * page's transport grows in beside them, so the control layer changes shape
 * instead of swapping.
 *
 * Nav icons and slot items share one magnify field, so the whole capsule
 * deforms as one object when the pointer travels across it.
 */
export function Dock() {
  const pathname = usePathname()
  const slot = useDockSlotValue()
  const refract = useRefraction()
  const navRef = useRef<HTMLElement>(null)
  const raf = useRef(0)
  const mouseX = useMotionValue(Infinity)
  const shouldReduceMotion = useReducedMotion()

  // One rAF handler drives both the pointer-following specular and the
  // magnetic position, so the two never disagree on where the pointer is.
  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const el = navRef.current
    if (!el) return
    mouseX.set(event.clientX)
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      el.style.setProperty('--my', `${event.clientY - rect.top}px`)
    })
  }

  function onPointerLeave() {
    mouseX.set(Infinity)
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const magnify = !shouldReduceMotion

  return (
    <LayoutGroup>
      <nav
        ref={navRef}
        aria-label="Primary"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={`${styles.dock} glass dock-rise ${refract ? styles.refract : ''}`}
      >
        <ul className={styles.items}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <DockIcon
                {...item}
                mouseX={mouseX}
                magnify={magnify}
                isActive={isActiveNavItem(item.href, pathname)}
              />
            </li>
          ))}
        </ul>

        {slot && (
          <motion.div
            layout
            className={styles.slot}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <span className={styles.slotRule} aria-hidden="true" />
            <SlotMagnifier mouseX={mouseX} magnify={magnify}>
              {slot}
            </SlotMagnifier>
          </motion.div>
        )}
      </nav>
    </LayoutGroup>
  )
}

type DockIconProps = {
  label: string
  href: string
  Icon: (typeof NAV_ITEMS)[number]['Icon']
  mouseX: MotionValue<number>
  magnify: boolean
  isActive: boolean
}

function DockIcon({
  label,
  href,
  Icon,
  mouseX,
  magnify,
  isActive,
}: DockIconProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)
  const { size, lift } = useDockMagnify(ref, mouseX, magnify)

  return (
    <MotionLink
      ref={ref}
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      style={{ width: size, height: size, y: lift }}
      whileTap={{ scale: 0.9 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={styles.link}
      data-active={isActive || undefined}
    >
      <span className={styles.chip} data-active={isActive || undefined}>
        <Icon
          aria-hidden="true"
          strokeWidth={1.75}
          className={styles.chipIcon}
          size={22}
        />
        {/* Inner sheen, the same gradient wash the magnetic dock uses. */}
        <span className={styles.chipSheen} data-hovered={hovered} />
      </span>

      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={styles.activePip}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.94, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 6, scale: 0.94, x: '-50%' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={styles.tip}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </MotionLink>
  )
}

/**
 * Applies the same magnify to each of a page's transport items, so they sit in
 * the same field as the nav icons.
 *
 * Pages register their transport as a single wrapper element holding several
 * controls, so the children are unwrapped one level: the magnify measures each
 * item's own box against the pointer, and a single wrapper around the whole
 * transport would make the cluster scale as one unit with no per-item lift.
 * The page keeps ownership of its markup and its layout classes; only the
 * transform is layered on top.
 */
function SlotMagnifier({
  children,
  mouseX,
  magnify,
}: {
  children: ReactNode
  mouseX: MotionValue<number>
  magnify: boolean
}) {
  return (
    <>
      {Children.map(children, (child) => {
        if (
          !isValidElement<{ className?: string; children?: ReactNode }>(child)
        ) {
          return child
        }
        const grandChildren = Children.toArray(child.props.children)
        // A single child (e.g. the blog's plain text readout) has nothing to
        // magnify individually, so it is passed through untouched.
        if (grandChildren.length <= 1) return child

        return (
          <motion.div
            key={child.key}
            className={`${styles.slotGroup} ${String(child.props.className ?? '')}`}
            layout
          >
            {grandChildren.map((item) =>
              isValidElement(item) ? (
                <SlotItem key={item.key} mouseX={mouseX} magnify={magnify}>
                  {item}
                </SlotItem>
              ) : (
                item
              ),
            )}
          </motion.div>
        )
      })}
    </>
  )
}

/** One transport item, magnified against the shared pointer position. */
function SlotItem({
  children,
  mouseX,
  magnify,
}: {
  children: ReactNode
  mouseX: MotionValue<number>
  magnify: boolean
}) {
  const ref = useDockItemRef()
  const { lift, itemTransform } = useDockMagnify(ref, mouseX, magnify)

  return (
    <motion.div
      ref={ref}
      className={styles.slotItem}
      style={{ y: lift, transform: itemTransform }}
    >
      {/* Transformed, not resized. A width value here would force every slot
          item to `scale * 44px`, which truncates any readout wider than the
          icon square; a transform scales whatever the item already measures
          and never reflows its siblings. */}
      {children}
    </motion.div>
  )
}
