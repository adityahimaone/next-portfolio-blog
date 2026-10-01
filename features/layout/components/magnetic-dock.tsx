'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { MoreHorizontal } from 'lucide-react'
import { NAV_ITEMS, isActiveNavItem } from '@/features/booth/nav-items'
import { useInterfaceVisibility } from '@/hooks/use-hide-interface'
import { useIsMobile } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

type DockItem = (typeof NAV_ITEMS)[number]

const DOCK_ROUTES = NAV_ITEMS.map((item) => item.href)

// The icon box is a fixed 44px, which is what the magnify springs from. On a
// narrow phone that stops fitting once the nav grew past six or seven items —
// at 320px, nine 44px icons spill 59px off both edges and the first and last
// become unreachable. The bar scales down below `sm` rather than clipping,
// because 44px is the tap-target floor for a primary control and this is a bar
// reached for between sections rather than the main way round the site.
const ICON_SIZE = 44
const COMPACT_ICON_SIZE = 34
const MAX_SCALE = 1.38
const MAGNETIC_DISTANCE = 130
const SPRING = { damping: 20, stiffness: 300, mass: 0.5 }

const MotionLink = motion.create(Link)

function isDockRoute(pathname: string) {
  return DOCK_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

/**
 * Routes the booth layout owns. Those render their own Dock, so the legacy
 * one stands down — otherwise two fixed glass bars composite in the same
 * corner of the viewport and each costs a backdrop-filter layer.
 */
const BOOTH_ROUTES = ['/projects', '/bookmarks', '/blog']

function isBoothRoute(pathname: string) {
  return BOOTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function MagneticDock() {
  const pathname = usePathname()
  const mouseX = useMotionValue(Infinity)
  const shouldReduceMotion = useReducedMotion()
  const interfaceVisibility = useInterfaceVisibility()
  const isMobile = useIsMobile()

  if (isBoothRoute(pathname)) return null
  if (!isDockRoute(pathname)) return null
  // The mixtape's stealth mode. Unmounts outright rather than fading, so the
  // dock's backdrop-filter layer is gone instead of sitting invisible over
  // the page still costing a compositing pass.
  if (interfaceVisibility === 'hidden') return null

  // A phone has no pointer to be near, so the magnify never fires there. The
  // dock still earns its place as a persistent route between sections, but it
  // drops to a static bar at the tap floor and the icons stop resizing.
  const magnify = !shouldReduceMotion && !isMobile

  // Nine 44px icons need 436px. A 320px viewport has 280px to give, so the
  // overflow is not a rounding error — the first and last items were rendering
  // off-screen and could not be tapped. Measured at 320/390/768px.
  //
  // Five fit inline; six including the More button is seven slots, which still
  // fits at 320px. Anything beyond that would push it over.
  const items = isMobile ? NAV_ITEMS.slice(0, MOBILE_ITEM_LIMIT) : NAV_ITEMS
  const overflow = isMobile ? NAV_ITEMS.slice(MOBILE_ITEM_LIMIT) : []

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:bottom-5">
      <nav
        aria-label="Quick navigation"
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          'dock-rise border-border bg-background/85 pointer-events-auto flex h-[52px] items-center gap-1 rounded-2xl border p-1',
          'shadow-[0_18px_45px_-22px_rgba(0,0,0,0.6)] backdrop-blur-xl',
          'md:h-14 md:items-end md:gap-1.5 md:p-1.5',
        )}
      >
        {items.map((item) => (
          <DockIcon
            key={item.href}
            {...item}
            mouseX={mouseX}
            magnify={magnify}
            isActive={isActiveNavItem(item.href, pathname)}
            compact={isMobile}
          />
        ))}
        {/* Everything the bar could not fit, behind one control rather than
            dropped. Hiding them outright was measured to be worse than the
            overflow it fixed: /about and /contact had no other link from the
            landing page at all, so capping the list made two pages unreachable
            on a phone. This keeps every destination one tap away. */}
        {overflow.length > 0 ? (
          <MoreMenu items={overflow} pathname={pathname} />
        ) : null}
      </nav>
    </div>
  )
}

type DockIconProps = DockItem & {
  mouseX: MotionValue<number>
  magnify: boolean
  isActive: boolean
  compact: boolean
}

/** How many items the dock shows inline when the viewport cannot fit all of them.
 *
 * At 320px there is room for six 44px icons with breathing room; nine needs
 * 26px each, which is below a usable tap target. The rest go into a `More`
 * menu, so the limit is about fitting, not about dropping routes.
 */
const MOBILE_ITEM_LIMIT = 5

function DockIcon({
  label,
  href,
  Icon,
  mouseX,
  magnify,
  isActive,
  compact,
}: DockIconProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseX, (value) => {
    const node = ref.current
    if (!node || value === Infinity) return MAGNETIC_DISTANCE + 1
    const bounds = node.getBoundingClientRect()
    return value - (bounds.left + bounds.width / 2)
  })

  const rawScale = useTransform(
    distance,
    [-MAGNETIC_DISTANCE, 0, MAGNETIC_DISTANCE],
    magnify ? [1, MAX_SCALE, 1] : [1, 1, 1],
  )
  const scale = useSpring(rawScale, SPRING)
  const base = compact ? COMPACT_ICON_SIZE : ICON_SIZE
  const size = useTransform(scale, (value) => value * base)
  const rawLift = useTransform(scale, (value) => (value - 1) * -10)
  const lift = useSpring(rawLift, SPRING)

  return (
    <MotionLink
      ref={ref}
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      style={{ width: size, height: size, y: lift }}
      whileTap={{ scale: 0.9 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="focus-visible:ring-ring focus-visible:ring-offset-background relative flex items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          'border-border bg-card relative flex size-full items-center justify-center overflow-hidden rounded-xl border',
          'shadow-[0_8px_20px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]',
          isActive && 'border-primary/60',
        )}
      >
        <Icon
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn(
            'relative size-[52%]',
            isActive ? 'text-primary' : 'text-foreground/75',
          )}
        />
        <span
          aria-hidden="true"
          className="from-foreground/15 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0.3 }}
        />
      </span>

      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-primary absolute -bottom-1.5 size-1.5 rounded-full"
          />
        )}
      </AnimatePresence>

      {/* The tooltip is a pointer affordance. On touch a tap fires focus, so it
          would flash above the dock on every navigation and linger over the
          section you just landed on. */}
      <AnimatePresence>
        {hovered && !compact && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.94, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 6, scale: 0.94, x: '-50%' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="border-border bg-popover text-popover-foreground pointer-events-none absolute -top-9 left-1/2 z-10 rounded-md border px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase shadow-lg"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </MotionLink>
  )
}

/**
 * The destinations the bar had no room for, behind one control.
 *
 * Dropping them was the wrong fix and measurement said so: `/about` and
 * `/contact` have no other link from the landing page, so capping the icon list
 * made two pages unreachable on a phone while looking, in a desktop screenshot,
 * like a tidy six-icon dock.
 *
 * State-driven rather than a `<details>` element so the menu can share the
 * dock's entrance animation. `aria-expanded` carries the open state, the items
 * are real links so they are keyboard-reachable, and the button closes the
 * menu on navigation because each one calls `setOpen(false)`.
 */
function MoreMenu({
  items,
  pathname,
}: {
  items: readonly DockItem[]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const anyActive = items.some((item) => isActiveNavItem(item.href, pathname))

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More destinations"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'border-border bg-card focus-visible:ring-ring focus-visible:ring-offset-background relative flex size-[44px] items-center justify-center rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          anyActive && 'border-primary/60',
        )}
      >
        <MoreHorizontal size={20} strokeWidth={1.75} aria-hidden="true" />
        {anyActive ? (
          <span
            aria-hidden="true"
            className="bg-primary absolute -bottom-1.5 size-1.5 rounded-full"
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="border-border bg-popover absolute right-0 bottom-[calc(100%+8px)] z-20 min-w-[168px] origin-bottom-right rounded-xl border p-1 shadow-lg"
          >
            {items.map((item) => {
              const active = isActiveNavItem(item.href, pathname)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
                      active ? 'text-primary' : 'text-popover-foreground',
                    )}
                  >
                    <item.Icon
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
