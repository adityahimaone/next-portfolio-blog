'use client'

import Image from 'next/image'
import Link from 'next/link'
import Lenis from 'lenis'
import { m as motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { DawHero } from '../components/hero'
import { EMAIL, EXPERIENCES, MIXER_DATA, PROJECTS_SHOWCASE } from '../constants'
import styles from './rack-01.module.css'
import { cn } from '@/lib/utils'
import { TangleFooter } from '@/src/components/ui/tangle-footer'
import { TextCascade } from '@/components/motion/text-cascade'

const RESUME_URL =
  'https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing'

const HERO_MARQUEE_ITEMS = [
  'ADITYA HIMAWAN / FRONTEND ENGINEER',
  'REACT / NEXT.JS / TYPESCRIPT',
  'FRONTEND SYSTEMS / PRODUCT UI',
  'APP + DATA / GO / NODE.JS',
  'DOCKER / NGINX / OBSERVABILITY',
  'JAKARTA, ID',
  '4+ YEARS EXPERIENCE',
  '15K+ USER PLATFORM',
] as const

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Exp' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const

const ROUTE_ITEMS = [
  { href: '/projects', label: 'Projects' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/blog', label: 'Blog' },
  { href: '/music', label: 'Mixtape' },
] as const

const FOOTER_TANGLE_LINES = [
  'React / Next.js / TypeScript',
  'Frontend systems for products people use',
  'Product UI, app data, and delivery',
  'Frontend engineer, Jakarta',
  'See the work, then start a conversation',
] as const

const PROJECT_PREVIEW_DURATION = 185

function formatProjectTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getProjectInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const SKILLS = MIXER_DATA.flatMap((group) => group.channels)

const CASSETTE_THEMES = [
  {
    shell: '#d8d1c5',
    shellDeep: '#aaa094',
    label: '#d9895b',
    ink: '#25231f',
    accent: '#7b2735',
  },
  {
    shell: '#b9c7c8',
    shellDeep: '#7f9498',
    label: '#d9c36e',
    ink: '#18292c',
    accent: '#315f68',
  },
  {
    shell: '#c8bfd2',
    shellDeep: '#8e819b',
    label: '#8c769f',
    ink: '#211a26',
    accent: '#523467',
  },
  {
    shell: '#d7c59d',
    shellDeep: '#a78d5b',
    label: '#e36d3f',
    ink: '#30271b',
    accent: '#7d4027',
  },
] as const

const PROJECT_PALETTES = [
  { vinyl: '#315d72', label: '#df9c58', accent: '#7eb8c7' },
  { vinyl: '#476b50', label: '#d7c467', accent: '#8fc49a' },
  { vinyl: '#a55b35', label: '#e1bd69', accent: '#dc8752' },
  { vinyl: '#563f70', label: '#d17da4', accent: '#9c7fbd' },
  { vinyl: '#36466f', label: '#9b83c4', accent: '#7489bd' },
  { vinyl: '#743f3f', label: '#d08168', accent: '#b96862' },
] as const

function SilkscreenLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.silkscreen}>{children}</span>
}

function SectionHeading({
  index,
  eyebrow,
  children,
}: {
  index: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.sectionHeading}>
      <div className={styles.silkscreen}>
        <span className={styles.sectionIndex}>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h2>{children}</h2>
    </div>
  )
}

function SegmentCounter({ value }: { value: string }) {
  return (
    <div className={`${styles.silkscreen} ${styles.segmentCounter}`}>
      {value}
    </div>
  )
}

function Knob({
  color,
  label,
  value,
  onChange,
}: {
  color: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const rotation = -125 + value * 2.5

  return (
    <div className={styles.knobControl}>
      <div className={styles.knobScale} aria-hidden="true" />
      <button
        type="button"
        data-skill-sequence="param"
        className={styles.knob}
        style={{ '--knob-color': color } as React.CSSProperties}
        aria-label={`${label}: ${value}. Press to increase`}
        onClick={() => onChange(value >= 100 ? 0 : value + 10)}
      >
        <span
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </button>
      <SilkscreenLabel>{label}</SilkscreenLabel>
    </div>
  )
}

function TransportBridge({
  progress,
  activeId,
  compact = false,
}: {
  progress: number
  activeId: string
  compact?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [isSectionHovered, setIsSectionHovered] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeIndex = useMemo(() => {
    const idx = NAV_ITEMS.findIndex((item) => item.id === activeId)
    return idx >= 0 ? idx : 0
  }, [activeId])

  const activeItem = NAV_ITEMS[activeIndex]

  const counter = useMemo(() => {
    const totalSeconds = Math.round(progress * 3_599)
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (totalSeconds % 60).toString().padStart(2, '0')
    const frames = Math.floor((progress * 100) % 100)
      .toString()
      .padStart(2, '0')
    return `${minutes}:${seconds}:${frames}`
  }, [progress])

  // Close mobile dropdown on click outside or escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  return (
    <motion.aside
      layout="position"
      ref={dropdownRef}
      className={`${styles.transport} ${
        compact ? styles.transportCompact : styles.transportDocked
      } ${styles.transportBottom}`}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }
      }
      aria-label="Page transport and navigation"
    >
      {/* Top Progress Runner */}
      <div className={styles.transportProgressBar} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Upward Mobile Dropdown Menu for Landing Page Sections */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDropdown} role="dialog" aria-modal="true">
          <div className={styles.mobileDropdownHeader}>
            <SilkscreenLabel>SECTIONS</SilkscreenLabel>
            <button
              type="button"
              className={styles.mobileDropdownClose}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close sections menu"
            >
              ✕
            </button>
          </div>
          <div className={styles.mobileDropdownSections}>
            {NAV_ITEMS.map((item, index) => {
              const isActive = activeId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${styles.mobileDropdownItem} ${
                    isActive ? styles.mobileDropdownActive : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className={styles.navItemIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                  {isActive && <span className={styles.activeDot} />}
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Desktop Telemetry / Counter (Hidden on mobile) */}
      <div className={styles.transportStatus}>
        <span className={styles.recordDot} aria-hidden="true" />
        <span className={styles.liveBadge}>LIVE</span>
        <div className={styles.fixedSegmentCounter}>
          <SegmentCounter value={counter} />
        </div>
      </div>

      {/* Desktop Section Navigation (Expands ONLY when hovering this group) */}
      <div
        className={`${styles.sectionNavWrapper} ${
          compact && !isSectionHovered
            ? styles.sectionNavWrapperCompact
            : styles.sectionNavWrapperExpanded
        }`}
        onMouseEnter={() => setIsSectionHovered(true)}
        onMouseLeave={() => setIsSectionHovered(false)}
      >
        <div className={styles.sectionNavGroup}>
          {NAV_ITEMS.map((item, index) => {
            const isActive = activeId === item.id
            const isHidden = compact && !isSectionHovered && !isActive
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${styles.navItem} ${isActive ? styles.navActive : ''} ${
                  isHidden ? styles.navItemHidden : ''
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className={styles.navItemIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.navItemLabel}>{item.label}</span>
                {isActive && compact && !isSectionHovered && (
                  <span className={styles.expandChevron} aria-hidden="true">
                    ▾
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </div>

      {/* Mobile Active Section Dropdown Trigger */}
      <button
        type="button"
        className={styles.mobileSectionTrigger}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        aria-expanded={isMobileMenuOpen}
        aria-label={`Current section: ${activeItem.label}. Tap to choose section.`}
      >
        <span className={styles.mobileActiveIndex}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <span className={styles.mobileActiveLabel}>{activeItem.label}</span>
        <span
          className={`${styles.mobileMenuChevron} ${
            isMobileMenuOpen ? styles.chevronOpen : ''
          }`}
          aria-hidden="true"
        >
          ▲
        </span>
      </button>

      {/* Hairline Divider between Section Nav and Direct Route Links */}
      <div className={styles.transportDivider} aria-hidden="true" />

      {/* Direct Route Links (Blog, Projects, Mixtape, Bookmarks) */}
      <div className={styles.routeNavGroup}>
        {ROUTE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.transportRouteItem}
          >
            <span className={styles.routeDot} /> {item.label}
          </Link>
        ))}
      </div>
    </motion.aside>
  )
}


function Hero() {
  const [heroTitleTop, setHeroTitleTop] = useState('CODE')
  const [heroTitleBottom, setHeroTitleBottom] = useState('SYSTEMS')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHeroTitleTop('ADITYA')
      setHeroTitleBottom('HIMAWAN')
    }, 720)
    return () => window.clearTimeout(timer)
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--hero-pointer-x',
      `${event.clientX - rect.left}px`,
    )
    event.currentTarget.style.setProperty(
      '--hero-pointer-y',
      `${event.clientY - rect.top}px`,
    )
  }

  return (
    <section id="home" className={styles.hero} data-rack-section>
      <div className={styles.heroStage} onPointerMove={handlePointerMove}>
        <div className={styles.heroBootSequence} aria-hidden="true">
          <i />
          <span>Routing signal</span>
        </div>
        <div
          className={styles.heroDeviceWall}
          aria-label="Interactive collection of music devices"
        >
          <DawHero backgroundOnly />
        </div>
        <div className={styles.heroBackdropName} aria-hidden="true">
          <TextCascade
            text={heroTitleTop}
            className={styles.heroBackdropCascade}
            animateInitial={false}
          />
          <TextCascade
            text={heroTitleBottom}
            className={styles.heroBackdropCascade}
            animateInitial={false}
          />
        </div>
        <div className={styles.heroAtmosphere} aria-hidden="true" />

        <header className={styles.heroMinimalNav}>
          <a
            href="#home"
            className={styles.wordmark}
            aria-label="AH Studio home"
          >
            AH <span>/ STUDIO</span>
          </a>
          <span className={styles.heroNavRole}>
            Frontend Engineer / Jakarta
          </span>
          <a href={`mailto:${EMAIL}`} className={styles.topContact}>
            Contact
          </a>
        </header>

        <main className={styles.heroImmersiveContent}>
          <div className={styles.heroEditorialPanel}>
            <div className={styles.heroKicker}>
              <span>Frontend Engineer</span>
              <i aria-hidden="true" />
              <span>Jakarta, Indonesia</span>
            </div>
            <h1 className={styles.srOnly}>Aditya Himawan, Frontend Engineer</h1>
            <strong className={styles.heroPanelTitle}>
              Built for the moment after launch.
            </strong>
            <p>
              Frontend systems for products that need to work clearly,
              reliably, and at scale. React, Next.js, and TypeScript across
              products used by more than 15,000 people.
            </p>
            <div className={styles.heroActions}>
              <a href="#work" className={styles.primaryButton}>
                <span>See the works</span>
                <ArrowDownRight size={18} aria-hidden="true" />
              </a>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className={styles.heroResumeLink}
              >
                Open résumé <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div
              className={styles.heroInlineProof}
              aria-label="Career highlights"
            >
              <span>
                <b>4+</b> years
              </span>
              <span>
                <b>3</b> product teams
              </span>
              <span>
                <b>15K+</b> users
              </span>
            </div>
          </div>
        </main>

        <div className={styles.heroBottomRail}>
          <span>Interactive device wall</span>
          <a href="#about">
            Continue <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className={styles.heroAboutHandoff} aria-hidden="true">
          <span>Next signal / 02</span>
          <strong>Profile</strong>
        </div>
      </div>
    </section>
  )
}

const ABOUT_TRACKS = [
  {
    title: 'FOCUS',
    note: 'REACT / NEXT.JS / TYPESCRIPT',
    metric: '04+',
    metricLabel: 'YEARS IN FRONTEND',
    heading: 'Start with the user.',
    body: 'I begin with the interaction, not the component. The interface should make the next decision clear.',
    signal: 'PRIMARY PRACTICE',
    surface: '#d7b36f',
    ink: '#2c251b',
    accent: '#8a432d',
    detail: 'Understand the interaction before shaping the interface.',
  },
  {
    title: 'SYSTEMS',
    note: 'FEATURES / DATA / DELIVERY',
    metric: 'SSR',
    metricLabel: 'RENDERING',
    heading: 'Build the system.',
    body: 'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent.',
    signal: 'FRONTEND ARCHITECTURE',
    surface: '#8199ad',
    ink: '#17252d',
    accent: '#315d72',
    detail: 'Create a frontend system that can carry the next feature.',
  },
  {
    title: 'RANGE',
    note: 'BACKEND / AUTOMATION / INFRA',
    metric: 'VPS',
    metricLabel: 'SELF-HOSTED',
    heading: 'Stay close to production.',
    body: 'I work across application data, deployment, and monitoring when the frontend needs more than a polished screen.',
    signal: 'ADDITIONAL EXPERIENCE',
    surface: '#b68ba5',
    ink: '#30212a',
    accent: '#70415d',
    detail: 'Keep the product visible and dependable after it ships.',
  },
]

function About({
  selected,
  setSelected,
  scrollProgress,
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
  scrollProgress: number
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0.08)

  const [mutedTracks, setMutedTracks] = useState<Set<number>>(new Set())
  const [soloedTrack, setSoloedTrack] = useState<number | null>(null)

  useEffect(() => {
    if (!isPlaying) setPlayhead(0.05 + scrollProgress * 0.9)
  }, [isPlaying, scrollProgress])

  useEffect(() => {
    if (!isPlaying) return
    let frame = 0
    let previous = performance.now()
    const advance = (now: number) => {
      const delta = now - previous
      previous = now
      setPlayhead((position) => (position + delta / 16000) % 1)
      frame = requestAnimationFrame(advance)
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying])

  const toggleMuted = (index: number) => {
    setMutedTracks((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section
      id="about"
      className={`${styles.section} ${styles.about}`}
      data-rack-section
    >
      <div className={styles.aboutStage}>
        <SectionHeading index="02" eyebrow="Profile">
          Make the complicated part feel obvious.
        </SectionHeading>
        <div className={styles.aboutDeck}>
          <div className={styles.aboutCardStack}>
            <div className={styles.aboutCardRail} aria-live="polite">
              {ABOUT_TRACKS.map((track, index) => (
                <button
                  type="button"
                  key={track.title}
                  className={`${styles.aboutCard} ${
                    selected === index ? styles.aboutCardActive : ''
                  }`}
                  style={
                    {
                      '--about-card': track.surface,
                      '--about-ink': track.ink,
                      '--about-accent': track.accent,
                    } as React.CSSProperties
                  }
                  aria-label={`${track.title}. Select this phase`}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <SilkscreenLabel>
                    ARRANGEMENT / {String(index + 1).padStart(2, '0')} /{' '}
                    {track.signal}
                  </SilkscreenLabel>
                  <span className={styles.aboutMetric}>
                    <b>{track.metric}</b>
                    <small>{track.metricLabel}</small>
                  </span>
                  <strong>{track.heading}</strong>
                  <p>{track.body}</p>
                  <span className={styles.aboutCardLabel}>{track.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.timelinePanel}>
            <Screw className={styles.screwTopLeft} />
            <Screw className={styles.screwTopRight} />
            <div className={styles.timelineDeviceBrand}>
              <div>
                <strong>AH / STUDIO</strong>
                <SilkscreenLabel>ARRANGEMENT WORKSTATION</SilkscreenLabel>
              </div>
              <div className={styles.timelineMeters} aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            </div>
            <div className={styles.panelHeader}>
              <SilkscreenLabel>ARRANGEMENT / IDENTITY.AIF</SilkscreenLabel>
              <div className={styles.timelineTransport}>
                <button
                  type="button"
                  onClick={() => setIsPlaying((current) => !current)}
                  aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false)
                    setPlayhead(0.05)
                  }}
                  aria-label="Stop and rewind timeline"
                >
                  <Square size={12} />
                </button>
                <span>120 BPM / 4-4</span>
              </div>
            </div>
            <div className={styles.timelineArrangement}>
              <div className={styles.timelineRuler}>
                <div className={styles.timelineRulerHeader}>
                  <span>TRK</span>
                </div>
                <div className={styles.timelineRulerLanes}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
              </div>
              <div
                className={styles.playhead}
                style={{ '--playhead': `${playhead}` } as React.CSSProperties}
                aria-hidden="true"
              />
              {ABOUT_TRACKS.map((item, index) => (
                <div
                  className={`${styles.track} ${
                    mutedTracks.has(index) ||
                    (soloedTrack !== null && soloedTrack !== index)
                      ? styles.trackMuted
                      : ''
                  }`}
                  key={item.title}
                  style={
                    {
                      '--track-color': item.surface,
                      '--track-ink': item.ink,
                      '--track-accent': item.accent,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.trackHeader}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{item.title}</strong>
                    <span className={styles.trackActions}>
                      <button
                        type="button"
                        aria-label={`${mutedTracks.has(index) ? 'Unmute' : 'Mute'} ${item.title}`}
                        aria-pressed={mutedTracks.has(index)}
                        onClick={() => toggleMuted(index)}
                      >
                        M
                      </button>
                      <button
                        type="button"
                        aria-label={`${soloedTrack === index ? 'Unsolo' : 'Solo'} ${item.title}`}
                        aria-pressed={soloedTrack === index}
                        onClick={() =>
                          setSoloedTrack((current) =>
                            current === index ? null : index,
                          )
                        }
                      >
                        S
                      </button>
                    </span>
                  </div>
                  <div className={styles.trackLane}>
                    <button
                      type="button"
                      className={`${styles.clip} ${
                        selected === index ? styles.clipActive : ''
                      }`}
                      style={
                        {
                          '--clip-offset': `${index * 12.5}%`,
                        } as React.CSSProperties
                      }
                      onClick={() => setSelected(index)}
                      aria-pressed={selected === index}
                    >
                      <span>{item.note}</span>
                      <i />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.clipDetail} aria-live="polite">
              <SilkscreenLabel>
                CLIP {String(selected + 1).padStart(2, '0')} / SELECTED
              </SilkscreenLabel>
              <p>{ABOUT_TRACKS[selected].detail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SignalDivider() {
  const topStory =
    'Frontend systems / clear interfaces.'
  const bottomStory =
    'React / Next.js / product work.'

  return (
    <section
      className={styles.signalDivider}
      aria-label="Frontend systems dock alongside the production stack."
    >
      <div className={styles.signalDividerStage}>
        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneTop}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerTopRail}`}
          >
            {Array.from({ length: 8 }, (_, groupIndex) => (
              <span
                className={styles.signalDividerTrackGroup}
                key={`top-story-${groupIndex}`}
              >
                <span className={styles.signalDividerPhrase}>{topStory}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.signalDock} aria-hidden="true">
          <span className={styles.signalDockRule} />
        </div>

        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneBottom}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerBottomRail}`}
          >
            {Array.from({ length: 8 }, (_, groupIndex) => (
              <span
                className={styles.signalDividerTrackGroup}
                key={`bottom-story-${groupIndex}`}
              >
                <span className={styles.signalDividerPhrase}>
                  {bottomStory}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Note frequency map for 24 chromatic piano keys (C3 to B4)
const WHITE_KEY_NOTES = [
  { note: 'C3', freq: 130.81 },
  { note: 'D3', freq: 146.83 },
  { note: 'E3', freq: 164.81 },
  { note: 'F3', freq: 174.61 },
  { note: 'G3', freq: 196.0 },
  { note: 'A3', freq: 220.0 },
  { note: 'B3', freq: 246.94 },
  { note: 'C4', freq: 261.63 },
  { note: 'D4', freq: 293.66 },
  { note: 'E4', freq: 329.63 },
  { note: 'F4', freq: 349.23 },
  { note: 'G4', freq: 392.0 },
  { note: 'A4', freq: 440.0 },
  { note: 'B4', freq: 493.88 },
]

const BLACK_KEY_NOTES = [
  { note: 'C#3', freq: 138.59, whiteIndex: 0 },
  { note: 'D#3', freq: 155.56, whiteIndex: 1 },
  { note: 'F#3', freq: 185.0, whiteIndex: 3 },
  { note: 'G#3', freq: 207.65, whiteIndex: 4 },
  { note: 'A#3', freq: 233.08, whiteIndex: 5 },
  { note: 'C#4', freq: 277.18, whiteIndex: 7 },
  { note: 'D#4', freq: 311.13, whiteIndex: 8 },
  { note: 'F#4', freq: 369.99, whiteIndex: 10 },
  { note: 'G#4', freq: 415.3, whiteIndex: 11 },
  { note: 'A#4', freq: 466.16, whiteIndex: 12 },
]

const PAD_SOUND_TYPES = [
  { type: 'kick', baseFreq: 160, dropFreq: 42, decay: 0.28 }, // HTML (808 Kick)
  { type: 'snare', baseFreq: 240, dropFreq: 110, decay: 0.22 }, // CSS (Snare)
  { type: 'tom', baseFreq: 320, dropFreq: 90, decay: 0.25 }, // JS (Synth Tom)
  { type: 'rim', baseFreq: 880, dropFreq: 440, decay: 0.16 }, // TS (FM Rimshot)
  { type: 'sub', baseFreq: 65, dropFreq: 38, decay: 0.35 }, // GO (Sub Drop)
  { type: 'hat', baseFreq: 1200, dropFreq: 600, decay: 0.12 }, // SQL (Metallic Hat)
]

const KEYBOARD_SHORTCUTS: Record<
  string,
  { type: 'pad' | 'key'; index: number }
> = {
  '1': { type: 'pad', index: 0 },
  '2': { type: 'pad', index: 1 },
  '3': { type: 'pad', index: 2 },
  '4': { type: 'pad', index: 3 },
  '5': { type: 'pad', index: 4 },
  '6': { type: 'pad', index: 5 },
  a: { type: 'key', index: 0 },
  w: { type: 'key', index: 14 },
  s: { type: 'key', index: 1 },
  e: { type: 'key', index: 15 },
  d: { type: 'key', index: 2 },
  f: { type: 'key', index: 3 },
  t: { type: 'key', index: 16 },
  g: { type: 'key', index: 4 },
  y: { type: 'key', index: 17 },
  h: { type: 'key', index: 5 },
  u: { type: 'key', index: 18 },
  j: { type: 'key', index: 6 },
  k: { type: 'key', index: 7 },
  o: { type: 'key', index: 19 },
  l: { type: 'key', index: 8 },
}

function Skills() {
  const [activeSkill, setActiveSkill] = useState(SKILLS[0])
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(SKILLS.map((skill) => [skill.name, skill.level])),
  )
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const [hitPadIndex, setHitPadIndex] = useState<number | null>(null)
  const [pitch, setPitch] = useState(0)
  const [mod, setMod] = useState(25)
  const [isOn, setIsOn] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isArpPlaying, setIsArpPlaying] = useState(false)
  const [displayMode, setDisplayMode] = useState<'WAVE' | 'SPECTRUM' | 'TEL'>(
    'WAVE',
  )
  const [activeFrequency, setActiveFrequency] = useState<number>(440)
  const [vuLevel, setVuLevel] = useState<number>(3)
  const [skillSequenceProgress, setSkillSequenceProgress] = useState(1)

  const pitchDragRef = useRef(false)
  const modDragRef = useRef(false)
  const pitchOriginY = useRef(0)
  const modOriginY = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const waveEnergyRef = useRef(0)
  const arpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const scrollRatioRef = useRef(0)

  const colors = ['#2e3f5c', '#c9a574', '#8b8d8a', '#ff5a1f']

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Play Drum Pad Hit
  const playPadSound = (skillName: string, padIndex: number) => {
    if (!isOn || isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const sound = PAD_SOUND_TYPES[padIndex % PAD_SOUND_TYPES.length]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = padIndex === 1 ? 'sawtooth' : 'sine'
    const now = ctx.currentTime

    osc.frequency.setValueAtTime(sound.baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(
      sound.dropFreq,
      now + sound.decay,
    )

    gain.gain.setValueAtTime(0.32, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + sound.decay)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + sound.decay)

    waveEnergyRef.current = 1.0
    setActiveFrequency(Math.round(sound.baseFreq))
    setVuLevel(Math.min(8, 5 + Math.floor(Math.random() * 4)))
    setHitPadIndex(padIndex)
    setTimeout(() => setHitPadIndex(null), 180)
  }

  // Play Chromatic Synth Note
  const playKeySound = (
    noteName: string,
    baseFreq: number,
    keyIndex: number,
  ) => {
    if (!isOn || isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const pitchFactor = Math.pow(2, pitch / 60)
    const effectiveFreq = baseFreq * pitchFactor

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    const now = ctx.currentTime

    // Modulation Vibrato LFO
    const modDepth = (mod / 100) * 8
    lfo.frequency.setValueAtTime(6.5, now)
    lfoGain.gain.setValueAtTime(modDepth, now)
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    osc.type = keyIndex >= 14 ? 'sawtooth' : 'triangle'
    osc.frequency.setValueAtTime(effectiveFreq, now)

    // ADSR Pluck envelope
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.24, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    lfo.start(now)
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.6)
    lfo.stop(now + 0.6)

    waveEnergyRef.current = 1.0
    setActiveFrequency(Math.round(effectiveFreq))
    setVuLevel(Math.min(8, 4 + Math.floor(Math.random() * 5)))
    setActiveKey(keyIndex)
    setTimeout(() => setActiveKey(null), 250)
  }

  const handlePadClick = (
    skill: { name: string; level: number },
    index: number,
  ) => {
    setActiveSkill(skill)
    playPadSound(skill.name, index)
  }

  const handleKeyClick = (note: string, freq: number, index: number) => {
    playKeySound(note, freq, index)
  }

  const updateLevel = (name: string, value: number) => {
    setLevels((current) => ({ ...current, [name]: value }))
    const skill = SKILLS.find((item) => item.name === name)
    if (skill) setActiveSkill({ ...skill, level: value })
  }

  // Pitch & Mod Wheel handlers
  const handlePitchDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pitchDragRef.current = true
    pitchOriginY.current = e.clientY
  }
  const handlePitchMove = (e: React.PointerEvent) => {
    if (!pitchDragRef.current) return
    const delta = pitchOriginY.current - e.clientY
    const clamped = Math.max(-50, Math.min(50, Math.round(delta * 1.4)))
    setPitch(clamped)
  }
  const handlePitchUp = () => {
    pitchDragRef.current = false
    setPitch(0)
  }

  const handleModDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    modDragRef.current = true
    modOriginY.current = e.clientY
  }
  const handleModMove = (e: React.PointerEvent) => {
    if (!modDragRef.current) return
    const delta = (modOriginY.current - e.clientY) * 1.1
    setMod((prev) => Math.max(0, Math.min(100, Math.round(prev + delta))))
    modOriginY.current = e.clientY
  }
  const handleModUp = () => {
    modDragRef.current = false
  }

  // Arpeggiator / Auto Demo Loop
  const toggleArp = () => {
    if (isArpPlaying) {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current)
      setIsArpPlaying(false)
      return
    }

    setIsArpPlaying(true)
    let step = 0
    const sequencePads = [0, 2, 3, 1, 4, 3, 5, 2]
    const sequenceKeys = [0, 4, 7, 11, 7, 4, 2, 9]

    arpTimerRef.current = setInterval(() => {
      const padIdx = sequencePads[step % sequencePads.length]
      const keyIdx = sequenceKeys[step % sequenceKeys.length]
      const skill = MIXER_DATA[0].channels[padIdx]
      const keyObj = WHITE_KEY_NOTES[keyIdx]

      if (skill) {
        setActiveSkill(skill)
        playPadSound(skill.name, padIdx)
      }
      if (keyObj && step % 2 === 0) {
        playKeySound(keyObj.note, keyObj.freq, keyIdx)
      }

      step++
    }, 240)
  }

  useEffect(() => {
    return () => {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const handleSequence = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail
      if (progress < 0) {
        setSkillSequenceProgress(1)
        setDisplayMode('WAVE')
        return
      }
      setSkillSequenceProgress(progress)
      setDisplayMode(
        progress < 0.7 ? 'WAVE' : progress < 0.84 ? 'SPECTRUM' : 'TEL',
      )
    }
    section.addEventListener('skills-sequence', handleSequence)
    return () => section.removeEventListener('skills-sequence', handleSequence)
  }, [])

  // Physical Computer Keyboard Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      const key = e.key.toLowerCase()
      const mapping = KEYBOARD_SHORTCUTS[key]
      if (mapping) {
        e.preventDefault()
        if (mapping.type === 'pad') {
          const skill = MIXER_DATA[0].channels[mapping.index]
          if (skill) handlePadClick(skill, mapping.index)
        } else if (mapping.type === 'key') {
          if (mapping.index < 14) {
            const keyObj = WHITE_KEY_NOTES[mapping.index]
            if (keyObj) handleKeyClick(keyObj.note, keyObj.freq, mapping.index)
          } else {
            const blackObj = BLACK_KEY_NOTES[mapping.index - 14]
            if (blackObj)
              handleKeyClick(blackObj.note, blackObj.freq, mapping.index)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOn, isMuted, pitch, mod])

  // Track section scroll ratio for oscilloscope frequency modulation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const total = rect.height + windowHeight
      const current = windowHeight - rect.top
      const progress = Math.max(0, Math.min(1, current / total))
      scrollRatioRef.current = progress
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth VU meter decay
  useEffect(() => {
    const interval = setInterval(() => {
      setVuLevel((prev) => (prev > 1 ? prev - 1 : 1))
    }, 180)
    return () => clearInterval(interval)
  }, [])

  // Oscilloscope & Spectrum Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let phase = 0

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // CRT phosphor grid
      ctx.strokeStyle = 'rgba(92, 214, 163, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < width; x += 20) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += 14) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Center baseline
      ctx.strokeStyle = 'rgba(92, 214, 163, 0.22)'
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const energy = waveEnergyRef.current
      waveEnergyRef.current = Math.max(0, energy * 0.93)
      const scrollMod = scrollRatioRef.current

      if (displayMode === 'WAVE') {
        // Glowing CRT oscilloscope waveform
        ctx.strokeStyle = '#5cd6a3'
        ctx.shadowColor = '#5cd6a3'
        ctx.shadowBlur = isOn ? 8 : 0
        ctx.lineWidth = 1.8

        ctx.beginPath()
        for (let x = 0; x < width; x++) {
          const normX = x / width
          const baseWave =
            Math.sin(normX * (8 + scrollMod * 8) + phase) * (6 + scrollMod * 5)
          const spikeWave =
            Math.sin(normX * 24 + phase * 2.5) *
            Math.cos(normX * 12) *
            energy *
            (height * 0.42)
          const noise = (Math.random() - 0.5) * (energy * 4 + 1.2)
          const y = height / 2 + (isOn ? baseWave + spikeWave + noise : 0)

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      } else if (displayMode === 'SPECTRUM') {
        // 16-band Spectrum Analyzer
        const numBars = 16
        const barWidth = width / numBars - 3
        ctx.fillStyle = '#5cd6a3'
        ctx.shadowColor = '#5cd6a3'
        ctx.shadowBlur = isOn ? 6 : 0

        for (let i = 0; i < numBars; i++) {
          const barEnergy =
            Math.sin(i * 0.6 + phase) * 0.4 +
            0.5 +
            energy * (0.6 + Math.sin(i * 1.2) * 0.4)
          const barHeight = isOn ? Math.max(4, barEnergy * (height * 0.78)) : 2
          const x = i * (barWidth + 3) + 2
          const y = height - barHeight - 2

          ctx.fillRect(x, y, barWidth, barHeight)
        }
        ctx.shadowBlur = 0
      } else {
        // Digital Matrix Telemetry
        ctx.fillStyle = '#5cd6a3'
        ctx.font = '8px var(--font-geist-mono), monospace'
        const hex = (Math.floor(phase * 100) % 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')
        ctx.fillText(`SIG: 0x${hex} // LOCKED`, 8, 18)
        ctx.fillText(`FREQ: ${activeFrequency} Hz // 48kHz`, 8, 32)
        ctx.fillText(
          `VEL: ${levels[activeSkill.name] ?? 90}% · PB: ${pitch > 0 ? '+' : ''}${pitch}`,
          8,
          46,
        )
      }

      phase += 0.08 + scrollMod * 0.06
      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isOn, displayMode, activeFrequency, activeSkill.name, levels, pitch])

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={`${styles.section} ${styles.skills}`}
      data-rack-section
    >
      <div className={styles.skillsStage}>
        <div className={styles.skillsBackdrop} aria-hidden="true">
          SKILLS
        </div>
        <div className={styles.skillsIntro}>
          <SectionHeading index="03" eyebrow="Toolkit">
            The tools behind shipped product work.
          </SectionHeading>
          <p>
            A practical stack for building interfaces, connecting data, and
            getting products into the hands of users.
          </p>
        </div>
        <div className={styles.controller}>
          <Screw className={styles.screwTopLeft} />
          <Screw className={styles.screwTopRight} />
          <Screw className={styles.screwBottomLeft} />
          <Screw className={styles.screwBottomRight} />

          {/* TOPBAR: Branding, Interactive Screen, Actions */}
          <div className={styles.controllerTopbar}>
            <div className={styles.controllerBrand}>
              <strong>AH / STACK CONTROL</strong>
              <SilkscreenLabel>FRONTEND / APP / INFRA</SilkscreenLabel>
            </div>

            {/* CRT Oscilloscope Screen */}
            <div className={styles.controllerDisplay} aria-live="polite">
              <div className={styles.displayHeader}>
                <span>STATUS: {isOn ? 'LIVE STACK' : 'OFFLINE'}</span>
                <div className={styles.displayModeTags}>
                  {(['WAVE', 'SPECTRUM', 'TEL'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      data-skill-sequence="display"
                      className={`${styles.modeTag} ${
                        displayMode === mode ? styles.modeTagActive : ''
                      }`}
                      onClick={() => setDisplayMode(mode)}
                      aria-label={`Switch display to ${mode}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.displayBody}>
                <div className={styles.screenCanvasWrapper}>
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={52}
                    className={styles.screenCanvas}
                  />
                  <div className={styles.canvasScanline} aria-hidden="true" />
                </div>

                <div className={styles.programReadout}>
                  <span>ACTIVE PROGRAM</span>
                  <strong>{activeSkill.name}</strong>
                </div>
              </div>

              <div className={styles.displayTelemetry}>
                <div className={styles.meterStack}>
                  <div className={styles.vuBars} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => {
                      const isLit = i < vuLevel
                      const colorClass =
                        i >= 6
                          ? styles.vuLitRed
                          : i >= 4
                            ? styles.vuLitOrange
                            : styles.vuLitGreen
                      return (
                        <i key={i} className={isLit ? colorClass : undefined} />
                      )
                    })}
                  </div>
                  <div className={styles.telemetryStats}>
                    <span>
                      FREQ: <b>{activeFrequency}Hz</b>
                    </span>
                    <br />
                    <span>
                      PB: <b>{pitch > 0 ? `+${pitch}` : pitch}</b>
                    </span>
                  </div>
                </div>

                <SegmentCounter
                  value={`${String(levels[activeSkill.name] ?? activeSkill.level).padStart(3, '0')}%`}
                />
              </div>
            </div>

            {/* Controller Controls: Arpeggiator & Power Toggle */}
            <div className={styles.controllerActions}>
              <button
                type="button"
                className={`${styles.arpButton} ${
                  isArpPlaying ? styles.arpActive : ''
                }`}
                onClick={toggleArp}
                aria-pressed={isArpPlaying}
                aria-label="Toggle Arpeggiator demo jam"
              >
                <i />
                <span>{isArpPlaying ? 'STOP ARP' : 'ARP / DEMO'}</span>
              </button>

              <button
                type="button"
                className={`${styles.powerToggle} ${!isOn ? styles.powerOff : ''}`}
                onClick={() => setIsOn((prev) => !prev)}
                aria-label={isOn ? 'Power Off' : 'Power On'}
              >
                <i /> {isOn ? 'PWR ON' : 'PWR OFF'}
              </button>
            </div>
          </div>

          {/* BANKS: Drum Pads, Knobs, Faders */}
          <div className={styles.controllerBanks}>
            <div className={`${styles.controlBank} ${styles.padBank}`}>
              <SilkscreenLabel>
                PAD BANK A / FRONTEND (KEYS 1-6)
              </SilkscreenLabel>
              <div>
                {MIXER_DATA[0].channels.map((skill, index) => (
                  <button
                    type="button"
                    key={skill.name}
                    data-skill-sequence="pad"
                    aria-pressed={activeSkill.name === skill.name}
                    onClick={() => handlePadClick(skill, index)}
                    className={`${
                      activeSkill.name === skill.name ? styles.padActive : ''
                    } ${hitPadIndex === index ? styles.padHit : ''}`}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.padShortcutHint}>{index + 1}</span>
                    <strong>{skill.name}</strong>
                    <i
                      style={
                        {
                          '--level': `${levels[skill.name]}%`,
                        } as React.CSSProperties
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={`${styles.controlBank} ${styles.encoderBank}`}>
              <SilkscreenLabel>PARAM BANK B / APP + DATA</SilkscreenLabel>
              <div>
                {MIXER_DATA[1].channels.map((skill, index) => (
                  <Knob
                    key={skill.name}
                    color={colors[index]}
                    label={skill.name}
                    value={Math.round(
                      levels[skill.name] *
                        Math.max(
                          0,
                          Math.min(1, (skillSequenceProgress - 0.18) / 0.22),
                        ),
                    )}
                    onChange={(value) => updateLevel(skill.name, value)}
                  />
                ))}
              </div>
            </div>

            <div className={`${styles.controlBank} ${styles.faderBank}`}>
              <SilkscreenLabel>FADERS C / DELIVERY + INFRA</SilkscreenLabel>
              <div>
                {MIXER_DATA[2].channels.map((skill) => (
                  <label key={skill.name}>
                    <output>{levels[skill.name]}</output>
                    <input
                      type="range"
                      data-skill-sequence="fader"
                      min="0"
                      max="100"
                      value={Math.round(
                        levels[skill.name] *
                          Math.max(
                            0,
                            Math.min(1, (skillSequenceProgress - 0.4) / 0.22),
                          ),
                      )}
                      onChange={(event) =>
                        updateLevel(skill.name, Number(event.target.value))
                      }
                      aria-label={`${skill.name} level`}
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* KEYBOARD BED: Pitch & Mod Wheels + 24 Playable Piano Keys */}
          <div
            className={styles.keyboardBed}
            aria-label="Playable skill keyboard (Keys A-L)"
          >
            <div className={styles.pitchControls}>
              <div className={styles.wheelGroup}>
                <span className={styles.wheelLabel}>PITCH</span>
                <div
                  className={styles.wheelWell}
                  onPointerDown={handlePitchDown}
                  onPointerMove={handlePitchMove}
                  onPointerUp={handlePitchUp}
                  onPointerCancel={handlePitchUp}
                  aria-label="Pitch Bend Wheel"
                  role="slider"
                  aria-valuenow={pitch}
                >
                  <div
                    className={styles.wheelCylinder}
                    style={{ transform: `translateY(${-pitch * 0.4}px)` }}
                  >
                    <span className={styles.wheelCenterRidge} />
                  </div>
                  <div className={styles.wheelTensionIndicator}>
                    <span>+</span>
                    <span className={styles.wheelTickCenter}>0</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
              <div className={styles.wheelGroup}>
                <span className={styles.wheelLabel}>MOD</span>
                <div
                  className={styles.wheelWell}
                  onPointerDown={handleModDown}
                  onPointerMove={handleModMove}
                  onPointerUp={handleModUp}
                  onPointerCancel={handleModUp}
                  aria-label="Modulation Wheel"
                  role="slider"
                  aria-valuenow={mod}
                >
                  <div
                    className={styles.wheelCylinder}
                    style={{ transform: `translateY(${-(mod - 25) * 0.35}px)` }}
                  >
                    <span className={styles.wheelModRidge} />
                  </div>
                  <div className={styles.wheelTensionIndicator}>
                    <span>MAX</span>
                    <span className={styles.wheelTickCenter}>-</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controllerKeys}>
              <div className={styles.whiteKeys}>
                {WHITE_KEY_NOTES.map((keyObj, index) => (
                  <button
                    type="button"
                    key={keyObj.note}
                    aria-label={`Play ${keyObj.note} key`}
                    aria-pressed={activeKey === index}
                    onPointerDown={() =>
                      handleKeyClick(keyObj.note, keyObj.freq, index)
                    }
                  />
                ))}
              </div>
              <div
                className={styles.blackKeys}
                aria-label="Sharp and flat keys"
              >
                {BLACK_KEY_NOTES.map((blackObj, index) => (
                  <button
                    type="button"
                    key={blackObj.note}
                    aria-label={`Play ${blackObj.note} key`}
                    aria-pressed={activeKey === index + 14}
                    style={
                      {
                        '--key-position': `${((blackObj.whiteIndex + 1) / 14) * 100}%`,
                      } as React.CSSProperties
                    }
                    onPointerDown={() =>
                      handleKeyClick(blackObj.note, blackObj.freq, index + 14)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CableDivider() {
  return (
    <section
      className={styles.cableDivider}
      aria-label="Skills output connected to experience input"
    >
      <div className={styles.cableDividerInner}>
        <p className={styles.cableDividerLabel}>
          <span>SIGNAL PATH / 03-04</span>
          <strong>Putting the stack to work.</strong>
        </p>

        <div className={styles.cableAssembly} aria-hidden="true">
          <div className={`${styles.cableHalf} ${styles.cableMaleHalf}`}>
            <span className={styles.cableLine} />
            <span className={styles.cableMale}>
              <i />
            </span>
          </div>
          <div className={`${styles.cableHalf} ${styles.cableFemaleHalf}`}>
            <span className={styles.cableFemale}>
              <i />
            </span>
            <span className={styles.cableLine} />
          </div>
          <span className={styles.cableConnectionFx}>
            <i />
            <i />
          </span>
        </div>
      </div>
    </section>
  )
}

const STATIONS = [88.5, 94.2, 100.8, 106.5]
const NEEDLE_POSITIONS = [8, 36, 64, 92]
const KNOB_ROTATIONS = [0, 135, 270, 405]

function ReleaseTitleHandoff() {
  return (
    <div className={styles.experienceWorkHandoff} aria-hidden="true">
      <span className={styles.handoffShade} />
      <span className={styles.handoffCutLine} />
      <div className={styles.handoffEditorial}>
        <span className={styles.handoffKicker}>SIDE B / SELECTED WORK</span>
        <p className={styles.handoffTitle}>
          <span>
            <b>WORK</b>
          </span>
          <span>
            <b>RELEASED.</b>
          </span>
        </p>
        <span className={styles.handoffIndex}>05 / PROJECT ARCHIVE</span>
      </div>
    </div>
  )
}

function Experience({
  selected,
  setSelected,
  projectDividerRef,
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
  projectDividerRef: React.RefObject<HTMLDivElement | null>
}) {
  const experience = EXPERIENCES[selected]
  const description =
    experience.description ??
    experience.items?.map((item) => item.description) ??
    []

  const [displayFreq, setDisplayFreq] = useState('88.50')

  useEffect(() => {
    const targetFreq = STATIONS[selected] ?? 88.5
    const startFreq = parseFloat(displayFreq) || 88.5
    const duration = 450
    const startTime = performance.now()

    let animId: number
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = startFreq + (targetFreq - startFreq) * ease
      setDisplayFreq(current.toFixed(2))

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      }
    }
    animId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animId)
  }, [selected])

  const targetNeedle = NEEDLE_POSITIONS[selected] ?? 8
  const targetKnob = KNOB_ROTATIONS[selected] ?? 0

  return (
    <section id="experience" className={styles.experience} data-rack-section>
      <div className={styles.experienceStage}>
        <div className={styles.experienceContent}>
          <SectionHeading index="04" eyebrow="Experience + training">
            What shipped, and where.
          </SectionHeading>
          <div className={styles.cassetteDeck}>
            <Screw className={styles.screwTopLeft} />
            <Screw className={styles.screwTopRight} />
            <div className={styles.radioHandle} aria-hidden="true">
              <span />
            </div>
            <div className={styles.cassetteHeader}>
              <span>AH / FIELD RADIO</span>
              <span>FM / AUX / TAPE ARCHIVE</span>
            </div>
            <div className={styles.radioFace}>
              <div className={styles.radioSpeaker} aria-hidden="true">
                <span className={styles.radioSpeakerBadge}>R-01</span>
                <div className={styles.speakerGrille} />
                <div className={styles.radioLevel}>
                  {Array.from({ length: 8 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
              </div>
              <div className={styles.radioCore}>
                <div className={styles.radioTuner} aria-hidden="true">
                  <div className={styles.frequencyDisplay}>
                    <span>FM</span>
                    <strong>{displayFreq}</strong>
                    <small>MHz</small>
                  </div>
                  <div className={styles.frequencyScale}>
                    {[88, 92, 96, 100, 104, 108].map((frequency) => (
                      <span key={frequency}>{frequency}</span>
                    ))}
                    <i
                      style={{
                        left: `${targetNeedle}%`,
                        transition: 'left 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                  </div>
                  <div className={styles.radioDials}>
                    <span>
                      <i />
                      VOL
                    </span>
                    <span>
                      <i
                        style={{
                          transform: `rotate(${targetKnob}deg)`,
                          transition:
                            'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                      TUNE
                    </span>
                    <b>ON AIR</b>
                  </div>
                </div>
                <div
                  className={styles.tapeCarousel}
                  role="group"
                  aria-label="Work experience cassette collection"
                >
                  {[-1, 0, 1].map((offset) => {
                    const index =
                      (selected + offset + EXPERIENCES.length) %
                      EXPERIENCES.length
                    const item = EXPERIENCES[index]
                    const theme =
                      CASSETTE_THEMES[index % CASSETTE_THEMES.length]
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelected(index)}
                        aria-pressed={offset === 0}
                        className={`${styles.cassette} ${offset === 0 ? styles.cassetteActive : offset < 0 ? styles.cassettePrevious : styles.cassetteNext}`}
                        style={
                          {
                            '--cassette-shell': theme.shell,
                            '--cassette-shell-deep': theme.shellDeep,
                            '--cassette-label': theme.label,
                            '--cassette-ink': theme.ink,
                            '--cassette-accent': theme.accent,
                          } as React.CSSProperties
                        }
                      >
                        <span className={styles.cassetteBrand}>
                          <b>AH / STUDIO</b> / TYPE II · HIGH BIAS 70μs
                        </span>
                        <div className={styles.cassetteLabel}>
                          <small>
                            {item.type} / {String(index + 1).padStart(2, '0')}
                          </small>
                          <strong>{item.company}</strong>
                          <span>{item.role}</span>
                        </div>
                        <div
                          className={styles.cassetteMechanism}
                          aria-hidden="true"
                        >
                          <span className={styles.tapeWheel}>
                            {Array.from({ length: 6 }, (_, i) => (
                              <i key={i} />
                            ))}
                          </span>
                          <span className={styles.cassetteTapePath}>
                            <i />
                            <b />
                          </span>
                          <span className={styles.tapeWheel}>
                            {Array.from({ length: 6 }, (_, i) => (
                              <i key={i} />
                            ))}
                          </span>
                        </div>
                        <div
                          className={styles.cassetteHeadAssembly}
                          aria-hidden="true"
                        >
                          <i />
                          <b />
                          <i />
                        </div>
                        <span className={styles.cassetteFooter}>
                          {item.period}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className={styles.experienceBody}>
              <div
                className={styles.experienceSelector}
                role="tablist"
                aria-label="Experience recordings"
              >
                {EXPERIENCES.map((item, index) => {
                  const theme = CASSETTE_THEMES[index % CASSETTE_THEMES.length]
                  return (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selected === index}
                      key={item.id}
                      onClick={() => setSelected(index)}
                      style={
                        {
                          '--cassette-label': theme.label,
                          '--cassette-accent': theme.accent,
                        } as React.CSSProperties
                      }
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.company}</strong>
                      <small>{item.period}</small>
                    </button>
                  )
                })}
              </div>
              <div className={styles.experienceNotes} role="tabpanel">
                <div>
                  <SilkscreenLabel>
                    {experience.type} / {experience.location}
                  </SilkscreenLabel>
                </div>
                <ul>
                  {description.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className={styles.deckButtons}
              aria-label="Experience controls"
            >
              <button
                type="button"
                aria-label="Previous experience"
                onClick={() =>
                  setSelected((current) =>
                    current === 0 ? EXPERIENCES.length - 1 : current - 1,
                  )
                }
              >
                ◀◀
              </button>
              <button type="button" onClick={() => setSelected(0)}>
                <RotateCcw size={12} aria-hidden="true" />
                <span className={styles.srOnly}>Rewind experience</span>
              </button>
              <button
                type="button"
                className={styles.deckPlay}
                aria-label="Next experience"
                onClick={() =>
                  setSelected((current) => (current + 1) % EXPERIENCES.length)
                }
              >
                ▶
              </button>
            </div>
          </div>
        </div>
        <ReleaseTitleHandoff />
      </div>
      <div
        ref={projectDividerRef}
        className={styles.projectNavTrigger}
        aria-hidden="true"
      />
    </section>
  )
}

function Work() {
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [previewId, setPreviewId] = useState<number | null>(
    PROJECTS_SHOWCASE[0]?.id ?? null,
  )
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [currentProgress, setCurrentProgress] = useState(52)

  useEffect(() => {
    if (playingId == null) return

    const interval = window.setInterval(() => {
      setCurrentProgress((progress) => {
        if (progress >= PROJECT_PREVIEW_DURATION) {
          setPlayingId(null)
          return 0
        }
        return progress + 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [playingId])


  const changeProjectPreview = (index: number, direction: -1 | 1) => {
    const nextIndex =
      (index + direction + PROJECTS_SHOWCASE.length) % PROJECTS_SHOWCASE.length
    const nextProjectId = PROJECTS_SHOWCASE[nextIndex]?.id ?? null
    setPreviewId(nextProjectId)
    setPlayingId(nextProjectId)
    setCurrentProgress(0)
  }

  return (
    <section
      id="work"
      className={styles.work}
      data-rack-section
      data-no-heading-reveal
    >
      <div className={styles.workStage}>
        <div className={styles.workHeader}>
          <SectionHeading index="05" eyebrow="Selected work">
            Proof in the product.
          </SectionHeading>
          <div className={styles.workHint}>
            <span>DRAG / SCROLL</span>
            <span>01-{String(PROJECTS_SHOWCASE.length).padStart(2, '0')}</span>
          </div>
        </div>
        <div className={styles.workViewport}>
          <div className={styles.workRail}>
            {PROJECTS_SHOWCASE.map((project, index) => {
              const palette = PROJECT_PALETTES[index % PROJECT_PALETTES.length]
              const releaseNumber = String(index + 1).padStart(2, '0')
              const isPlaying = playingId === project.id
              const isExpanded = expandedId === project.id
              const progressPercentage =
                (previewId === project.id ? currentProgress : 0) /
                PROJECT_PREVIEW_DURATION *
                100

              return (
                <article
                  className={cn(
                    styles.projectModule,
                    isExpanded && styles.projectModuleExpanded,
                  )}
                  key={project.id}
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setExpandedId(isExpanded ? null : project.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  style={
                    {
                      '--record-color': palette.vinyl,
                      '--record-label': palette.label,
                      '--record-accent': palette.accent,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.projectMedia}>
                    <div className={styles.projectImage}>
                      <Image
                        src={project.image}
                        alt={`${project.title} project cover`}
                        fill
                        sizes="(max-width: 768px) 70vw, 24vw"
                      />
                      <span className={styles.imageScan} />
                    </div>
                    <div className={styles.projectPlayerHeader}>
                      <div className={styles.projectPlayerIdentity}>
                        <span>
                          <b>{project.title}</b>
                          <small
                            className={cn(
                              styles.projectPlayerDescription,
                              isExpanded && styles.projectPlayerDescriptionExpanded,
                            )}
                          >
                            {project.description}
                          </small>
                        </span>
                      </div>
                      <div className={styles.projectPlayerActions}>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.projectAction}
                          title={`View ${project.title} project`}
                          data-tooltip="View project"
                          aria-label={`View ${project.title} project`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ArrowUpRight size={15} />
                        </a>
                      </div>
                    </div>
                    <div className={styles.projectControls}>
                        <div className={styles.projectProgressLabels}>
                          <span>{formatProjectTime(currentProgress)}</span>
                          <span>
                            -
                            {formatProjectTime(
                              PROJECT_PREVIEW_DURATION - currentProgress,
                            )}
                          </span>
                        </div>
                        <div
                          className={styles.projectProgressTrack}
                          role="progressbar"
                          aria-label={`${project.title} preview progress`}
                          aria-valuenow={progressPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          onClick={(event) => {
                            event.stopPropagation()
                            const bounds = event.currentTarget.getBoundingClientRect()
                            const ratio = Math.min(
                              1,
                              Math.max(0, (event.clientX - bounds.left) / bounds.width),
                            )
                            setCurrentProgress(
                              Math.round(PROJECT_PREVIEW_DURATION * ratio),
                            )
                          }}
                        >
                          <span style={{ width: `${progressPercentage}%` }} />
                        </div>
                        <div className={styles.projectPlaybackControls}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              changeProjectPreview(index, -1)
                            }}
                            aria-label="Previous project preview"
                          >
                            <SkipBack size={17} />
                          </button>
                          <button
                            type="button"
                            className={styles.projectPlayButton}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (isPlaying) setPlayingId(null)
                              else {
                                setPreviewId(project.id)
                                setPlayingId(project.id)
                              }
                            }}
                            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isPlaying ? <Pause size={21} /> : <Play size={21} fill="currentColor" />}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              changeProjectPreview(index, 1)
                            }}
                            aria-label="Next project preview"
                          >
                            <SkipForward size={17} />
                          </button>
                        </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

const CONTACT_PADS = [
  { label: 'Email', detail: EMAIL, href: `mailto:${EMAIL}`, note: 261.63 },
  {
    label: 'LinkedIn',
    detail: 'Professional profile',
    href: 'https://www.linkedin.com/in/adityahimaone',
    note: 329.63,
  },
  {
    label: 'GitHub',
    detail: 'Code and projects',
    href: 'https://github.com/adityahimaone',
    note: 392,
  },
  { label: 'Resume', detail: 'Open PDF', href: RESUME_URL, note: 523.25 },
  { label: 'Kick', detail: 'Low pulse', note: 82.41 },
  { label: 'Snare', detail: 'Short noise', note: 196 },
  { label: 'Chord', detail: 'C major', note: 261.63 },
  { label: 'Tone', detail: 'High signal', note: 659.25 },
  { label: 'Sub', detail: 'Low sine', note: 65.41 },
  { label: 'Rim', detail: 'Short click', note: 880 },
  { label: 'Fifth', detail: 'C and G', note: 392 },
  { label: 'Pluck', detail: 'Fast decay', note: 783.99 },
  { label: 'Bass', detail: 'Square bass', note: 110 },
  { label: 'Hat', detail: 'Bright noise', note: 1200 },
  { label: 'Minor', detail: 'A minor', note: 220 },
  { label: 'Bell', detail: 'Metal tone', note: 1046.5 },
] as const

const CONTACT_PAD_COLORS = [
  '#35c78a',
  '#4d8dff',
  '#a778ff',
  '#f2b84b',
  '#ff5a3d',
  '#ef4f91',
  '#9b6cff',
  '#3e9cff',
  '#23c7b7',
  '#85c94a',
  '#e4ca3f',
  '#f28b3d',
  '#e05b52',
  '#cf62c3',
  '#746fe8',
  '#4bafd1',
] as const

function Contact() {
  const currentYear = new Date().getFullYear()
  const [activePad, setActivePad] = useState<number | null>(null)
  const [loopingPads, setLoopingPads] = useState<Set<number>>(new Set())
  const [sweepingPads, setSweepingPads] = useState<Set<number>>(new Set())
  const [bpm, setBpm] = useState(112)
  const [volume, setVolume] = useState(72)
  const [bank, setBank] = useState<'A' | 'B'>('A')
  const audioContextRef = useRef<AudioContext | null>(null)
  const contactRef = useRef<HTMLElement | null>(null)
  const loopTimersRef = useRef<Map<number, number>>(new Map())
  const sweepTimersRef = useRef<number[]>([])

  const triggerSound = useCallback(
    (index: number) => {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioContextClass) return

      const context = audioContextRef.current ?? new AudioContextClass()
      audioContextRef.current = context
      void context.resume()
      const now = context.currentTime
      const gain = context.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.01, (volume / 100) * 0.18),
        now + 0.008,
      )
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
      gain.connect(context.destination)

      if (index === 5 || index === 13) {
        const buffer = context.createBuffer(
          1,
          context.sampleRate * 0.16,
          context.sampleRate,
        )
        const data = buffer.getChannelData(0)
        for (let sample = 0; sample < data.length; sample += 1) {
          data[sample] = Math.random() * 2 - 1
        }
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(gain)
        source.start(now)
      } else {
        const bankMultiplier = bank === 'A' ? 1 : 1.5
        const frequencies =
          index === 6
            ? [261.63, 329.63, 392]
            : index === 10
              ? [261.63, 392]
              : index === 14
                ? [220, 261.63, 329.63]
                : [CONTACT_PADS[index].note * bankMultiplier]
        frequencies.forEach((frequency) => {
          const oscillator = context.createOscillator()
          oscillator.type =
            index === 4 || index === 8
              ? 'sine'
              : index === 12
                ? 'square'
                : 'triangle'
          oscillator.frequency.setValueAtTime(frequency, now)
          if (index === 4) {
            oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.2)
          }
          oscillator.connect(gain)
          oscillator.start(now)
          oscillator.stop(now + 0.25)
        })
      }
    },
    [bank, volume],
  )

  const togglePad = useCallback(
    (index: number) => {
      setActivePad(index)
      setLoopingPads((current) => {
        const next = new Set(current)
        if (next.has(index)) {
          next.delete(index)
          setActivePad((active) => (active === index ? null : active))
        } else {
          next.add(index)
          triggerSound(index)
        }
        return next
      })
    },
    [triggerSound],
  )

  useEffect(() => {
    loopTimersRef.current.forEach((timer) => window.clearInterval(timer))
    loopTimersRef.current.clear()
    const beatDuration = Math.max(180, 60_000 / bpm)
    loopingPads.forEach((index) => {
      const timer = window.setInterval(() => triggerSound(index), beatDuration)
      loopTimersRef.current.set(index, timer)
    })
    return () => {
      loopTimersRef.current.forEach((timer) => window.clearInterval(timer))
      loopTimersRef.current.clear()
    }
  }, [bpm, loopingPads, triggerSound])

  useEffect(() => {
    const section = contactRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const order = Array.from(
          { length: CONTACT_PADS.length },
          (_, index) => index,
        ).sort((a, b) => {
          const distanceA = Math.floor(a / 4) + (a % 4)
          const distanceB = Math.floor(b / 4) + (b % 4)
          return distanceA - distanceB || a - b
        })
        const stepDelay = 72
        const waveDuration = order.length * stepDelay + 260
        for (let wave = 0; wave < 3; wave += 1) {
          order.forEach((index, step) => {
            const onTimer = window.setTimeout(
              () => {
                setSweepingPads((current) => new Set(current).add(index))
                const offTimer = window.setTimeout(() => {
                  setSweepingPads((current) => {
                    const next = new Set(current)
                    next.delete(index)
                    return next
                  })
                }, 230)
                sweepTimersRef.current.push(offTimer)
              },
              420 + wave * (waveDuration + 280) + step * stepDelay,
            )
            sweepTimersRef.current.push(onTimer)
          })
        }
      },
      { threshold: 0.28 },
    )
    observer.observe(section)
    return () => {
      observer.disconnect()
      sweepTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      sweepTimersRef.current = []
    }
  }, [])

  useEffect(
    () => () => {
      void audioContextRef.current?.close()
    },
    [],
  )

  return (
    <section
      ref={contactRef}
      id="contact"
      className={styles.contact}
      data-rack-section
    >
      <div className={styles.contactFreshHeader}>
        <SectionHeading index="06" eyebrow="Open channel">
          Bring me the difficult part.
        </SectionHeading>
        <p>
          New frontend builds, complex product interfaces, and React
          applications that need clearer structure.
        </p>
      </div>

      <div className={styles.contactDeck}>
        <div className={styles.contactDeckBrand}>
          <div>
            <strong>AH / GRID 16</strong>
            <span>CONTACT PERFORMANCE CONTROLLER</span>
          </div>
          <span>USB / WEB AUDIO</span>
        </div>

        <div className={styles.contactDeckTop}>
          <label className={styles.contactDial}>
            <input
              type="range"
              min="70"
              max="150"
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
            <span
              style={
                {
                  '--dial-rotation': `${-130 + (bpm - 70) * 3.25}deg`,
                } as React.CSSProperties
              }
            />
            <b>Tempo</b>
            <small>{bpm} BPM</small>
          </label>
          <div className={styles.contactDeckDisplay} aria-live="polite">
            <span>
              PAD{' '}
              {activePad === null
                ? '--'
                : String(activePad + 1).padStart(2, '0')}
            </span>
            <strong>
              {activePad === null
                ? 'Select a pad'
                : CONTACT_PADS[activePad].label}
            </strong>
            <small>
              BANK {bank} / {activePad === null ? 'READY' : 'TRIGGERED'}
            </small>
          </div>
          <label className={styles.contactDial}>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
            <span
              style={
                {
                  '--dial-rotation': `${-130 + volume * 2.6}deg`,
                } as React.CSSProperties
              }
            />
            <b>Level</b>
            <small>{volume}%</small>
          </label>
        </div>

        <div className={styles.contactPerformanceArea}>
          <div className={styles.contactModeRail}>
            <button
              type="button"
              aria-pressed={bank === 'A'}
              onClick={() => setBank('A')}
            >
              A
            </button>
            <button
              type="button"
              aria-pressed={bank === 'B'}
              onClick={() => setBank('B')}
            >
              B
            </button>
            <span>Bank</span>
          </div>
          <div className={styles.contactPadGrid}>
            {CONTACT_PADS.map((pad, index) => {
              const content = (
                <>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{pad.label}</strong>
                  <small>{pad.detail}</small>
                </>
              )
              const className = `${styles.contactPad} ${
                loopingPads.has(index) ? styles.contactPadActive : ''
              } ${sweepingPads.has(index) ? styles.contactPadSweeping : ''}`

              return 'href' in pad ? (
                <a
                  key={pad.label}
                  className={className}
                  href={pad.href}
                  target={pad.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={
                    pad.href.startsWith('mailto:') ? undefined : 'noreferrer'
                  }
                  onClick={() => togglePad(index)}
                  style={
                    {
                      '--pad-color': CONTACT_PAD_COLORS[index],
                    } as React.CSSProperties
                  }
                >
                  {content}
                </a>
              ) : (
                <button
                  key={pad.label}
                  type="button"
                  className={className}
                  aria-pressed={loopingPads.has(index)}
                  onClick={() => togglePad(index)}
                  style={
                    {
                      '--pad-color': CONTACT_PAD_COLORS[index],
                    } as React.CSSProperties
                  }
                >
                  {content}
                </button>
              )
            })}
          </div>
          <div className={styles.contactModeRail}>
            <a href={`mailto:${EMAIL}`} aria-label="Email Aditya">
              <Mail size={16} />
            </a>
            <button
              type="button"
              onClick={() => setActivePad(null)}
              aria-label="Clear active pad"
            >
              <Square size={14} />
            </button>
            <span>Out</span>
          </div>
        </div>
        <p className={styles.contactDeckNote}>
          Pads 01 to 04 open a channel. Pads 05 to 16 play the instrument.
        </p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerTransition} aria-hidden="true" />

        <TangleFooter
          className={styles.footerTangle}
          lines={[...FOOTER_TANGLE_LINES]}
          background="#0b0d0c"
          ribbon="#e7e2d8"
          textColor="#0b0d0c"
          height={350}
          seed={23}
          label="Rotating portfolio footer signal"
        />

        <div className={styles.footerMeta}>
          <span>© {currentYear} Aditya Himawan</span>
          <button
            type="button"
            className={styles.footerTopButton}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>Back to top</span>
            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  )
}

export default function Rack01LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const projectDividerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState('home')
  const [aboutIndex, setAboutIndex] = useState(0)
  const [aboutProgress, setAboutProgress] = useState(0)
  const [experienceIndex, setExperienceIndex] = useState(0)
  const [transportCompact, setTransportCompact] = useState(false)

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const currentY = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight

        setProgress(max > 0 ? Math.min(1, Math.max(0, currentY / max)) : 0)
        setTransportCompact(currentY >= 120)
      })
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  useEffect(() => {
    const sections = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[data-rack-section]') ??
        [],
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let context: { revert: () => void } | undefined
    let smoothScrollCleanup: (() => void) | undefined
    let cancelled = false

    const setup = async () => {
      if (
        !rootRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled || !rootRef.current) return
      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
      })
      const updateLenis = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(updateLenis)
      gsap.ticker.lagSmoothing(0)
      smoothScrollCleanup = () => {
        gsap.ticker.remove(updateLenis)
        lenis.destroy()
      }

      context = gsap.context(() => {
        const media = gsap.matchMedia()
        media.add('(min-width: 769px)', () => {
          const hero = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.hero}`,
          )
          if (!hero) return
          const wall = hero.querySelector<HTMLElement>(
            `.${styles.heroDeviceWall}`,
          )!
          const modules = gsap.utils.toArray<HTMLElement>(
            hero?.querySelectorAll<HTMLElement>('[data-hero-device]') ?? [],
          )
          const routes = gsap.utils.toArray<HTMLElement>(
            hero?.querySelectorAll<HTMLElement>('[data-hero-route]') ?? [],
          )
          const anchors = modules.filter(
            (module) => module.dataset.rackAnchor === 'true',
          )
          const supportingModules = modules.filter(
            (module) => module.dataset.rackAnchor !== 'true',
          )

          const name = hero.querySelector<HTMLElement>(
            `.${styles.heroBackdropName}`,
          )!
          const panel = hero.querySelector<HTMLElement>(
            `.${styles.heroEditorialPanel}`,
          )!
          const nav = hero.querySelector<HTMLElement>(
            `.${styles.heroMinimalNav}`,
          )!
          const heroRail = hero.querySelector<HTMLElement>(
            `.${styles.heroBottomRail}`,
          )!
          const heroRailLink = heroRail.querySelector<HTMLElement>('a')!
          const atmosphere = hero.querySelector<HTMLElement>(
            `.${styles.heroAtmosphere}`,
          )!
          const handoff = hero.querySelector<HTMLElement>(
            `.${styles.heroAboutHandoff}`,
          )!
          const boot = hero.querySelector<HTMLElement>(
            `.${styles.heroBootSequence}`,
          )!

          const intro = gsap.timeline({ defaults: { overwrite: 'auto' } })
          intro
            .fromTo(
              wall,
              {
                scale: 1.11,
                filter: 'saturate(0.45) contrast(1.15) brightness(0.42)',
              },
              {
                scale: 1.015,
                filter: 'saturate(0.8) contrast(1.08) brightness(0.78)',
                duration: 1.45,
                ease: 'expo.out',
              },
            )
            .fromTo(
              modules,
              {
                xPercent: (index) =>
                  Number(modules[index]?.dataset.collapseX ?? 0) * 0.72,
                yPercent: (index) =>
                  Number(modules[index]?.dataset.collapseY ?? 0) * 0.72,
                rotation: (index) =>
                  Number(modules[index]?.dataset.collapseRotation ?? 0) * 0.7,
                scale: 0.88,
                opacity: 0,
              },
              {
                xPercent: 0,
                yPercent: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 1.25,
                stagger: { each: 0.045, from: 'edges' },
                ease: 'expo.out',
              },
              0.06,
            )

            .fromTo(
              [nav, heroRail],
              { opacity: 0 },
              { opacity: 1, duration: 0.55, ease: 'power2.out' },
              0.94,
            )
            .to(boot, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.38)

          const collapse = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
            defaults: { ease: 'none', overwrite: 'auto' },
          })

          collapse
            .to(
              panel,
              {
                xPercent: -18,
                opacity: 0,
                filter: 'blur(5px)',
                duration: 0.18,
              },
              0.04,
            )
            .to(nav, { opacity: 0.34, duration: 0.2 }, 0.06)
            .to(
              heroRail,
              {
                y: () => -Math.min(176, window.innerHeight * 0.2),
                color: 'rgba(16, 18, 17, 0.68)',
                opacity: 1,
                duration: 0.36,
              },
              0.7,
            )
            .to(
              heroRailLink,
              {
                color: 'rgba(16, 18, 17, 0.9)',
                duration: 0.36,
              },
              0.7,
            )
            .to(
              modules,
              {
                xPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseX ?? 0),
                yPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseY ?? 0),
                rotation: (_, element) =>
                  Number(
                    (element as HTMLElement).dataset.collapseRotation ?? 0,
                  ),
                scale: (_, element) =>
                  (element as HTMLElement).dataset.rackAnchor === 'true'
                    ? 0.96
                    : 0.88,
                duration: 0.52,
                stagger: 0.008,
              },
              0.1,
            )
            .to(supportingModules, { opacity: 0.16, duration: 0.28 }, 0.24)
            .to(
              anchors,
              {
                opacity: 1,
                filter: 'brightness(1.08) saturate(1)',
                duration: 0.22,
              },
              0.28,
            )
            .to(routes, { opacity: 1, y: 0, duration: 0.18 }, 0.32)
            .to(
              name,
              {
                scale: 1.34,
                letterSpacing: '-0.055em',
                filter: 'blur(0px)',
                duration: 0.5,
              },
              0.14,
            )
            .to(atmosphere, { opacity: 0.36, duration: 0.28 }, 0.3)
            .to(routes, { opacity: 0, y: -5, duration: 0.16 }, 0.66)
            .to(supportingModules, { opacity: 0.04, duration: 0.24 }, 0.7)
            .to(anchors, { opacity: 0.18, scale: 1.02, duration: 0.24 }, 0.7)
            .to(
              name,
              {
                yPercent: -10,
                opacity: 0.32,
                scale: 1.46,
                filter: 'blur(3px)',
                duration: 0.25,
              },
              0.72,
            )
            .fromTo(
              handoff,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.26 },
              0.72,
            )
            .to(atmosphere, { opacity: 0.1, duration: 0.2 }, 0.78)

          ScrollTrigger.create({
            trigger: `.${styles.about}`,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => setAboutProgress(self.progress),
          })

          const aboutCards = gsap.utils.toArray<HTMLElement>(
            `.${styles.aboutCard}`,
          )
          aboutCards.forEach((card, index) => {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 58%',
              end: 'bottom 42%',
              onEnter: () => setAboutIndex(index),
              onEnterBack: () => setAboutIndex(index),
            })
          })

          const storyHeadings = gsap
            .utils.toArray<HTMLElement>(`.${styles.sectionHeading}`)
            .filter((heading) => !heading.closest('[data-no-heading-reveal]'))
          storyHeadings.forEach((heading) => {
            const label = heading.querySelector(`.${styles.silkscreen}`)
            const title = heading.querySelector('h2')
            gsap.fromTo(
              [label, title],
              { yPercent: 105, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: heading,
                  start: 'top 90%',
                  end: 'top 58%',
                  scrub: 0.7,
                },
              },
            )
          })

          gsap.fromTo(
            `.${styles.controller}`,
            { scale: 1, yPercent: 0 },
            {
              scale: 0.86,
              yPercent: -2,
              transformOrigin: '50% 0%',
              ease: 'none',
              scrollTrigger: {
                trigger: `.${styles.skills}`,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.85,
              },
            },
          )

          const skillSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.skills}`,
          )
          if (skillSection) {
            const sequenceGroups = {
              pads: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="pad"]',
                ),
              ),
              params: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="param"]',
                ),
              ),
              faders: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="fader"]',
                ),
              ),
            }
            const activateThrough = (
              items: HTMLElement[],
              progress: number,
              start: number,
              end: number,
            ) => {
              const local = Math.max(
                0,
                Math.min(1, (progress - start) / (end - start)),
              )
              const activeCount = Math.ceil(local * items.length)
              items.forEach((item, index) => {
                item.classList.toggle(
                  styles.skillsSequenceActive,
                  index < activeCount,
                )
              })
            }
            const activateCurrent = (
              items: HTMLElement[],
              progress: number,
              start: number,
              end: number,
            ) => {
              const local = Math.max(
                0,
                Math.min(1, (progress - start) / (end - start)),
              )
              const activeIndex = Math.min(
                items.length - 1,
                Math.floor(local * items.length),
              )
              items.forEach((item, index) =>
                item.classList.toggle(
                  styles.skillsSequenceActive,
                  local > 0 && index === activeIndex,
                ),
              )
            }

            ScrollTrigger.create({
              trigger: skillSection,
              start: 'top 86%',
              end: 'bottom 14%',
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const progress = self.progress
                skillSection.dispatchEvent(
                  new CustomEvent<number>('skills-sequence', {
                    detail: progress,
                  }),
                )
                activateCurrent(sequenceGroups.pads, progress, 0.02, 0.18)
                activateThrough(sequenceGroups.params, progress, 0.16, 0.38)
                activateThrough(sequenceGroups.faders, progress, 0.34, 0.58)
              },
              onLeaveBack: () => {
                Object.values(sequenceGroups)
                  .flat()
                  .forEach((item) =>
                    item.classList.remove(styles.skillsSequenceActive),
                  )
                skillSection.dispatchEvent(
                  new CustomEvent<number>('skills-sequence', { detail: -1 }),
                )
              },
            })
          }

          const depthModules = gsap.utils.toArray<HTMLElement>(
            `.${styles.contactLaunchpad}`,
          )
          depthModules.forEach((module) => {
            gsap.fromTo(
              module,
              { y: 18 },
              {
                y: -18,
                ease: 'none',
                scrollTrigger: {
                  trigger: module,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.1,
                },
              },
            )
          })

          const depthHeadings = gsap.utils.toArray<HTMLElement>(
            `.${styles.contact} .${styles.patchHeader}`,
          )
          depthHeadings.forEach((heading) => {
            gsap.fromTo(
              heading,
              { y: -8 },
              {
                y: 8,
                ease: 'none',
                scrollTrigger: {
                  trigger: heading,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                },
              },
            )
          })

          const studioDetails = gsap.utils.toArray<HTMLElement>(
            `.${styles.skillsIntro} > p, .${styles.workHint}, .${styles.patchScreen}`,
          )
          studioDetails.forEach((detail) => {
            gsap.fromTo(
              detail,
              { y: 24, opacity: 0.35 },
              {
                y: 0,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: detail,
                  start: 'top 92%',
                  end: 'top 62%',
                  scrub: 0.8,
                },
              },
            )
          })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.contact}`,
                start: 'top 82%',
                end: 'top 24%',
                scrub: 0.8,
              },
            })
            .fromTo(
              `.${styles.contactSignal}`,
              { clipPath: 'inset(0 50% 0 50%)', opacity: 0.25 },
              { clipPath: 'inset(0 0% 0 0%)', opacity: 1, ease: 'none' },
              0,
            )
            .fromTo(
              `.${styles.contactHeadline} > span`,
              { yPercent: 85, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                stagger: 0.1,
                ease: 'none',
              },
              0.12,
            )
            .fromTo(
              `.${styles.launchpadTopbar}, .${styles.launchpadHeader}, .${styles.launchpadGrid}`,
              { y: 28, opacity: 0.28 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'none',
              },
              0.18,
            )

          gsap.fromTo(
            `.${styles.projectModule}`,
            { scale: 0.99, opacity: 0.72 },
            {
              scale: 1,
              opacity: 1,
              stagger: 0.06,
              ease: 'none',
              scrollTrigger: {
                trigger: `.${styles.work}`,
                start: 'top 88%',
                end: 'top 38%',
                scrub: 0.8,
              },
            },
          )

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.work}`,
                start: 'top 82%',
                end: 'top 18%',
                scrub: 0.8,
              },
              defaults: { ease: 'power2.out' },
            })
            .fromTo(
              `.${styles.projectImage}`,
              { y: 18, opacity: 0.35 },
              { y: 0, opacity: 1, stagger: 0.08, duration: 0.32 },
              0,
            )
            .fromTo(
              `.${styles.projectPlayerHeader}`,
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.08, duration: 0.24 },
              0.28,
            )
            .fromTo(
              `.${styles.projectControls}`,
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.08, duration: 0.24 },
              0.52,
            )

          gsap.to(`.${styles.projectVinyl}`, {
            rotate: 360,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.work}`,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
            },
          })

          gsap.to(`.${styles.tapeWheel}`, {
            rotate: 920,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.experience}`,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.4,
              onUpdate: (self) => {
                const experienceProgress = Math.min(1, self.progress / 0.52)
                const next = Math.min(
                  EXPERIENCES.length - 1,
                  Math.floor(experienceProgress * EXPERIENCES.length),
                )
                setExperienceIndex((current) =>
                  current === next ? current : next,
                )
              },
            },
          })

          const experienceSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experience}`,
          )
          const experienceContent = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experienceContent}`,
          )
          const handoffShade = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.handoffShade}`,
          )
          const handoffEditorial = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.handoffEditorial}`,
          )
          const handoffCutLine = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.handoffCutLine}`,
          )

          if (
            experienceSection &&
            experienceContent &&
            handoffShade &&
            handoffEditorial &&
            handoffCutLine
          ) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: experienceSection,
                  start: 'top top',
                  end: 'bottom bottom',
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
                defaults: { ease: 'none' },
              })
              .to(
                experienceContent,
                {
                  x: '-18vw',
                  y: -22,
                  scale: 0.9,
                  transformOrigin: '50% 44%',
                  duration: 0.38,
                },
                0.52,
              )
              .to(experienceContent, { opacity: 0.12, duration: 0.12 }, 0.86)
              .fromTo(
                handoffShade,
                { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
                {
                  opacity: 1,
                  clipPath: 'inset(0 0% 0 0)',
                  duration: 0.42,
                },
                0.52,
              )
              .fromTo(
                handoffCutLine,
                { x: () => -window.innerWidth },
                { x: () => window.innerWidth, duration: 0.42 },
                0.52,
              )
              .fromTo(
                handoffEditorial,
                { autoAlpha: 0 },
                {
                  autoAlpha: 1,
                  duration: 0.12,
                },
                0.6,
              )
              .fromTo(
                `.${styles.handoffTitle} b`,
                { yPercent: 108 },
                { yPercent: 0, stagger: 0.06, duration: 0.24 },
                0.61,
              )
              .fromTo(
                `.${styles.handoffKicker}, .${styles.handoffIndex}`,
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.18 },
                0.7,
              )
          }

          const rail = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.workRail}`,
          )
          const viewport = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.workViewport}`,
          )
          if (rail && viewport) {
            gsap.to(rail, {
              x: () => Math.min(0, -(rail.scrollWidth - viewport.clientWidth)),
              ease: 'none',
              scrollTrigger: {
                trigger: `.${styles.work}`,
                start: () => `top+=${window.innerHeight} top`,
                end: 'bottom bottom',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })
          }

          const workHeader = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.workHeader}`,
          )
          if (workHeader && rail) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: `.${styles.work}`,
                  start: 'bottom 28%',
                  end: 'bottom bottom',
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
                defaults: { ease: 'none' },
              })
              .fromTo(
                rail,
                { scale: 1 },
                { scale: 0.98, duration: 0.72 },
                0,
              )
              .fromTo(
                workHeader,
                { opacity: 1 },
                { opacity: 1, duration: 0.48 },
                0.08,
              )
          }
        })

        const dividerDockRule = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDockRule}`,
        )
        const dividerTopRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerTopRail}`,
        )
        const dividerBottomRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerBottomRail}`,
        )

        if (dividerTopRail && dividerBottomRail && dividerDockRule) {
          const horizontalTravel = () =>
            window.innerWidth < 769
              ? Math.min(22, window.innerWidth * 0.055)
              : Math.min(48, window.innerWidth * 0.035)

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.signalDivider}`,
                start: 'top 85%',
                end: 'bottom 15%',
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
              defaults: { ease: 'none' },
            })
            .fromTo(
              dividerTopRail,
              { x: () => -horizontalTravel() },
              { x: 0, duration: 0.7, force3D: true },
              0,
            )
            .fromTo(
              dividerBottomRail,
              { x: () => horizontalTravel() },
              { x: 0, duration: 0.7, force3D: true },
              0,
            )
            .fromTo(
              dividerDockRule,
              { scaleX: 0.18, opacity: 0.5 },
              { scaleX: 1, opacity: 0.82, duration: 0.52 },
              0.22,
            )
        }

        const cableMaleHalf = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableMaleHalf}`,
        )
        const cableFemaleHalf = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableFemaleHalf}`,
        )
        const cableConnectionFx = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableConnectionFx}`,
        )
        if (cableMaleHalf && cableFemaleHalf && cableConnectionFx) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.cableDivider}`,
                start: 'top bottom',
                end: 'bottom 45%',
                scrub: 1.15,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              cableMaleHalf,
              { x: () => -Math.min(360, window.innerWidth * 0.3) },
              { x: 0, duration: 0.82, force3D: true, ease: 'none' },
              0,
            )
            .fromTo(
              cableFemaleHalf,
              { x: () => Math.min(360, window.innerWidth * 0.3) },
              { x: 0, duration: 0.82, force3D: true, ease: 'none' },
              0,
            )
            .fromTo(
              cableConnectionFx,
              { autoAlpha: 0, scale: 0.7 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.18,
                transformOrigin: '50% 50%',
                ease: 'power2.out',
              },
              0.82,
            )
        }

        media.add('(max-width: 768px)', () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.experienceWorkHandoff}`,
                start: 'top 88%',
                end: 'bottom 28%',
                scrub: 0.75,
              },
              defaults: { ease: 'none' },
            })
            .fromTo(
              `.${styles.handoffShade}`,
              { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
              {
                opacity: 1,
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.72,
              },
              0,
            )
            .fromTo(
              `.${styles.handoffCutLine}`,
              { x: () => -window.innerWidth },
              { x: () => window.innerWidth, duration: 0.72 },
              0,
            )
            .fromTo(
              `.${styles.handoffEditorial}`,
              { opacity: 0 },
              { opacity: 1, duration: 0.22 },
              0.12,
            )
            .to(
              `.${styles.experienceContent}`,
              { x: -24, opacity: 0.46, duration: 0.58 },
              0,
            )
            .fromTo(
              `.${styles.handoffTitle} b`,
              { yPercent: 108 },
              { yPercent: 0, stagger: 0.08, duration: 0.32 },
              0.2,
            )
            .fromTo(
              `.${styles.handoffKicker}, .${styles.handoffIndex}`,
              { y: 10, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.06, duration: 0.24 },
              0.38,
            )
        })

        return () => media.revert()
      }, rootRef)
    }

    void setup()
    return () => {
      cancelled = true
      context?.revert()
      smoothScrollCleanup?.()
    }
  }, [])

  return (
    <div ref={rootRef} className={styles.root}>
      <a className={styles.skipLink} href="#about">
        Skip to content
      </a>
      <Hero />
      <About
        selected={aboutIndex}
        setSelected={setAboutIndex}
        scrollProgress={aboutProgress}
      />
      <SignalDivider />
      <Skills />
      <CableDivider />
      <Experience
        selected={experienceIndex}
        setSelected={setExperienceIndex}
        projectDividerRef={projectDividerRef}
      />
      <Work />
      <Contact />
      <TransportBridge
        progress={progress}
        activeId={activeId}
        compact={transportCompact}
      />
    </div>
  )
}
