'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { ArrowDownRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'

import { useAudio } from '../spotify/audio-context'
import { HERO_READOUT } from './studio-data'
import styles from './studio.module.css'

const SignalScene = dynamic(() => import('./signal-scene'), {
  ssr: false,
  loading: () => <div className={styles.sceneSkeleton} aria-hidden="true" />,
})

/** A clock, seeded empty so the server and client paint the same string. */
function useLocalClock() {
  const [clock, setClock] = useState('--:--')

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    tick()
    const timer = window.setInterval(tick, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return clock
}

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={styles.navButton}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light studio' : 'Switch to dark studio'}
      title={dark ? 'Light studio' : 'Dark studio'}
    >
      <span className={styles.themeGlyph} data-dark={dark} aria-hidden="true">
        <i />
      </span>
    </button>
  )
}

function SoundSwitch() {
  const { isPlaying, togglePlay } = useAudio()

  return (
    <button
      type="button"
      className={styles.soundSwitch}
      onClick={togglePlay}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Pause the site mix' : 'Play the site mix'}
    >
      {isPlaying ? (
        <Volume2 size={14} strokeWidth={1.6} aria-hidden="true" />
      ) : (
        <VolumeX size={14} strokeWidth={1.6} aria-hidden="true" />
      )}
      <span className={styles.soundBars} data-on={isPlaying} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{isPlaying ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}

function StudioNav({ clock }: { clock: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className={styles.nav} data-studio-nav>
      <a className={styles.brand} href="#top" aria-label="Aditya Himawan, top">
        <span className={styles.brandMark} aria-hidden="true">
          <i />
        </span>
        <span className={styles.brandName}>Aditya Himawan</span>
        <span className={styles.brandRole}>Frontend engineer</span>
      </a>

      <nav className={styles.navLinks} aria-label="Sections">
        {[
          ['Index', '#index'],
          ['Practice', '#practice'],
          ['Record', '#record'],
          ['Work', '#work'],
          ['Contact', '#contact'],
        ].map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>

      <div className={styles.navTools}>
        <SoundSwitch />
        <ThemeSwitch />
        <time className={styles.navClock} aria-label="Your local time">
          {clock}
        </time>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="studio-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div id="studio-menu" className={styles.mobileMenu}>
          <nav aria-label="Sections, mobile">
            {[
              ['Index', '#index'],
              ['Practice', '#practice'],
              ['Record', '#record'],
              ['Work', '#work'],
              ['Contact', '#contact'],
            ].map(([label, href], index) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${90 + index * 55}ms` }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </nav>
          <p>Jakarta, Indonesia. Open for selected work.</p>
        </div>
      ) : null}
    </header>
  )
}

/**
 * The hero is the anchor point for the rest of the page.
 *
 * Everything below it inherits one of three things from this frame: the warm
 * paper ground, the signal orange, or the vertical rail at the left edge that
 * begins as the line dropping out of the ring. The ring is not a backdrop; it
 * is the object the page is built around, and the SVG patch under it is the
 * literal join between the 3D and the flat sections.
 */
export function SignalHero() {
  const { isPlaying, togglePlay } = useAudio()
  const clock = useLocalClock()
  const heroRef = useRef<HTMLElement>(null)
  const objectRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [patch, setPatch] = useState(
    'M 720 470 C 720 660 180 700 56 820 L 56 900',
  )

  // The patch is measured, not drawn in percentage coordinates. The hero grid
  // has a max width while the rail sits at the page padding, so a fixed viewBox
  // would only line up at one window size. This reads the ring's centre and the
  // rail anchor after layout and redraws the one path that joins them.
  useEffect(() => {
    const hero = heroRef.current
    const object = objectRef.current
    const anchor = anchorRef.current
    if (!hero || !object || !anchor) return

    const measure = () => {
      const heroBox = hero.getBoundingClientRect()
      const objectBox = object.getBoundingClientRect()
      const anchorBox = anchor.getBoundingClientRect()
      if (heroBox.width === 0 || objectBox.width === 0) return
      const startX = objectBox.left - heroBox.left + objectBox.width / 2
      const startY = objectBox.top - heroBox.top + objectBox.height * 0.66
      const endX = anchorBox.left - heroBox.left
      const endY = heroBox.height
      const bend = Math.max(70, (endY - startY) * 0.48)
      setPatch(
        `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${startX.toFixed(1)} ${(startY + bend).toFixed(1)} ${endX.toFixed(1)} ${(endY - bend * 0.4).toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(hero)
    observer.observe(object)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <StudioNav clock={clock} />
      <section id="top" ref={heroRef} className={styles.hero} data-hero>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-hero-item>
              <span className={styles.liveDot} aria-hidden="true" />
              Portfolio / 2026
              <span className={styles.eyebrowDivider} aria-hidden="true" />
              Jakarta
            </p>

            <h1 className={styles.heroTitle} data-hero-title>
              <span>Interfaces</span>
              <span>that keep time.</span>
            </h1>

            <p className={styles.heroSub} data-hero-item>
              Fast, accessible web products from Jakarta. Four years of
              production React, with an ear for motion.
            </p>

            <div className={styles.heroActions} data-hero-item>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={togglePlay}
                aria-pressed={isPlaying}
              >
                {isPlaying ? (
                  <Pause size={16} strokeWidth={1.7} aria-hidden="true" />
                ) : (
                  <Play size={16} strokeWidth={1.7} aria-hidden="true" />
                )}
                {isPlaying ? 'Pause the room' : 'Hear the room'}
              </button>
              <a className={styles.secondaryAction} href="#work">
                See the work
                <ArrowDownRight
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          <div ref={objectRef} className={styles.heroObject} data-hero-object>
            <SignalScene active={isPlaying} />
            <div className={styles.sceneCaption} aria-hidden="true">
              <span>Signal 01</span>
              <span>Chrome ring / live</span>
            </div>
          </div>
        </div>

        <div className={styles.heroFoot} data-hero-item>
          <dl className={styles.readout}>
            <div>
              <dt>Tempo</dt>
              <dd>
                {HERO_READOUT.tempo}
                <small>BPM</small>
              </dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{HERO_READOUT.key}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{HERO_READOUT.status}</dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>{clock}</dd>
            </div>
          </dl>
        </div>

        {/* The 3D object leaves the physical frame through this line, which
            lands exactly on the divider rail below. It is one path with the
            rail, not a decorative swoosh: both share --rail-x and the signal
            color, and the rail continues at that x through every section. */}
        <svg className={styles.heroPatch} aria-hidden="true">
          <path className={styles.heroPatchGlow} d={patch} pathLength={1} />
          <path className={styles.heroPatchLine} d={patch} pathLength={1} />
        </svg>
        <span
          ref={anchorRef}
          className={styles.heroPatchAnchor}
          aria-hidden="true"
        />
      </section>
    </>
  )
}
