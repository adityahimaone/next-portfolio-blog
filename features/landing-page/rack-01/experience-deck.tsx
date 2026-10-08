'use client'

import { useEffect, useState } from 'react'
import {
  CassetteFace,
  cassetteAccentVars,
  cassetteThemeVars,
} from './cassette-face'
import { SilkscreenLabel } from './primitives'
import styles from './rack-01.module.css'
import { Screw } from '@/components/ui/screw'
import { EXPERIENCES } from '../constants'

const STATIONS = [88.5, 94.2, 100.8, 106.5]

const NEEDLE_POSITIONS = [8, 36, 64, 92]

const KNOB_ROTATIONS = [0, 135, 270, 405]

/**
 * The field radio deck: the Experience section's
 * instrument, and — when the radio flip is on — the front
 * face of the radio body (see
 * chapters/experience-work/radio-stage.tsx).
 *
 * Extracted verbatim from section-experience.tsx so the
 * deck renders identically in both layouts: the flip
 * moves the markup into the radio's front face, it does
 * not redraw it. `selected`/`setSelected` stay owned by
 * the page, which drives the same state from the
 * flip chapter's tune phase and from these controls.
 */
export function ExperienceDeck({
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
            data-anim="tape-carousel"
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
                  style={cassetteThemeVars(index)}
                >
                  {/* The same face the eject handoff clones, so the
                      cassette that leaves the bay is drawn by the same
                      markup as the one sitting in it. */}
                  <CassetteFace index={index} />
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
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selected === index}
                key={item.id}
                onClick={() => setSelected(index)}
                style={cassetteAccentVars(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.company}</strong>
                <small>{item.period}</small>
              </button>
            )
          })}
        </div>
        <div
          className={styles.experienceNotes}
          role="tabpanel"
          /* The panel scrolls when a long note list overflows its 140px
             band, and it holds no focusable children — so a keyboard user
             had no way to scroll it and could only reach what already fit.
             `tabindex="0"` makes the scrollbar itself focusable, which is
             what lets arrow keys move the content. `aria-label` names it
             for the same reason: a tabpanel with no accessible name is
             announced as an unlabelled group. */
          tabIndex={0}
          aria-label={`${experience.type} details`}
        >
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
  )
}
