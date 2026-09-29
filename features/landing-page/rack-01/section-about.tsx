'use client'

import { useEffect, useState } from 'react'
import { SilkscreenLabel, VenLogo } from './primitives'
import styles from './rack-01.module.css'
import { SectionHeading } from './section-heading'
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Pause,
  Play,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/ui/screw'
import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'
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

export function About({
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
            <div className={styles.timelineWorkspace}>
              <div className={styles.timelineDeviceBrand}>
                <div className={styles.timelineBrandMark}>
                  <VenLogo />
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
                      index === ABOUT_TRACKS.length - 1 ? styles.trackLast : ''
                    } ${
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
      </div>
    </section>
  )
}
