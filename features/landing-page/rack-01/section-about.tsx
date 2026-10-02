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
import { RESUME_URL } from './shared'
import { Screw } from '@/components/ui/screw'
import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'
const ABOUT_TRACKS = [
  {
    title: 'FOCUS',
    note: 'REACT / NEXT.JS / TYPESCRIPT',
    metric: '04+',
    metricLabel: 'YEARS IN FRONTEND',
    heading: 'Start with the user.',
    signal: 'PRIMARY PRACTICE',
    surface: '#d7b36f',
    ink: '#2c251b',
    accent: '#8a432d',
    detail: 'Understand the interaction before shaping the interface.',
    // The card's whole prose, one block. It used to be two: a `body` sentence
    // and a `story` paragraph that opened by restating it. RANGE was the worst
    // case — the body appeared word for word at the start of the story. The body
    // is gone and its one good sentence now opens the story instead.
    story:
      'I begin with the interaction, not the component, because the component is the cheap part to get right. Four years of production frontends, most of them React and Next.js on systems where the interface is load-bearing rather than decorative.',
    credits: [
      { name: 'Bisadaya', note: 'Job platform · 15K users' },
      { name: '80&Company', note: 'HR management · Kyoto' },
    ],
  },
  {
    title: 'SYSTEMS',
    note: 'FEATURES / DATA / DELIVERY',
    metric: 'SSR',
    metricLabel: 'RENDERING',
    heading: 'Build the system.',
    signal: 'FRONTEND ARCHITECTURE',
    surface: '#8199ad',
    ink: '#17252d',
    accent: '#315d72',
    detail: 'Create a frontend system that can carry the next feature.',
    story:
      'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent. The structure underneath the first screen decides whether the next six months are cheap or expensive: typed data at the boundary, rendering chosen per route rather than by default.',
    credits: [
      { name: 'Primarindo Asia', note: 'Manufacturing · Jakarta' },
      { name: 'Niqcode', note: 'Product studio · Partner' },
    ],
  },
  {
    title: 'RANGE',
    note: 'BACKEND / AUTOMATION / INFRA',
    metric: 'VPS',
    metricLabel: 'SELF-HOSTED',
    heading: 'Stay close to production.',
    signal: 'ADDITIONAL EXPERIENCE',
    surface: '#b68ba5',
    ink: '#30212a',
    accent: '#70415d',
    detail: 'Keep the product visible and dependable after it ships.',
    // Trimmed to fit the card. At the previous wording this story measured 87px
    // of text against an 83px row, so the last line was being cut off behind the
    // foot's internal scroll. Four characters shorter per line is the whole
    // difference; the meaning is unchanged.
    story:
      'I work across application data, deployment and monitoring when the frontend needs more than a polished screen. This site runs on a VPS behind Nginx, watched by Prometheus and Grafana, which is why the writing here is about what broke.',
    // No credits row on this card, and that is deliberate.
    //
    // It carries the availability line and the résumé as well, which makes its
    // foot 89px against 46px on the other two. Because the rail is uniform and
    // the story row is `1fr`, that extra 43px came straight out of the story:
    // RANGE got a 29px slot for 87px of copy and the last two lines printed
    // through the credits. Measured, not eyeballed.
    //
    // Unzyp Solusi and Campus Connect are not lost — they appear in the
    // experience cassettes above and in the Work section's credits, which is
    // where a reader looks for an employer rather than a track label.
    //
    // The availability line: on exactly one card. Repeating it on all three is
    // the redundancy this move was meant to remove, and it sits on the last
    // track because that is where a reader has finished reading and is deciding
    // what to do next.
    //
    // The résumé is separate from the prose because it is a link, and a link
    // cannot live inside the card's button — that made it unreachable by
    // keyboard and screen reader. It renders beside the card instead.
    aside: (
      <>
        Based in Jakarta. Available for frontend, design engineering and hard
        interface work.
      </>
    ),
    resumeLink: RESUME_URL,
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
                /* The card is a button with the résumé link as its only real
                   action, so the link used to be rendered INSIDE it. A focusable
                   descendant of a button is not reachable — screen readers
                   announce the button as one control and the link is skipped
                   entirely, and axe flags it as nested-interactive. So the link
                   is lifted out here, beside the card rather than inside it.

                   `aside` is split into the prose (which stays in the button, so
                   selecting the card still reads as selecting the whole track)
                   and `resumeLink`, which renders as its own control. */
                <div className={styles.aboutCardSlot} key={track.title}>
                  <button
                    type="button"
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
                    {/*
                      The card's prose, credits and availability line.

                      These used to be split three ways: a `body` sentence here, the
                      longer story in the shared clip panel, and the résumé line
                      beside it. A reader saw the same idea in the card and then
                      again in the panel below, and the body sentence was restated
                      at the top of the story. Now there is one block per card and
                      the panel is back to being the clip readout it was built as.

                      Order inside the card: story, then the foot on the bottom
                      edge. The foot is whatever that track has — two credits on
                      FOCUS and SYSTEMS, the availability line on RANGE, and never
                      both, because a taller foot on one card squeezes the shared
                      `1fr` story row on that card alone.
                    */}
                    <p className={styles.aboutCardStory}>{track.story}</p>
                    <div className={styles.aboutCardFoot}>
                      {track.credits ? (
                        <ul className={styles.aboutCardCredits}>
                          {track.credits.map((credit) => (
                            <li key={credit.name}>
                              <b>{credit.name}</b>
                              <span>{credit.note}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {track.aside ? (
                        <p className={styles.aboutCardAside}>{track.aside}</p>
                      ) : null}
                    </div>
                    <span className={styles.aboutCardLabel}>{track.title}</span>
                  </button>
                  {track.resumeLink ? (
                    <a
                      className={styles.aboutCardResume}
                      href={track.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Résumé (PDF)
                    </a>
                  ) : null}
                </div>
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
                {/*
                  The story, credits and résumé line used to sit here as well,
                  which meant every card said one thing and this panel said it
                  again. They now live on the card that owns them; the panel is
                  back to being the clip readout it was designed as.
                */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
