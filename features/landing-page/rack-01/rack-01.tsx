'use client'

import Image from 'next/image'
import Link from 'next/link'
import Lenis from 'lenis'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { EncryptedText } from '@/components/encrypted-text'
import { BrokenLightText } from '@/components/broken-light-text'
import { DawHero } from '../components/hero'
import {
  EMAIL,
  EXPERIENCES,
  MIXER_DATA,
  PROJECTS_SHOWCASE,
  SOCIAL_LINKS_LANDING,
} from '../constants'
import styles from './rack-01.module.css'
import { cn } from '@/lib/utils'

const RESUME_URL =
  'https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing'

const HERO_MARQUEE_ITEMS = [
  'AH / STUDIO ONLINE',
  '12 INTERACTIVE AUDIO-VISUAL INSTRUMENTS',
  'SIGNAL LOCKED // 48.0 KHZ 24-BIT',
  'FRONTEND ENGINEERING & MOTION DESIGN',
  'JAKARTA, ID',
  '120.00 BPM SYNCHRONIZED',
  'SELECT ANY DECK TO PLAY',
  'DISCIPLINED INTERFACES & CREATIVE CODE',
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
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/music', label: 'Mixtape' },
  { href: '/bookmarks', label: 'Bookmarks' },
] as const

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
        <span>{eyebrow}</span>
        <span className={styles.sectionSysCode}>SYS—{index}</span>
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
    <aside
      ref={dropdownRef}
      className={`${styles.transport} ${
        compact ? styles.transportCompact : styles.transportDocked
      }`}
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
    </aside>
  )
}

function Hero() {
  return (
    <section id="home" className={styles.hero} data-rack-section>
      <div className={styles.heroStage}>
        <div
          className={styles.heroDeviceWall}
          aria-label="Interactive collection of music devices"
        >
          <DawHero backgroundOnly />
        </div>
        <div className={styles.heroViewfinderScrim} aria-hidden="true" />
        <div className={styles.heroViewfinder} aria-hidden="true">
          <span className={styles.viewfinderCornerTopLeft} />
          <span className={styles.viewfinderCornerTopRight} />
          <span className={styles.viewfinderCornerBottomLeft} />
          <span className={styles.viewfinderCornerBottomRight} />
          <div className={styles.viewfinderReticle}>
            <i />
          </div>
          <div className={styles.viewfinderTelemetryTop}>
            <span className={styles.viewfinderRecording}>REC</span>
            <span>
              <EncryptedText
                text="CAM A / DEVICE WALL"
                revealDelayMs={40}
                encryptedClassName={styles.encryptedChar}
              />
            </span>
          </div>
          <div className={styles.viewfinderTelemetryRight}>
            <span>4K</span>
            <span>24 FPS</span>
            <span>48 KHZ</span>
          </div>
        </div>

        <header className={styles.topline}>
          <a
            href="#home"
            className={styles.wordmark}
            aria-label="AH STUDIO home"
          >
            AH <span>/ STUDIO</span>
          </a>
          <nav className={styles.heroRouteNav} aria-label="Primary pages">
            {ROUTE_ITEMS.map((item, index) => (
              <a href={item.href} key={item.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <a href={`mailto:${EMAIL}`} className={styles.topContact}>
            CONTACT ↗
          </a>
        </header>

        <div className={styles.heroMarqueeBar} aria-hidden="true">
          <div className={styles.heroMarqueeTrack}>
            {[...HERO_MARQUEE_ITEMS, ...HERO_MARQUEE_ITEMS].map(
              (item, index) => (
                <span key={index} className={styles.heroMarqueeItem}>
                  <span className={styles.heroMarqueeItemDot} />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className={styles.heroViewfinderReadout}>
          <div className={styles.heroViewfinderLabel}>
            <EncryptedText
              text="FRONTEND ENGINEER / CREATIVE DEVELOPER"
              revealDelayMs={35}
              encryptedClassName={styles.encryptedChar}
              scrambleOnHover
            />
            <span className={styles.heroViewfinderStatus}>
              <i /> LIVE SIGNAL
            </span>
          </div>

          <div className={styles.heroViewfinderIdentity}>
            <h1 aria-label="ADITYA HIMAONE">
              <span className={styles.heroLine}>
                <BrokenLightText
                  text="ADITYA"
                  mode="settle"
                  // glowColor="#ff5a1f"
                />
              </span>
              <span className={styles.heroLine}>
                <BrokenLightText
                  text="HIMA"
                  mode="settle"
                  // glowColor="#ff5a1f"
                />
                <em>
                  <BrokenLightText
                    text="ONE"
                    mode="settle"
                    glowColor="#e0b75a"
                  />
                </em>
              </span>
            </h1>
            <p>
              Building expressive, high-performance digital products through
              thoughtful interfaces, systems, and motion.
            </p>
          </div>

          <div className={styles.heroViewfinderActions}>
            <span>
              <EncryptedText
                text="12 DEVICES / JAKARTA, ID"
                revealDelayMs={40}
                encryptedClassName={styles.encryptedChar}
              />
            </span>
            <div className={styles.heroActions}>
              <a href="#work" className={styles.primaryButton}>
                <span>VIEW SELECTED WORK</span>
                <ArrowDownRight size={18} aria-hidden="true" />
              </a>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className={styles.resumeButton}
                aria-label="Download resume PDF"
              >
                <span>DOWNLOAD RESUME</span>
                <Download size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <SilkscreenLabel>
            COLLECTION / 12 INTERACTIVE INSTRUMENTS
          </SilkscreenLabel>
          <a
            href="#about"
            className={styles.scrollAction}
            aria-label="Scroll down to about section"
          >
            <span>JAKARTA, ID / SELECT A DEVICE /</span>
            <EncryptedText
              text="SCROLL"
              revealDelayMs={45}
              encryptedClassName={styles.encryptedChar}
              scrambleOnHover
            />
            <span className={styles.scrollArrow}>↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}

const ABOUT_TRACKS = [
  {
    title: 'EXPERIENCE',
    note: '2022—NOW / PRODUCT TEAMS',
    metric: '04+',
    metricLabel: 'YEARS BUILDING',
    heading: 'Four years turning product complexity into shipped interfaces.',
    body: 'I lead frontend development across product teams — from job-seeker platforms serving 15K+ users to HR systems — turning unclear requirements into reliable experiences people can actually use.',
    signal: 'YEARS / IN PRACTICE',
    surface: '#d7b36f',
    ink: '#2c251b',
    accent: '#8a432d',
    detail:
      'Four-plus years leading frontend builds for products serving 15K+ users.',
  },
  {
    title: 'CRAFT',
    note: 'DESIGN / MOTION / CODE',
    metric: '03',
    metricLabel: 'CONNECTED DISCIPLINES',
    heading: 'Design, motion, and engineering tuned as one practice.',
    body: 'I work across the three disciplines instead of handing ideas between silos, keeping the concept intact from first frame to production code.',
    signal: 'DISCIPLINES / CONNECTED',
    surface: '#8199ad',
    ink: '#17252d',
    accent: '#315d72',
    detail:
      'Design, motion, and engineering stay connected from concept to ship.',
  },
  {
    title: 'PRACTICE',
    note: 'DISCOVER / DESIGN / BUILD',
    metric: '01',
    metricLabel: 'INTEGRATED SYSTEM',
    heading: 'One process that carries the signal from question to release.',
    body: 'I discover the real constraint, design the interaction, and build the durable system—without losing the reason the work began.',
    signal: 'PROCESS / END TO END',
    surface: '#b68ba5',
    ink: '#30212a',
    accent: '#70415d',
    detail:
      'One end-to-end practice carries each idea from discovery to release.',
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
        <SectionHeading index="02" eyebrow="SIGNAL SOURCE">
          I turn complex ideas into clear, playable systems.
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
                    RECORD {String(index + 1).padStart(2, '0')} / {track.signal}
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
            <div className={styles.aboutPhaseIndex} aria-hidden="true">
              {ABOUT_TRACKS.map((item, index) => (
                <span
                  key={item.title}
                  className={index === selected ? styles.phaseIndexActive : ''}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
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
                <span>120 BPM / 4—4</span>
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
  const topNarrative = [
    'CONVERTING COMPLEX SIGNALS INTO ELEGANT SYSTEMS',
    'DISCIPLINED INTERFACES',
    'INTENTIONAL MOTION',
    'CRAFTED FOR HUMANS AT SCALE',
    'WHERE CONCEPT MEETS LIVING ARCHITECTURE',
  ]

  const bottomNarrative = [
    'NEXT.JS & TYPESCRIPT RIGOR',
    'HIGH-PERFORMANCE MOTION CRAFT',
    'SCALED ACROSS PRODUCT TEAMS FOR 15K+ USERS',
    'DIGITAL PRODUCTS TUNED TO SHIP',
    'INTERACTIVE CODE IN PRODUCTION',
  ]

  return (
    <section
      className={styles.signalDivider}
      aria-label="Signal Bridge: Architecture meets living code."
    >
      <div className={styles.signalDividerStage}>
        {/* Top Track (Light Chassis / System Architecture) */}
        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneTop}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerTopRail}`}
          >
            {Array.from({ length: 3 }, (_, groupIndex) => (
              <div className={styles.signalDividerTrackGroup} key={groupIndex}>
                {topNarrative.map((phrase, pIdx) => (
                  <span className={styles.signalDividerPhrase} key={pIdx}>
                    <span className={styles.signalDividerTrackIndex}>
                      02.{pIdx + 1}
                    </span>
                    <strong>{phrase}</strong>
                    <i className={styles.signalDividerGlyph}>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Center Console: Signal Router Bridge Module */}
        <div className={styles.signalBridgeConsole}>
          <Screw className={styles.signalScrewLeft} />
          <Screw className={styles.signalScrewRight} />
          <div className={styles.signalBridgeLeft}>
            <div className={styles.signalBridgeStatus}>
              <i />
              <span>SIGNAL ROUTE</span>
            </div>
            <strong>02 // ARCHITECTURE ➔ 03 // INSTRUMENTS</strong>
          </div>
          <div className={styles.signalBridgeCenter}>
            <div className={styles.signalBridgeMeter} aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <span>LOCKED // 48.0 kHz 24-BIT</span>
          </div>
          <div className={styles.signalBridgeRight}>
            <span>INTENT · MOTION · CODE</span>
            <strong>From system design to production ship.</strong>
          </div>
        </div>

        {/* Bottom Track (Dark Chassis / Living Code & Execution) */}
        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneBottom}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerBottomRail}`}
          >
            {Array.from({ length: 3 }, (_, groupIndex) => (
              <div className={styles.signalDividerTrackGroup} key={groupIndex}>
                {bottomNarrative.map((phrase, pIdx) => (
                  <span className={styles.signalDividerPhrase} key={pIdx}>
                    <span className={styles.signalDividerTrackIndexBottom}>
                      03.{pIdx + 1}
                    </span>
                    <strong>{phrase}</strong>
                    <i className={styles.signalDividerGlyphBottom}>✦</i>
                  </span>
                ))}
              </div>
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
          <SectionHeading index="03" eyebrow="MIDI MAP">
            A practical toolkit, mapped like an instrument.
          </SectionHeading>
          <p>
            Pads, encoders, faders, and keys restore the previous controller
            workflow inside the AH / STUDIO chassis.
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
              <strong>AH / MIDI CONTROL</strong>
              <SilkscreenLabel>ANALOG SKILL SYNTHESIZER</SilkscreenLabel>
            </div>

            {/* CRT Oscilloscope Screen */}
            <div className={styles.controllerDisplay} aria-live="polite">
              <div className={styles.displayHeader}>
                <span>STATUS: {isOn ? 'LIVE CARRIER 48.0kHz' : 'OFFLINE'}</span>
                <div className={styles.displayModeTags}>
                  {(['WAVE', 'SPECTRUM', 'TEL'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
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
                PAD BANK A / LANGUAGES (KEYS 1—6)
              </SilkscreenLabel>
              <div>
                {MIXER_DATA[0].channels.map((skill, index) => (
                  <button
                    type="button"
                    key={skill.name}
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
              <SilkscreenLabel>PARAM BANK B / FRAMEWORKS</SilkscreenLabel>
              <div>
                {MIXER_DATA[1].channels.map((skill, index) => (
                  <Knob
                    key={skill.name}
                    color={colors[index]}
                    label={skill.name}
                    value={levels[skill.name]}
                    onChange={(value) => updateLevel(skill.name, value)}
                  />
                ))}
              </div>
            </div>

            <div className={`${styles.controlBank} ${styles.faderBank}`}>
              <SilkscreenLabel>FADERS C / TOOLS + FX</SilkscreenLabel>
              <div>
                {MIXER_DATA[2].channels.map((skill) => (
                  <label key={skill.name}>
                    <output>{levels[skill.name]}</output>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={levels[skill.name]}
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
            aria-label="Playable skill keyboard (Keys A—L)"
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
                    <span className={styles.wheelTickCenter}>—</span>
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
          <span>SIGNAL PATH / 03—04</span>
          <strong>Turning capability into experience.</strong>
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

function Experience({
  selected,
  setSelected,
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
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
        <SectionHeading index="04" eyebrow="TAPE ARCHIVE">
          Recorded experience. Still in motion.
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
              <span className={styles.radioSpeakerBadge}>R—01</span>
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
                  const theme = CASSETTE_THEMES[index % CASSETTE_THEMES.length]
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
          <div className={styles.deckButtons} aria-label="Experience controls">
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
    </section>
  )
}

function balanceIndent(
  text: string,
  leftIndent: number,
  totalLength: number,
): string {
  const padded = text.padStart(text.length + leftIndent, ' ')
  return padded.padEnd(totalLength, ' ')
}

const SPLIT_FLAP_ROWS = [
  {
    from: ''.padEnd(60, ' '),
    to: ''.padEnd(60, ' '),
    isFlipping: false,
  },
  {
    from: balanceIndent(
      '04 YEARS EXPERIENCE ARCHIVED ────────> STATUS: LOGGED',
      4,
      60,
    ),
    to: balanceIndent(
      '05 FEATURED RELEASES DEPARTING ─────> STATUS: ACTIVE',
      4,
      60,
    ),
    isFlipping: true,
  },
  {
    from: balanceIndent(
      'MASTER INTERFACE CONSOLE CLOSED ─────> GATE: 04 CLOSED',
      4,
      60,
    ),
    to: balanceIndent(
      'SELECTED WORK RELEASES ON AIR ─────> GATE: 05 BOARDING',
      4,
      60,
    ),
    isFlipping: true,
  },
  {
    from: balanceIndent(
      'SYSTEMS & MOTION CRAFT LOGGED ──────> DEPT: ARCHIVE',
      4,
      60,
    ),
    to: balanceIndent(
      'DIGITAL PRODUCTS READY TO SHIP ────> DEPT: SHIPPED',
      4,
      60,
    ),
    isFlipping: true,
  },
  {
    from: ''.padEnd(60, ' '),
    to: ''.padEnd(60, ' '),
    isFlipping: false,
  },
] as const

const SPLIT_FLAP_MOBILE_ROWS = [
  {
    from: ''.padEnd(20, ' '),
    to: ''.padEnd(20, ' '),
    isFlipping: false,
  },
  {
    from: balanceIndent('04 YRS EXP ARCHIVED', 1, 20),
    to: balanceIndent('05 RELEASES DEPART', 1, 20),
    isFlipping: true,
  },
  {
    from: balanceIndent('ARCHIVE LOG: CLOSED', 1, 20),
    to: balanceIndent('PROJECTS: BOARDING', 1, 20),
    isFlipping: true,
  },
  {
    from: balanceIndent('SYS / MOTION CRAFT', 1, 20),
    to: balanceIndent('PRODUCTS READY SHIP', 1, 20),
    isFlipping: true,
  },
  {
    from: ''.padEnd(20, ' '),
    to: ''.padEnd(20, ' '),
    isFlipping: false,
  },
] as const

interface SplitFlapCellProps {
  from: string
  to: string
  isFlipping?: boolean
  rowIndex: number
  colIndex: number
}

const SplitFlapCell = memo(function SplitFlapCell({
  from,
  to,
  isFlipping = true,
  rowIndex = 0,
  colIndex = 0,
}: SplitFlapCellProps) {
  const isBlank = from === ' ' && to === ' '
  const shouldFlip = isFlipping && from !== to
  const source = from === ' ' ? '\u00a0' : from
  const target = shouldFlip ? (to === ' ' ? '\u00a0' : to) : source

  // High performance static mechanical tile for blank or unchanging tiles (renders full Solari look without 3D overhead)
  if (!shouldFlip || isBlank) {
    return (
      <span className={styles.splitFlapCell} aria-hidden="true">
        <span className={styles.splitFlapStaticChar}>{source}</span>
        <i />
      </span>
    )
  }

  // Active mechanical flipping tile with cascading row-by-row and col-by-col delay
  return (
    <span
      className={styles.splitFlapCell}
      data-flipping="true"
      style={
        {
          '--flap-row': rowIndex,
          '--flap-col': colIndex,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <span className={`${styles.splitFlapHalf} ${styles.splitFlapStaticTop}`}>
        <span>{target}</span>
      </span>
      <span
        className={`${styles.splitFlapHalf} ${styles.splitFlapStaticBottom}`}
      >
        <span>{source}</span>
      </span>
      <span className={`${styles.splitFlapHalf} ${styles.splitFlapTop}`}>
        <span>{source}</span>
      </span>
      <span className={`${styles.splitFlapHalf} ${styles.splitFlapBottom}`}>
        <span>{target}</span>
      </span>
      <i />
    </span>
  )
})

function SplitFlapDivider() {
  return (
    <section
      className={styles.splitFlapDivider}
      aria-label="Experience archived. Featured projects now departing."
    >
      <div className={styles.splitFlapBoard} aria-hidden="true">
        <div className={styles.splitFlapInner}>
          <div className={styles.splitFlapPanel}>
            <div className={styles.splitFlapHeader}>
              <span>
                <i /> AH STUDIO // DEPARTURE BOARD
              </span>
              <span>SCROLL TO BOARD RELEASE</span>
            </div>
            <div className={styles.splitFlapGrid}>
              {SPLIT_FLAP_ROWS.flatMap((row, rowIndex) =>
                Array.from(row.from).map((character, columnIndex) => {
                  const targetChar = row.to[columnIndex] ?? ' '
                  return (
                    <SplitFlapCell
                      from={character}
                      to={targetChar}
                      isFlipping={row.isFlipping}
                      rowIndex={rowIndex}
                      colIndex={columnIndex}
                      key={`${rowIndex}-${columnIndex}`}
                    />
                  )
                }),
              )}
            </div>
            <div className={styles.splitFlapStatus}>
              <span>OUTPUT / 05</span>
              <strong>READY FOR BOARDING</strong>
            </div>
          </div>
          <div className={styles.splitFlapMobile}>
            <div className={styles.splitFlapMobileHeader}>
              <span>
                <i /> AH STUDIO // DEPARTURE BOARD
              </span>
              <span>SYS-05</span>
            </div>
            <div className={styles.splitFlapMobileGrid} aria-hidden="true">
              {SPLIT_FLAP_MOBILE_ROWS.flatMap((row, rowIndex) =>
                Array.from(row.from).map((character, columnIndex) => {
                  const targetChar = row.to[columnIndex] ?? ' '
                  return (
                    <SplitFlapCell
                      from={character}
                      to={targetChar}
                      isFlipping={row.isFlipping}
                      rowIndex={rowIndex}
                      colIndex={columnIndex}
                      key={`m-${rowIndex}-${columnIndex}`}
                    />
                  )
                }),
              )}
            </div>
            <div className={styles.splitFlapMobileStatus}>
              <span>OUTPUT / 05</span>
              <strong>BOARDING</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className={styles.work} data-rack-section>
      <div className={styles.workStage}>
        <div className={styles.workHeader}>
          <SectionHeading index="05" eyebrow="FEATURED RELEASES">
            Selected output from the archive.
          </SectionHeading>
          <div className={styles.workHint}>
            <span>DRAG / SCROLL</span>
            <span>01—{String(PROJECTS_SHOWCASE.length).padStart(2, '0')}</span>
          </div>
        </div>
        <div className={styles.workViewport}>
          <div className={styles.workRail}>
            {PROJECTS_SHOWCASE.map((project, index) => {
              const palette = PROJECT_PALETTES[index % PROJECT_PALETTES.length]
              const releaseNumber = String(index + 1).padStart(2, '0')

              return (
                <article
                  className={styles.projectModule}
                  key={project.id}
                  style={
                    {
                      '--record-color': palette.vinyl,
                      '--record-label': palette.label,
                      '--record-accent': palette.accent,
                    } as React.CSSProperties
                  }
                >
                  <Screw className={styles.projectScrewLeft} />
                  <Screw className={styles.projectScrewRight} />
                  <div className={styles.projectMeta}>
                    <SilkscreenLabel>
                      AH / STUDIO · REL—{releaseNumber} / {project.year}
                    </SilkscreenLabel>
                    <span>33⅓ RPM · STEREO</span>
                  </div>
                  <div className={styles.projectMedia}>
                    <div className={styles.projectSleeve}>
                      <div className={styles.projectImage}>
                        <Image
                          src={project.image}
                          alt={`${project.title} project cover`}
                          fill
                          sizes="(max-width: 768px) 72vw, 34vw"
                        />
                        <span className={styles.imageScan} />
                        <span className={styles.projectCoverLabel}>
                          <b>{releaseNumber}</b>
                          <small>{project.genre}</small>
                        </span>
                      </div>
                      <span className={styles.projectSleeveSpine}>
                        {project.title} · {project.year}
                      </span>
                    </div>
                    <div className={styles.projectTurntable} aria-hidden="true">
                      <span className={styles.projectVinyl}>
                        <i />
                        <b>
                          REL
                          <br />
                          {releaseNumber}
                        </b>
                      </span>
                    </div>
                  </div>
                  <div className={styles.projectCopy}>
                    <div className={styles.projectTitleBlock}>
                      <span>
                        TRACK {releaseNumber} / {project.genre}
                      </span>
                      <h3>{project.title}</h3>
                    </div>
                    <p>{project.description}</p>
                    <span
                      className={styles.projectWaveform}
                      aria-hidden="true"
                    />
                    <a href={project.url} target="_blank" rel="noreferrer">
                      PLAY RELEASE <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
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

const PAD_COLORS = [
  '#9b6cff',
  '#d85fe8',
  '#ef4f98',
  '#f04462',
  '#54d987',
  '#38d2cf',
  '#3f9df2',
  '#656ee9',
  '#f0bd45',
  '#dce84c',
  '#8bd950',
  '#48cf67',
  '#ef5947',
  '#f27d3f',
  '#f19d3f',
  '#eab84b',
] as const

function Contact() {
  const [activePad, setActivePad] = useState<number | null>(0)
  const [bpm, setBpm] = useState(120)
  const [sequentialLitPadIndices, setSequentialLitPadIndices] = useState<
    Set<number>
  >(new Set())

  const contactRef = useRef<HTMLDivElement>(null)
  const activeTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  const launchPads = Array.from({ length: 16 }, (_, index) => ({
    label:
      SOCIAL_LINKS_LANDING[index]?.label ??
      (index === 4
        ? 'EMAIL'
        : index === 5
          ? 'RESUME'
          : `PAD ${String(index + 1).padStart(2, '0')}`),
    link:
      SOCIAL_LINKS_LANDING[index]?.link ??
      (index === 4 ? `mailto:${EMAIL}` : index === 5 ? RESUME_URL : undefined),
    color: index === 5 ? '#f0bd45' : PAD_COLORS[index],
  }))

  useEffect(() => {
    const el = contactRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          // Clear active wave timers
          activeTimeoutsRef.current.forEach((t) => clearTimeout(t))
          activeTimeoutsRef.current.clear()

          // Group 16 pads by diagonal distance row + col (0 to 6) in 4x4 grid
          const diagonalGroups = new Map<number, number[]>()
          for (let index = 0; index < 16; index++) {
            const row = Math.floor(index / 4)
            const col = index % 4
            const diag = row + col
            if (!diagonalGroups.has(diag)) {
              diagonalGroups.set(diag, [])
            }
            diagonalGroups.get(diag)!.push(index)
          }

          const sortedDiagonals = Array.from(diagonalGroups.keys()).sort(
            (a, b) => a - b,
          )

          const stepDelay = 60 // ms per diagonal step
          const singleWaveDuration = sortedDiagonals.length * stepDelay + 220
          const pauseBetweenWaves = 180
          const initialDelay = 150 // start quickly when shown

          const runSweepWave = (waveIndex: number) => {
            sortedDiagonals.forEach((diag, stepIndex) => {
              const indices = diagonalGroups.get(diag) ?? []

              const onTimeout = setTimeout(() => {
                setSequentialLitPadIndices((prev) => {
                  const next = new Set(prev)
                  indices.forEach((idx) => next.add(idx))
                  return next
                })

                const offTimeout = setTimeout(() => {
                  setSequentialLitPadIndices((prev) => {
                    const next = new Set(prev)
                    indices.forEach((idx) => next.delete(idx))
                    return next
                  })
                }, 220)

                activeTimeoutsRef.current.set(
                  `wave-off-${waveIndex}-${diag}`,
                  offTimeout,
                )
              }, stepIndex * stepDelay)

              activeTimeoutsRef.current.set(
                `wave-on-${waveIndex}-${diag}`,
                onTimeout,
              )
            })
          }

          // Run 3x diagonal sweeps from top-left to bottom-right
          for (let wave = 0; wave < 3; wave++) {
            const waveStartTime =
              initialDelay + wave * (singleWaveDuration + pauseBetweenWaves)
            const waveTimer = setTimeout(() => {
              runSweepWave(wave)
            }, waveStartTime)

            activeTimeoutsRef.current.set(`wave-run-${wave}`, waveTimer)
          }
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      activeTimeoutsRef.current.forEach((t) => clearTimeout(t))
      activeTimeoutsRef.current.clear()
    }
  }, [])

  return (
    <section
      ref={contactRef}
      id="contact"
      className={styles.contact}
      data-rack-section
    >
      <div className={styles.patchHeader}>
        <SectionHeading index="06" eyebrow="OUTPUT ROUTING">
          Have a signal worth sending?
        </SectionHeading>
        <a className={styles.contactButton} href={`mailto:${EMAIL}`}>
          <Mail size={18} /> START A TRANSMISSION
        </a>
      </div>
      <div className={styles.contactSignal} aria-hidden="true">
        <div className={styles.contactSignalTrack}>
          {Array.from({ length: 2 }, (_, group) => (
            <div className={styles.contactSignalGroup} key={group}>
              <span>OPEN CHANNEL</span>
              <span>IDEAS IN / PRODUCTS OUT</span>
              <span>JAKARTA → WORLDWIDE</span>
              <span>RESPONSE TIME / 24—48H</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.patchbay}>
        <div className={styles.patchScreen}>
          <div className={styles.contactScreenStatus}>
            <SilkscreenLabel>MASTER OUTPUT / READY</SilkscreenLabel>
            <span>
              <i /> CHANNEL OPEN
            </span>
          </div>
          <strong className={styles.contactHeadline}>
            <span>LET’S MAKE</span>
            <span>
              SOMETHING <em>PLAY.</em>
            </span>
          </strong>
          <div className={styles.contactWaveform} aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <span>JAKARTA / AVAILABLE WORLDWIDE</span>
        </div>
        <div className={styles.contactLaunchpad}>
          <Screw className={styles.screwTopLeft} />
          <Screw className={styles.screwTopRight} />
          <div className={styles.launchpadTopbar}>
            <div>
              <strong>AH / LAUNCH</strong>
              <SilkscreenLabel>16 PAD PERFORMANCE ROUTER</SilkscreenLabel>
            </div>
            <div className={styles.launchpadTransport}>
              <label>
                BPM{' '}
                <input
                  type="range"
                  min="60"
                  max="160"
                  value={bpm}
                  onChange={(event) => setBpm(Number(event.target.value))}
                />
              </label>
              <SegmentCounter value={String(bpm)} />
              <button
                type="button"
                onClick={() => setActivePad(null)}
                aria-label="Clear all pads"
              >
                <Square size={12} />
              </button>
            </div>
          </div>
          <div className={styles.launchpadHeader}>
            <div>
              <SilkscreenLabel>ACTIVE ROUTE / MIDI CH 01</SilkscreenLabel>
              <strong>{launchPads[activePad ?? 0].label}</strong>
            </div>
            <SegmentCounter
              value={`P${String((activePad ?? 0) + 1).padStart(2, '0')}`}
            />
          </div>
          <div className={styles.launchpadGrid}>
            {launchPads.map((pad, index) => {
              const isPadLit =
                activePad === index || sequentialLitPadIndices.has(index)
              const className = `${styles.launchPad} ${
                isPadLit ? styles.launchPadActive : ''
              }`
              const content = (
                <>
                  <i className={styles.launchPadLed} aria-hidden="true" />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{pad.label}</strong>
                </>
              )

              return pad.link ? (
                <a
                  className={className}
                  href={pad.link}
                  target="_blank"
                  rel="noreferrer"
                  key={pad.label}
                  onClick={() => setActivePad(index)}
                  aria-current={isPadLit ? 'true' : undefined}
                  style={
                    {
                      '--pad-index': index,
                      '--pad-color': pad.color,
                    } as React.CSSProperties
                  }
                >
                  {content}
                </a>
              ) : (
                <button
                  className={className}
                  type="button"
                  key={`${pad.label}-${index}`}
                  aria-pressed={isPadLit}
                  onClick={() =>
                    setActivePad((current) =>
                      current === index ? null : index,
                    )
                  }
                  style={
                    {
                      '--pad-index': index,
                      '--pad-color': pad.color,
                    } as React.CSSProperties
                  }
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} ADITYA HIMA[ONE/WAN]</span>
        <span>DESIGNED + ENGINEERED IN JAKARTA</span>
        <a href="#home">REWIND TO 00:00 ↑</a>
      </footer>
    </section>
  )
}

export default function Rack01LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
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
          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.hero}`,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.7,
              },
            })
            .to(
              `.${styles.heroLine}`,
              { yPercent: -6, stagger: 0.06, ease: 'none' },
              0,
            )
            .to(
              `.${styles.heroViewfinderReadout}`,
              { y: -18, opacity: 0.76, ease: 'none' },
              0,
            )

          gsap.to(`.${styles.heroDeviceWall}`, {
            yPercent: 3,
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.hero}`,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
            },
          })

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

          const storyHeadings = gsap.utils.toArray<HTMLElement>(
            `.${styles.sectionHeading}`,
          )
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
            { y: 42, scale: 0.97, opacity: 0.5 },
            {
              y: 0,
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

          gsap.to(`.${styles.projectVinyl}`, {
            rotate: 540,
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
                const next = Math.min(
                  EXPERIENCES.length - 1,
                  Math.floor(self.progress * EXPERIENCES.length),
                )
                setExperienceIndex((current) =>
                  current === next ? current : next,
                )
              },
            },
          })

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
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })
          }
        })

        const dividerTopRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerTopRail}`,
        )
        const dividerBottomRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerBottomRail}`,
        )

        if (dividerTopRail && dividerBottomRail) {
          const dividerTravel = () =>
            window.innerWidth < 769
              ? Math.min(240, Math.max(130, window.innerWidth * 0.42))
              : Math.min(150, window.innerWidth * 0.11)
          const railScrollTrigger = {
            trigger: `.${styles.signalDivider}`,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
            invalidateOnRefresh: true,
          }

          gsap.fromTo(
            dividerTopRail,
            { x: () => -dividerTravel() },
            {
              x: () => dividerTravel(),
              force3D: true,
              ease: 'none',
              scrollTrigger: railScrollTrigger,
            },
          )

          gsap.fromTo(
            dividerBottomRail,
            { x: () => dividerTravel() },
            {
              x: () => -dividerTravel(),
              force3D: true,
              ease: 'none',
              scrollTrigger: { ...railScrollTrigger },
            },
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

        const splitFlapDivider = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.splitFlapDivider}`,
        )

        if (splitFlapDivider) {
          ScrollTrigger.create({
            trigger: splitFlapDivider,
            start: 'top 75%',
            end: 'bottom 20%',
            onEnter: () =>
              splitFlapDivider.setAttribute('data-flipped', 'true'),
            onLeaveBack: () => splitFlapDivider.removeAttribute('data-flipped'),
          })
        }

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
      <Experience selected={experienceIndex} setSelected={setExperienceIndex} />
      <SplitFlapDivider />
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
