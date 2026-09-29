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
import { NAV_ITEMS, isActiveNavItem } from '@/components/booth/nav-items'
import { useInterfaceVisibility } from '@/hooks/use-hide-interface'
import { cn } from '@/lib/utils'

type DockItem = (typeof NAV_ITEMS)[number]

const DOCK_ROUTES = NAV_ITEMS.map((item) => item.href)

const ICON_SIZE = 44
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

  if (isBoothRoute(pathname)) return null
  if (!isDockRoute(pathname)) return null
  // The mixtape's stealth mode. Unmounts outright rather than fading, so the
  // dock's backdrop-filter layer is gone instead of sitting invisible over
  // the page still costing a compositing pass.
  if (interfaceVisibility === 'hidden') return null

  const active = !shouldReduceMotion

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <nav
        aria-label="Quick navigation"
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          'dock-rise border-border bg-background/85 pointer-events-auto flex h-14 items-end gap-1.5 rounded-2xl border p-1.5',
          'shadow-[0_18px_45px_-22px_rgba(0,0,0,0.6)] backdrop-blur-xl',
        )}
      >
        {NAV_ITEMS.map((item) => (
          <DockIcon
            key={item.href}
            {...item}
            mouseX={mouseX}
            magnify={active}
            isActive={isActiveNavItem(item.href, pathname)}
          />
        ))}
      </nav>
    </div>
  )
}

type DockIconProps = DockItem & {
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
  const size = useTransform(scale, (value) => value * ICON_SIZE)
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

      <AnimatePresence>
        {hovered && (
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
