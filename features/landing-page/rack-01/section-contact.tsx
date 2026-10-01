'use client'

import { FOOTER_MOTTO, FOOTER_TANGLE_LINES, RESUME_URL } from './shared'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ScanLoader } from '../scan-loader'
import { TangleFooter } from '@/components/ui/tangle-footer'
import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'
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
import { SilkscreenLabel } from './primitives'

/**
 * The questions people actually ask before emailing, answered honestly.
 *
 * Written as straight answers rather than a sales pitch: the "React Native"
 * line is a no, because a portfolio that hedges on what it cannot do wastes the
 * reader's time and the writer's.
 *
 * No links live here. Pads 01 to 04 are Email, LinkedIn, GitHub and Résumé,
 * and a second list of the same four destinations below the deck made the pad
 * grid look like an oversight rather than the point.
 */
const CONTACT_QUESTIONS = [
  {
    question: 'What kind of work do you take on?',
    answer:
      'Frontend work where the hard part is the state or the edge cases rather than the styling: internal tools, content-heavy public sites, and products that need to work on a phone or on a bad connection.',
  },
  {
    question: 'Do you work with existing backends?',
    answer:
      'Mostly. Most of the shipped work is a frontend over an existing service. Running the infrastructure too is something I do when the product genuinely needs it.',
  },
  {
    question: 'Do you do React Native or native mobile?',
    answer:
      'No. The mobile work here is responsive web. The habit that matters transfers, but the stack does not, and I would rather say so than take it and hand it back.',
  },
  {
    question: 'What is your availability?',
    answer:
      'Frontend work, design engineering, and hard interface problems. Replies usually land within a couple of days.',
  },
] as const

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
  /*
    X, appended rather than inserted.

    The four link pads were Email, LinkedIn, GitHub and Résumé, which left X
    with nowhere to live once the duplicate link list below the deck was removed.
    Appending is the only safe way to add a pad: `triggerSound` special-cases
    absolute indices (5, 13 for the noise buffers) and the sweep derives its
    order from the array, so inserting at index 4 would re-map every note after
    it. The grid is `repeat(4, ...)` so this lands on a new row on its own.
  */
  {
    label: 'X',
    detail: 'Short-form notes',
    href: 'https://x.com/adityahimaone',
    note: 1174.66,
  },
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
  // Pad 17 (X). The array indexes by pad number, so a new pad needs a colour
  // at its own index or it renders with the previous pad's `--pad-color`.
  '#8a9199',
] as const

/**
 * The Bank A/B selector.
 *
 * Extracted so the desktop rail and the phone's bottom bar render the same
 * controls rather than two hand-copied blocks that can drift. It is a plain
 * presentational component over the deck's state — no rail measurement lives
 * here, so nothing about it depends on which layout it lands in.
 */
function BankCluster({
  bank,
  onSelect,
}: {
  bank: 'A' | 'B'
  onSelect: (next: 'A' | 'B') => void
}) {
  return (
    <div className={styles.contactModeRail}>
      <button
        type="button"
        aria-pressed={bank === 'A'}
        aria-label="Use bank A"
        onClick={() => onSelect('A')}
      >
        A
      </button>
      <button
        type="button"
        aria-pressed={bank === 'B'}
        aria-label="Use bank B"
        onClick={() => onSelect('B')}
      >
        B
      </button>
      <span>Bank</span>
    </div>
  )
}

/** The mail link and the clear-pad key. Extracted for the same reason. */
function OutCluster({ onClear }: { onClear: () => void }) {
  return (
    <div className={styles.contactModeRail}>
      <a href={`mailto:${EMAIL}`} aria-label="Email Aditya">
        <Mail size={16} />
      </a>
      <button type="button" onClick={onClear} aria-label="Clear active pad">
        <Square size={14} />
      </button>
      <span>Out</span>
    </div>
  )
}

export function Contact() {
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

  const clearPads = useCallback(() => {
    setActivePad(null)
    setLoopingPads(new Set())
  }, [])

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
          {/*
            On a desktop the rails flank the pad grid, one on each side, so the
            Bank and Out clusters read as the two ends of the grid rather than
            as a footnote under it.

            On a phone both clusters move to a single bar UNDER the grid — the
            side docks are hidden and this bar takes their place, so there is
            exactly one Bank and one Out on screen at any width. It is a second
            render of the same two components rather than a second copy of their
            markup, which is what `BankCluster` and `OutCluster` are for.
          */}
          <div className={styles.contactPerformanceRow}>
            <div className={styles.contactModeRailDock}>
              <BankCluster bank={bank} onSelect={setBank} />
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
                    target={
                      pad.href.startsWith('mailto:') ? undefined : '_blank'
                    }
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

            <div className={styles.contactModeRailDock}>
              <OutCluster onClear={clearPads} />
            </div>
          </div>

          {/* The phone's control bar: both clusters in one row under the grid.
              `display: none` above 768px, where the flanking docks are the ones
              on screen. */}
          <div className={styles.contactPadRailBar}>
            <BankCluster bank={bank} onSelect={setBank} />
            <OutCluster onClear={clearPads} />
          </div>
        </div>
        <p className={styles.contactDeckNote}>
          Pads 01 to 04 open a channel. Pads 05 to 16 play the instrument.
        </p>
      </div>

      {/*
        What used to be the standalone `/contact` route: the questions people
        actually ask before emailing, answered where the deck is.

        The four link channels this block used to carry are gone. Pads 01 to 04
        are already Email, LinkedIn, GitHub and Résumé, in the same controller,
        with the same numbers on them — so a second list below the deck said
        the same four things twice and made the pad grid look like an accident.
        One copy of a link is the point.

        The FAQ is a single column now rather than a two-up with that list. It
        has the deck to itself, so it can carry the contact section's whole
        subject instead of sharing a row with a duplicate.

        Placement is deliberate: between `.contactDeck` and `<footer>`, because
        `use-rack-animations.ts:444-522` queries specific children of
        `.contactDeck` by class name and applies 3D transforms to each. A child
        added in there would sit unanimated inside a moving container.

        `CONTACT_PADS` is untouched: its indices are hardcoded in `triggerSound`
        (5, 6, 10, 13, 4, 8, 12) and in the sweep order, so reordering or
        padding the array would re-map the audio.
      */}
      <div className={styles.contactBrief}>
        <SilkscreenLabel>BEFORE YOU WRITE</SilkscreenLabel>
        <dl className={styles.contactBriefFaq}>
          {CONTACT_QUESTIONS.map((entry) => (
            <div key={entry.question} className={styles.contactBriefFaqItem}>
              <dt>{entry.question}</dt>
              <dd>{entry.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerTransition} aria-hidden="true" />

        <div className={styles.footerDeck}>
          <div className={styles.footerPanel}>
            <div className={styles.footerBrand}>
              <span className={styles.footerBrandName}>Aditya Himawan</span>
              <span className={styles.footerBrandMeta}>
                © {currentYear} · adityahimaone.space
              </span>
            </div>

            <div className={styles.footerUnit}>
              <span className={styles.footerEmitter} aria-hidden="true">
                <ScanLoader className={styles.footerEmitterScan} />
              </span>
              <p className={styles.footerMotto}>{FOOTER_MOTTO}</p>
            </div>

            <div className={styles.footerControls}>
              <span className={styles.footerPower} aria-hidden="true" />
              <button
                type="button"
                className={styles.footerTop}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
              >
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footerSignal}>
          <span className={styles.footerLead} aria-hidden="true" />
          {/*
            No `height` prop. Passing 350 fixed the band at 350px on a desktop
            and let the component cap it to `width / 2` on a narrow one — which
            is correct geometry, but it left the rings' own 350px-tall drawing
            cropped to 195px at 390px wide, so the arcs were sliced through
            mid-ring. Deriving the band from its own width instead keeps the
            `width / 2` proportion the rings are built around, so the nest
            always fits the box and the page still closes on it.
          */}
          <TangleFooter
            className={styles.footerTangle}
            lines={[...FOOTER_TANGLE_LINES]}
            background="#0b0d0c"
            ribbon="#e7e2d8"
            textColor="#0b0d0c"
            seed={23}
            label="Rotating portfolio footer signal"
          />
        </div>
      </footer>
    </section>
  )
}
