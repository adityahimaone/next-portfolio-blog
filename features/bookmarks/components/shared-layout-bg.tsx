'use client'

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import styles from './shared-layout-bg.module.css'

type ItemProps = {
  className?: string
  onMouseEnter?: () => void
  children?: ReactNode
}

type SharedLayoutBgProps = {
  children: ReactNode
  /** Semantic container used for the children. */
  as?: 'div' | 'ul'
  /** Class applied to the moving pill. Defaults to a subtle ink tint. */
  pillClassName?: string
  /** Horizontal inset of the pill relative to each row (px). Default 20. */
  inset?: number
  /** Optional positioning override for the pill wrapper inside each item. */
  pillContainerClassName?: string
  className?: string
  /**
   * Turns the effect off: no pill is rendered and no item is instrumented.
   *
   * This exists for touch, not as a general opt-out. `:hover` sticks to an
   * element after the first tap, so a pill on a touch device stays lit over one
   * row while the reader scrolls the rest of the list past it.
   */
  disabled?: boolean
  /**
   * The blur as the pill enters and leaves. Default true.
   *
   * Costs a re-sample of everything painted behind the pill inside the same
   * backdrop root, every frame the pill moves. Turn it off where the pill is
   * large or sits beside a blurred panel — see the note above the variants.
   */
  blur?: boolean
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void
}

/**
 * A pill that glides between hovered items using motion's shared layout, with a
 * blur as it enters and leaves.
 *
 * Adapted from beui.dev's `shared-layout-bg` (MIT). Three changes were needed to
 * land it in this repo: the pill is styled with a CSS module rather than
 * Tailwind, because every booth feature is built on the design tokens in
 * `app/globals.css`; the pill inherits the item's `--led` custom property, so it
 * carries the row's own channel colour instead of a fixed tint; and the injected
 * handlers are cached per item, which is what keeps `memo` holding on the
 * memoized bookmark rows.
 *
 * `layoutRoot` on the container scopes the pill's layout projection to this
 * list. Without it the fixed or scrolled ancestors above the list smear their
 * scroll offset into the pill's movement and it drifts off the row.
 */
export const SharedLayoutBg = forwardRef(function SharedLayoutBg(
  {
    children,
    as = 'div',
    className,
    onMouseLeave,
    pillClassName,
    pillContainerClassName,
    inset = 20,
    disabled = false,
    blur = true,
    ...props
  }: SharedLayoutBgProps,
  forwardedRef,
) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const uid = useId()
  const reduce = useReducedMotion()

  /*
    One hover handler per item, built once and kept for the life of the list.

    The obvious version — a fresh arrow closure per item per render — hands every
    item a new `onMouseEnter` on every pointer move, and a memoized child compares
    its props by identity, so a single hover would re-render all 60 rows of a
    loaded page. Caching the closures is what makes moving the pill cost the
    list's own re-render rather than 60 rows' worth of work.
  */
  const handlers = useRef(new Map<string, () => void>())
  const enterFor = useCallback((childKey: string, original?: () => void) => {
    const cached = handlers.current.get(childKey)
    if (cached) return cached
    const next = () => {
      original?.()
      setActiveId(childKey)
    }
    handlers.current.set(childKey, next)
    return next
  }, [])

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLDivElement | HTMLUListElement>) => {
      setActiveId(null)
      onMouseLeave?.(event as MouseEvent<HTMLDivElement>)
    },
    [onMouseLeave],
  )

  /*
    The blur enter/exit, opt-in per call site.

    A `filter` on the pill does not stay inside the pill. A gaussian blur
    samples everything painted behind it inside the same backdrop root, and it is
    re-evaluated on every frame the filter is non-none — which here is the whole
    time the pill is moving. Measured on the bookmark row list, where the pill is
    920x44 beside the sidebar's blur(18px) glass, animating blur(6px) cost 24
    dropped frames per sweep against 15 without it; the same sweep with the
    sidebar's blur cleared instead went to 3, which is the same cost seen from
    the other side.

    So the trade is per call site, not per component:
      - the playlist sidebar's pill is 218x44, a quarter the area, and glides
        inside a panel with no animated filter near it. It keeps the blur and
        still measures 2 dropped frames.
      - the bookmark rows pass blur={false}.

    Reduced motion drops the blur regardless, as before.
  */
  const withBlur = !reduce && blur
  const variants = withBlur
    ? {
        initial: { opacity: 0, filter: 'blur(6px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(6px)' },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }

  // One pass, not two. The original walked the children once to stamp the hover
  // handler and again to inject the pill; on a paginated list that is two full
  // traversals of every row on each pointer move.
  const items = Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => {
      const el = child as ReactElement<ItemProps>
      const childKey = el.key ? String(el.key) : `item-${index}`
      const isActive = !disabled && activeId === childKey

      return cloneElement(el, {
        key: childKey,
        className: cn(styles.item, el.props.className),
        onMouseEnter: disabled
          ? el.props.onMouseEnter
          : enterFor(childKey, el.props.onMouseEnter),
        children: (
          <>
            <span className={cn(styles.pillContainer, pillContainerClassName)}>
              <AnimatePresence>
                {isActive ? (
                  <motion.span
                    aria-hidden="true"
                    className={cn(styles.pill, pillClassName)}
                    layoutId={`shared-layout-bg-${uid}`}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 32 }
                    }
                    style={{ left: -inset, right: -inset }}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0 }}
                  />
                ) : null}
              </AnimatePresence>
            </span>
            {el.props.children}
          </>
        ),
      })
    })

  /*
    The pill lives inside the active item rather than beside the list. As a
    sibling it would be positioned against the container and would have to know
    every item's offset; inside the item it measures the row it is actually
    over, which is the box motion animates between.

    The two branches are kept rather than collapsed into a `Tag` variable: a
    polymorphic element makes the ref an intersection of both element types,
    which no caller can satisfy. Neither call site passes a ref today.
  */
  return as === 'ul' ? (
    <motion.ul
      {...(props as ComponentProps<typeof motion.ul>)}
      ref={forwardedRef as Ref<HTMLUListElement>}
      layoutRoot
      onMouseLeave={handleMouseLeave}
      className={cn(styles.list, className)}
    >
      {items}
    </motion.ul>
  ) : (
    <motion.div
      {...(props as ComponentProps<typeof motion.div>)}
      ref={forwardedRef as Ref<HTMLDivElement>}
      layoutRoot
      onMouseLeave={handleMouseLeave}
      className={cn(styles.list, className)}
    >
      {items}
    </motion.div>
  )
})
