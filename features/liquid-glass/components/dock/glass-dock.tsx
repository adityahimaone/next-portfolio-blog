'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useAudioEngine } from '../../audio/engine'
import { useSpotlight } from '../../interactive/use-pointer'
import { scrollToSection } from '../../scroll/smooth-scroll'
import { Waveform } from '../audio/waveform'

type Section = 'index' | 'works' | 'notes'

const NAV: Array<{ id: Section; label: string; hash: string }> = [
  { id: 'index', label: 'Index', hash: '#index' },
  { id: 'works', label: 'Works', hash: '#works' },
  { id: 'notes', label: 'Notes', hash: '#notes' },
]

/**
 * The persistent dock: navigation and transport in one pane.
 *
 * It is mounted in the root layout, so this button is the same button — playing
 * state included — on the hero, in the shelf, and inside a note. On the hero it
 * floats centred and full; past the first screen it contracts into the corner
 * so the reading column owns the width.
 */
export function GlassDock() {
  const pathname = usePathname()
  const isReader = pathname.startsWith('/notes')
  const {
    isPlaying,
    isMuted,
    track,
    toggle,
    toggleMute,
    next,
    currentTime,
    duration,
  } = useAudioEngine()

  const [compact, setCompact] = useState(false)
  const [section, setSection] = useState<Section>('index')
  // On a note the movement is known from the route rather than observed.
  const active: Section = isReader ? 'notes' : section
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  })

  const glassRef = useSpotlight<HTMLDivElement>()
  const navRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Contract past the hero.
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      setCompact(window.scrollY > 160)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Which movement is on screen. The dock answers "where am I" before the
  // visitor has to scroll back to find out.
  useEffect(() => {
    if (isReader) return

    const targets = NAV.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    )
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const found = NAV.find((item) => item.id === visible.target.id)
        if (found) setSection(found.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6] },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [isReader, pathname])

  // Travelling highlight behind the active item.
  useLayoutEffect(() => {
    const measure = () => {
      const element = itemRefs.current[active]
      if (!element || !navRef.current) {
        setIndicator((current) => ({ ...current, visible: false }))
        return
      }
      const navRect = navRef.current.getBoundingClientRect()
      const rect = element.getBoundingClientRect()
      setIndicator({
        left: rect.left - navRect.left,
        width: rect.width,
        visible: true,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (navRef.current) observer.observe(navRef.current)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [active])

  const onNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof NAV)[number],
  ) => {
    if (pathname !== '/') return // let Next handle the cross-route jump
    event.preventDefault()
    scrollToSection(item.hash)
  }

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0

  return (
    <>
      {/* A scrim behind the pill. Without it, a floating dock over a column of
          prose is a legibility problem rather than a design choice. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-24 bg-gradient-to-t from-[#050506]/90 via-[#050506]/45 to-transparent"
      />
      <nav
        ref={glassRef}
        className="lg-glass lg-glass--heavy lg-dock"
        data-compact={compact}
        aria-label="Primary"
      >
        <div ref={navRef} className="lg-dock__nav relative flex items-center">
          <span
            className="lg-dock__indicator"
            aria-hidden="true"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
              opacity: indicator.visible ? 1 : 0,
            }}
          />
          {NAV.map((item) => (
            <Link
              key={item.id}
              ref={(element) => {
                itemRefs.current[item.id] = element
              }}
              href={item.hash}
              onClick={(event) => onNavClick(event, item)}
              className="lg-pill-link"
              data-active={active === item.id}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <span className="lg-dock__divider" aria-hidden="true" />

        <button
          type="button"
          onClick={() => void toggle()}
          className="lg-play h-[38px] w-[38px] shrink-0"
          data-playing={isPlaying}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={12} strokeWidth={2} fill="currentColor" />
          ) : (
            <Play
              size={11}
              strokeWidth={2}
              fill="currentColor"
              className="-ml-[1px]"
            />
          )}
        </button>

        <div className="hidden items-center gap-2 pl-1 sm:flex">
          <Waveform bars={22} height={18} barWidth={2} gap={2} />
          <button
            type="button"
            onClick={next}
            className="lg-dock__track text-left text-[11px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-70"
            aria-label={`Now playing ${track.title}. Play next track.`}
            title={track.title}
          >
            {track.title}
          </button>
        </div>

        <button
          type="button"
          onClick={next}
          className="flex h-[34px] w-[30px] items-center justify-center text-[var(--lg-ink-faint)] transition-colors hover:text-[var(--lg-ink)] sm:hidden"
          aria-label="Next track"
        >
          <SkipForward size={13} />
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[var(--lg-ink-faint)] transition-colors hover:text-[var(--lg-ink)]"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          aria-pressed={isMuted}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* The scrubber. Hidden at zero rather than clamped to a visible
            minimum: a 2%-wide dash under a pill reads as a rendering artefact,
            not as a progress indicator. */}
        <span
          className="absolute inset-x-4 bottom-[3px] h-[2px] origin-left rounded-full bg-gradient-to-r from-[var(--lg-cyan)] via-white/60 to-[var(--lg-amber)] transition-[transform,opacity] duration-500"
          style={{
            transform: `scaleX(${progress})`,
            opacity: progress > 0.004 ? 0.9 : 0,
          }}
          aria-hidden="true"
        />
      </nav>
    </>
  )
}
