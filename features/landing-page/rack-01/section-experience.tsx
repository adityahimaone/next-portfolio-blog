'use client'

import { useEffect, useState } from 'react'
import { CASSETTE_THEMES } from './shared'
import { SilkscreenLabel } from './primitives'
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

const STATIONS = [88.5, 94.2, 100.8, 106.5]

const NEEDLE_POSITIONS = [8, 36, 64, 92]

const KNOB_ROTATIONS = [0, 135, 270, 405]

export function Experience({
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
              <span className={styles.cassetteHeaderMeta}>
                FM / AUX / TAPE ARCHIVE
                <b className={styles.radioHeaderStatus}>ON AIR</b>
              </span>
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
          </div>
        </div>
      </div>
    </section>
  )
}
