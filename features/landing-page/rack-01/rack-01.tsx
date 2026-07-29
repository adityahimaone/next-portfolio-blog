'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { DawHero } from '../components/hero'
import {
  EMAIL,
  EXPERIENCES,
  MIXER_DATA,
  PROJECTS_SHOWCASE,
  SOCIAL_LINKS_LANDING,
} from '../constants'
import styles from './rack-01.module.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Exp' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const

const SKILLS = MIXER_DATA.flatMap((group) => group.channels)

function SilkscreenLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.silkscreen}>{children}</span>
}

function SegmentCounter({ value }: { value: string }) {
  return <span className={styles.segmentCounter}>{value}</span>
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
    <header className={styles.sectionHeading}>
      <SilkscreenLabel>
        {index} / {eyebrow}
      </SilkscreenLabel>
      <h2>{children}</h2>
    </header>
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
}: {
  progress: number
  activeId: string
}) {
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

  return (
    <aside
      className={styles.transport}
      aria-label="Page transport and section navigation"
    >
      <div className={styles.transportStatus}>
        <span className={styles.recordDot} aria-hidden="true" />
        <span>REC</span>
        <span className={styles.signalLock}>▶ SIGNAL LOCK</span>
      </div>
      <div
        className={styles.transportProgress}
        aria-label={`Scroll progress ${Math.round(progress * 100)}%`}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <SegmentCounter value={counter} />
      <nav className={styles.transportNav} aria-label="Portfolio sections">
        {NAV_ITEMS.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={activeId === item.id ? styles.navActive : undefined}
            aria-current={activeId === item.id ? 'location' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span> {item.label}
          </a>
        ))}
      </nav>
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
        <header className={styles.topline}>
          <a href="#home" className={styles.wordmark} aria-label="RACK-01 home">
            RACK—01 <span>/ AH</span>
          </a>
          <span className={styles.availability}>
            <i /> AVAILABLE FOR SELECTED PROJECTS
          </span>
          <a href={`mailto:${EMAIL}`} className={styles.topContact}>
            CONTACT ↗
          </a>
        </header>

        <div className={styles.heroIdentity}>
          <div className={styles.heroStatus}>
            <SilkscreenLabel>DEVICE WALL / SYSTEM ONLINE</SilkscreenLabel>
            <span>
              <i /> 12 MODULES CONNECTED
            </span>
          </div>
          <h1 aria-label="Adityahimaone">
            <span className={styles.heroLine}>ADITYA</span>
            <span className={styles.heroLine}>
              HIMA<em>ONE</em>
            </span>
          </h1>
          <div className={styles.heroIdentityFooter}>
            <p>
              Frontend engineer and creative developer building expressive,
              high-performance digital products.
            </p>
            <a href="#work" className={styles.primaryButton}>
              <span>PLAY SELECTED WORK</span>
              <ArrowDownRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <SilkscreenLabel>JAKARTA, ID / 06°12′S 106°49′E</SilkscreenLabel>
          <span>SELECT A DEVICE / SCROLL TO ADVANCE ↓</span>
        </div>
      </div>
    </section>
  )
}

const ABOUT_TRACKS = [
  {
    title: 'DISCOVER',
    note: 'Listen / frame / map',
    detail:
      'I turn ambiguity into a clear product model before touching pixels.',
  },
  {
    title: 'DESIGN',
    note: 'Prototype / tune / align',
    detail:
      'Systems, motion, and interaction are tuned together—not as polish later.',
  },
  {
    title: 'DELIVER',
    note: 'Build / test / ship',
    detail:
      'Production code stays fast, accessible, and easy for teams to evolve.',
  },
]

function About() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0.08)
  const [activeClip, setActiveClip] = useState(0)
  const [mutedTracks, setMutedTracks] = useState<Set<number>>(new Set())
  const [soloedTrack, setSoloedTrack] = useState<number | null>(null)

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
      <SectionHeading index="02" eyebrow="SIGNAL SOURCE">
        I turn complex ideas into clear, playable systems.
      </SectionHeading>
      <div className={styles.aboutDeck}>
        <div className={styles.aboutCopy}>
          <p className={styles.lead}>
            A frontend developer who cares equally about architecture, feel, and
            the tiny timing details people notice without naming.
          </p>
          <div className={styles.aboutStats}>
            <div>
              <SegmentCounter value="08+" />
              <span>YEARS BUILDING</span>
            </div>
            <div>
              <SegmentCounter value="03" />
              <span>ACTIVE CHANNELS</span>
            </div>
            <div>
              <SegmentCounter value="∞" />
              <span>CURIOSITY</span>
            </div>
          </div>
        </div>
        <div className={styles.timelinePanel}>
          <Screw className={styles.screwTopLeft} />
          <Screw className={styles.screwTopRight} />
          <div className={styles.timelineDeviceBrand}>
            <div>
              <strong>RACK—01</strong>
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
                  setPlayhead(0.08)
                }}
                aria-label="Stop and rewind timeline"
              >
                <Square size={12} />
              </button>
              <span>120 BPM / 4—4</span>
            </div>
          </div>
          <div className={styles.timelineRuler}>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <div
            className={styles.playhead}
            style={
              { '--playhead': `${playhead * 100}%` } as React.CSSProperties
            }
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
            >
              <div>
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
              <button
                type="button"
                className={`${styles.clip} ${
                  activeClip === index ? styles.clipActive : ''
                }`}
                style={
                  { '--clip-offset': `${index * 12}%` } as React.CSSProperties
                }
                onClick={() => setActiveClip(index)}
                aria-pressed={activeClip === index}
              >
                <span>{item.note}</span>
                <i />
              </button>
            </div>
          ))}
          <div className={styles.clipDetail} aria-live="polite">
            <SilkscreenLabel>
              CLIP {String(activeClip + 1).padStart(2, '0')} / SELECTED
            </SilkscreenLabel>
            <p>{ABOUT_TRACKS[activeClip].detail}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Skills() {
  const [activeSkill, setActiveSkill] = useState(SKILLS[0])
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(SKILLS.map((skill) => [skill.name, skill.level])),
  )
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const colors = ['#2e3f5c', '#c9a574', '#8b8d8a', '#ff5a1f']

  const updateLevel = (name: string, value: number) => {
    setLevels((current) => ({ ...current, [name]: value }))
    const skill = SKILLS.find((item) => item.name === name)
    if (skill) setActiveSkill({ ...skill, level: value })
  }

  return (
    <section
      id="skills"
      className={`${styles.section} ${styles.skills}`}
      data-rack-section
    >
      <div className={styles.skillsIntro}>
        <SectionHeading index="03" eyebrow="MIDI MAP">
          A practical toolkit, mapped like an instrument.
        </SectionHeading>
        <p>
          Pads, encoders, faders, and keys restore the previous controller
          workflow inside the RACK—01 chassis.
        </p>
      </div>
      <div className={styles.controller}>
        <Screw className={styles.screwTopLeft} />
        <Screw className={styles.screwTopRight} />
        <Screw className={styles.screwBottomLeft} />
        <Screw className={styles.screwBottomRight} />
        <div className={styles.controllerTopbar}>
          <div>
            <strong>RACK—01 / MIDI</strong>
            <SilkscreenLabel>SKILL CONTROL SURFACE</SilkscreenLabel>
          </div>
          <div className={styles.controllerDisplay} aria-live="polite">
            <span>ACTIVE PROGRAM</span>
            <strong>{activeSkill.name}</strong>
            <SegmentCounter
              value={`${String(levels[activeSkill.name] ?? activeSkill.level).padStart(3, '0')}%`}
            />
          </div>
          <span className={styles.powerSwitch}>
            <i /> PWR
          </span>
        </div>
        <div className={styles.controllerBanks}>
          <div className={`${styles.controlBank} ${styles.padBank}`}>
            <SilkscreenLabel>PAD BANK A / LANGUAGES</SilkscreenLabel>
            <div>
              {MIXER_DATA[0].channels.map((skill, index) => (
                <button
                  type="button"
                  key={skill.name}
                  aria-pressed={activeSkill.name === skill.name}
                  onClick={() => setActiveSkill(skill)}
                  className={
                    activeSkill.name === skill.name
                      ? styles.padActive
                      : undefined
                  }
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
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
        <div
          className={styles.keyboardBed}
          aria-label="Playable skill keyboard"
        >
          <div className={styles.pitchControls}>
            <span>PITCH</span>
            <i />
            <span>MOD</span>
            <i />
          </div>
          <div className={styles.controllerKeys}>
            <div className={styles.whiteKeys}>
              {Array.from({ length: 14 }, (_, index) => (
                <button
                  type="button"
                  key={index}
                  aria-label={`Play white key ${index + 1}`}
                  aria-pressed={activeKey === index}
                  onPointerDown={() => setActiveKey(index)}
                  onPointerUp={() => setActiveKey(null)}
                  onPointerCancel={() => setActiveKey(null)}
                  onPointerLeave={() => setActiveKey(null)}
                />
              ))}
            </div>
            <div className={styles.blackKeys} aria-label="Sharp and flat keys">
              {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((whiteKeyIndex, index) => (
                <button
                  type="button"
                  key={whiteKeyIndex}
                  aria-label={`Play black key ${index + 1}`}
                  aria-pressed={activeKey === index + 14}
                  style={
                    {
                      '--key-position': `${((whiteKeyIndex + 1) / 14) * 100}%`,
                    } as React.CSSProperties
                  }
                  onPointerDown={() => setActiveKey(index + 14)}
                  onPointerUp={() => setActiveKey(null)}
                  onPointerCancel={() => setActiveKey(null)}
                  onPointerLeave={() => setActiveKey(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
            <span>RACK—01 / FIELD RADIO</span>
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
                  <strong>98.70</strong>
                  <small>MHz / STEREO</small>
                </div>
                <div className={styles.frequencyScale}>
                  {[88, 92, 96, 100, 104, 108].map((frequency) => (
                    <span key={frequency}>{frequency}</span>
                  ))}
                  <i />
                </div>
                <div className={styles.radioDials}>
                  <span>
                    <i />
                    VOL
                  </span>
                  <span>
                    <i />
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
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelected(index)}
                      aria-pressed={offset === 0}
                      className={`${styles.cassette} ${offset === 0 ? styles.cassetteActive : offset < 0 ? styles.cassettePrevious : styles.cassetteNext}`}
                    >
                      <span className={styles.cassetteBrand}>
                        RACK—01 / TYPE II
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
                        <b />
                        <span className={styles.tapeWheel}>
                          {Array.from({ length: 6 }, (_, i) => (
                            <i key={i} />
                          ))}
                        </span>
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
              {EXPERIENCES.map((item, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected === index}
                  key={item.id}
                  onClick={() => setSelected(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.company}</strong>
                  <small>{item.period}</small>
                </button>
              ))}
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
            {PROJECTS_SHOWCASE.map((project, index) => (
              <article className={styles.projectModule} key={project.id}>
                <Screw className={styles.projectScrewLeft} />
                <Screw className={styles.projectScrewRight} />
                <div className={styles.projectMeta}>
                  <SilkscreenLabel>
                    REL—{String(index + 1).padStart(2, '0')} / {project.year}
                  </SilkscreenLabel>
                  <span>{project.genre}</span>
                </div>
                <div className={styles.projectImage}>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 84vw, 48vw"
                  />
                  <span className={styles.imageScan} />
                </div>
                <div className={styles.projectCopy}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <a href={project.url} target="_blank" rel="noreferrer">
                    OPEN RELEASE <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [activePad, setActivePad] = useState<number | null>(0)
  const [bpm, setBpm] = useState(120)
  const launchPads = Array.from({ length: 32 }, (_, index) => ({
    label:
      SOCIAL_LINKS_LANDING[index]?.label ??
      (index === 4 ? 'EMAIL' : `PAD ${String(index + 1).padStart(2, '0')}`),
    link:
      SOCIAL_LINKS_LANDING[index]?.link ??
      (index === 4 ? `mailto:${EMAIL}` : undefined),
  }))

  return (
    <section id="contact" className={styles.contact} data-rack-section>
      <div className={styles.patchHeader}>
        <SectionHeading index="06" eyebrow="OUTPUT ROUTING">
          Have a signal worth sending?
        </SectionHeading>
        <a className={styles.contactButton} href={`mailto:${EMAIL}`}>
          <Mail size={18} /> START A TRANSMISSION
        </a>
      </div>
      <div className={styles.patchbay}>
        <div className={styles.patchScreen}>
          <SilkscreenLabel>MASTER OUTPUT / READY</SilkscreenLabel>
          <strong>
            LET’S MAKE
            <br />
            SOMETHING <em>PLAY.</em>
          </strong>
          <span>JAKARTA / AVAILABLE WORLDWIDE</span>
        </div>
        <div className={styles.contactLaunchpad}>
          <Screw className={styles.screwTopLeft} />
          <Screw className={styles.screwTopRight} />
          <div className={styles.launchpadTopbar}>
            <div>
              <strong>RACK—01 / LAUNCH</strong>
              <SilkscreenLabel>32 PAD PERFORMANCE ROUTER</SilkscreenLabel>
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
              const className = `${styles.launchPad} ${
                activePad === index ? styles.launchPadActive : ''
              }`
              const content = (
                <>
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
                  style={{ '--pad-index': index } as React.CSSProperties}
                >
                  {content}
                </a>
              ) : (
                <button
                  className={className}
                  type="button"
                  key={`${pad.label}-${index}`}
                  aria-pressed={activePad === index}
                  onClick={() =>
                    setActivePad((current) =>
                      current === index ? null : index,
                    )
                  }
                  style={{ '--pad-index': index } as React.CSSProperties}
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} ADITYA HIMAWAN</span>
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
  const [experienceIndex, setExperienceIndex] = useState(0)

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(
          max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0,
        )
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
              { yPercent: -10, stagger: 0.08, ease: 'none' },
              0,
            )
            .to(
              `.${styles.heroIdentity}`,
              { yPercent: -6, scale: 0.985, ease: 'none' },
              0,
            )
            .to(
              `.${styles.heroStatus}, .${styles.heroIdentityFooter}`,
              { opacity: 0.35, ease: 'none' },
              0.08,
            )

          gsap.to(`.${styles.heroDeviceWall}`, {
            yPercent: 5,
            scale: 1.035,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.hero}`,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
            },
          })

          gsap.from(`.${styles.controlBank}`, {
            y: 18,
            opacity: 0.55,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.controller}`,
              start: 'top 82%',
              end: 'top 38%',
              scrub: 0.45,
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
        return () => media.revert()
      }, rootRef)
    }

    void setup()
    return () => {
      cancelled = true
      context?.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className={styles.root}>
      <a className={styles.skipLink} href="#about">
        Skip to content
      </a>
      <Hero />
      <About />
      <Skills />
      <Experience selected={experienceIndex} setSelected={setExperienceIndex} />
      <Work />
      <Contact />
      <TransportBridge progress={progress} activeId={activeId} />
    </div>
  )
}
