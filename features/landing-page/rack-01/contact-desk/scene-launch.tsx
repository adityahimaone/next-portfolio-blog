'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { CONTACT_PAD_COLORS } from '../../constants'
import { FAQ_ITEMS, TRACKS, type FaqEntry } from './contact-content'
import styles from './scene-launch.module.css'
import { createEngine, type Engine, type EngineView } from './scene-engine'
import { BPM, moveFocus, tracksOf, waveformBars } from './scene-logic'
import { useReveal } from './use-reveal'

/** One accent per track, taken from the controller's own pad colours. */
const TRACK_COLORS = [
  CONTACT_PAD_COLORS[0],
  CONTACT_PAD_COLORS[1],
  CONTACT_PAD_COLORS[3],
]

const INITIAL: EngineView = {
  selected: null,
  playing: null,
  queued: null,
  played: [],
}

function Wave({
  seed,
  count,
  lit,
}: {
  seed: string
  count: number
  lit?: boolean
}) {
  const bars = useMemo(() => waveformBars(seed, count), [seed, count])
  const row = bars.map((h, i) => (
    <i key={i} style={{ '--h': h, '--b': i } as CSSProperties} />
  ))
  return (
    <span className={styles.wave} aria-hidden="true" data-lit={lit}>
      <span className={styles.waveBase}>{row}</span>
      <span className={styles.waveLit}>{row}</span>
    </span>
  )
}

/**
 * The FAQ, as a second unit on the same desk as the performance controller.
 *
 * It is built from the controller's own materials (the graphite chassis, the
 * green-phosphor LCD, the pad colours) and borrows one idea from clip-launching
 * instruments: **a clip does not start when you press it, it starts on the next
 * beat.** Each question is a clip with its own waveform. Pressing one queues it
 * (it blinks), the next beat of a live 120 BPM clock launches it, and its
 * answer then *plays*: a playhead crosses the clip, the answer types out in
 * step with it on the LCD, and the waveform lights as the playhead passes.
 *
 * ## How it is wired
 *
 * A single `requestAnimationFrame` loop owns the clock. It does three things
 * per frame and nothing else: advance the beat (a `data-beat` on the unit,
 * which CSS turns into LED and pulse animation), launch a queued clip on a beat
 * boundary, and advance a playing clip (a `--p` custom property on the clip and
 * on the master, the typed text, the time). None of that is React state, so a
 * playing clip is sixty DOM writes a second and no renders. React state changes
 * only on a transition: queued, playing, finished.
 *
 * The loop runs while the unit is on screen or a clip is playing, and stops
 * otherwise. With reduced motion there is no loop: a press selects the clip and
 * its whole answer appears at once.
 *
 * ## What it keeps from a real FAQ
 *
 * Real buttons in a roving-tabindex grid (arrows move between tracks and
 * clips, Enter or Space launches, Escape stops); the answer in an `aria-live`
 * region, once and whole, while the typed copy is `aria-hidden`; a `#hash` deep
 * link per question; and, without a script, every question and answer as plain
 * text.
 */
export function SceneLaunch({ email }: { email: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [reveal, revealState] = useReveal<HTMLElement>(0.2)
  const tracks = useMemo(() => tracksOf(FAQ_ITEMS), [])
  const counts = useMemo(() => tracks.map((t) => t.clips.length), [tracks])

  const [view, setView] = useState<EngineView>(INITIAL)
  const [auto, setAuto] = useState(false)
  const [copied, setCopied] = useState(false)
  const [focus, setFocus] = useState<[number, number]>([0, 0])

  const sheen = useRef<HTMLDivElement | null>(null)
  const master = useRef<HTMLDivElement | null>(null)
  const typed = useRef<HTMLSpanElement | null>(null)
  const timeEl = useRef<HTMLElement | null>(null)
  const barEl = useRef<HTMLElement | null>(null)
  const clips = useRef<(HTMLButtonElement | null)[]>([])
  const engine = useRef<Engine | null>(null)

  // The playback machine lives outside React; see `scene-engine.ts`.
  useEffect(() => {
    const instance = createEngine({
      items: FAQ_ITEMS,
      setView,
      reduced: () =>
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      els: {
        unit: () => reveal.current,
        master: () => master.current,
        typed: () => typed.current,
        time: () => timeEl.current,
        bar: () => barEl.current,
        clip: (index) => clips.current[index],
      },
    })
    engine.current = instance
    return () => {
      instance.destroy()
      engine.current = null
    }
  }, [reveal])

  useEffect(() => {
    engine.current?.setAuto(auto)
  }, [auto])

  // The loop runs while the unit is on screen.
  useEffect(() => {
    const node = reveal.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      engine.current?.setVisible(entries.some((e) => e.isIntersecting))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reveal])

  // A #hash that names a question launches it at once and brings it into view.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      const index = FAQ_ITEMS.findIndex((item) => item.id === id)
      if (index < 0) return
      engine.current?.launch(index, true)
      const track = tracks.findIndex((t) =>
        t.clips.some((c) => c.index === index),
      )
      const row = tracks[track]?.clips.findIndex((c) => c.index === index) ?? 0
      setFocus([track, row])
      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      window.setTimeout(
        () =>
          reveal.current?.scrollIntoView({
            block: 'center',
            behavior: still ? 'auto' : 'smooth',
          }),
        80,
      )
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [tracks, reveal])

  // The unit arrives mid-performance: shortly after it powers on, the first
  // clip queues itself, unless the visitor has already done something.
  useEffect(() => {
    if (revealState !== 'in') return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(
      () => {
        if (!engine.current?.touched()) engine.current?.launch(0)
      },
      still ? 0 : 1400,
    )
    return () => window.clearTimeout(id)
  }, [revealState])

  const press = (index: number) => {
    // Pressing the clip that is playing or queued stops it and shows the whole
    // answer; pressing any other launches that one.
    if (view.playing === index || view.queued === index) {
      engine.current?.stop()
      return
    }
    engine.current?.launch(index)
    history.replaceState(
      history.state,
      '',
      `${window.location.pathname}${window.location.search}#${FAQ_ITEMS[index].id}`,
    )
  }

  const onKeyDown = (event: KeyboardEvent, track: number, row: number) => {
    if (event.key === 'Escape') {
      engine.current?.stop()
      return
    }
    const to = moveFocus(event.key, track, row, counts)
    if (!to) return
    event.preventDefault()
    setFocus(to)
    clips.current[tracks[to[0]].clips[to[1]].index]?.focus()
  }

  const copyLink = async () => {
    if (view.selected === null) return
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${FAQ_ITEMS[view.selected].id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* The hash is already in the address bar. */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const next = () => {
    engine.current?.launch(((view.selected ?? -1) + 1) % FAQ_ITEMS.length)
  }

  // The light on the chassis follows the pointer. The custom properties live on
  // one childless element, so moving the pointer restyles that and nothing else.
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    sheen.current?.style.setProperty('--mx', `${event.clientX - box.left}px`)
    sheen.current?.style.setProperty('--my', `${event.clientY - box.top}px`)
  }

  const current: FaqEntry | null =
    view.selected === null ? null : FAQ_ITEMS[view.selected]
  const trackIndex = current ? TRACKS.indexOf(current.track) : -1
  const stateOf = (index: number) =>
    view.playing === index
      ? 'playing'
      : view.queued === index
        ? 'queued'
        : view.played.includes(index)
          ? 'played'
          : 'idle'

  return (
    <section
      ref={reveal}
      className={styles.unit}
      data-reveal={revealState}
      data-beat="0"
      aria-labelledby={`${uid}-title`}
      onPointerMove={onPointerMove}
    >
      <div className={styles.sheen} ref={sheen} aria-hidden="true" />

      <header className={styles.brand}>
        <div>
          <strong id={`${uid}-title`}>AH / SCENE LAUNCH</strong>
          <span>
            FAQ · {FAQ_ITEMS.length} CLIPS · {TRACKS.length} TRACKS
          </span>
        </div>
        <div className={styles.transport}>
          <span className={styles.readout} aria-hidden="true">
            {BPM} BPM
          </span>
          <span className={styles.readout} aria-hidden="true">
            <b ref={barEl}>BAR 01.1</b>
          </span>
          <button
            type="button"
            className={styles.key}
            onClick={() => engine.current?.stop()}
          >
            <i aria-hidden="true" className={styles.stopIcon} />
            Stop
          </button>
          <button
            type="button"
            className={styles.key}
            aria-pressed={auto}
            onClick={() => setAuto((v) => !v)}
          >
            Auto
          </button>
        </div>
      </header>

      <div
        ref={master}
        className={styles.master}
        data-state={
          view.playing !== null
            ? 'playing'
            : view.queued !== null
              ? 'queued'
              : 'idle'
        }
        style={
          {
            '--c':
              trackIndex >= 0
                ? TRACK_COLORS[trackIndex]
                : 'var(--lcd-green, #5cd6a3)',
          } as CSSProperties
        }
      >
        <div className={styles.masterTop} aria-hidden="true">
          <span>
            {current
              ? `NOW ${view.playing !== null ? 'PLAYING' : view.queued !== null ? 'CUEING' : 'LOADED'} · ${current.track.toUpperCase()} · CLIP ${String(view.selected! + 1).padStart(2, '0')}`
              : 'MASTER OUT · STANDBY'}
          </span>
          <span ref={timeEl}>00:00 / 00:00</span>
        </div>

        <div
          role="region"
          aria-live="polite"
          aria-label="Answer"
          className={styles.live}
        >
          <h3 className={styles.question}>
            {current
              ? current.question
              : 'Pick a clip. It starts on the next beat.'}
          </h3>
          {current ? <p className={styles.srOnly}>{current.answer}</p> : null}
        </div>
        <p className={styles.answer} aria-hidden="true">
          <span ref={typed} />
          <i className={styles.caret} />
        </p>

        <div className={styles.masterWave}>
          <Wave seed={current ? current.id : 'standby'} count={72} lit />
          <i className={styles.playhead} />
        </div>

        <div className={styles.tools}>
          <button type="button" onClick={next}>
            Next clip
          </button>
          <button type="button" onClick={copyLink} disabled={!current}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className={styles.tracks}>
        {tracks.map((track, t) => (
          <div
            key={track.name}
            role="group"
            aria-label={`${track.name} track`}
            className={styles.track}
            style={{ '--c': TRACK_COLORS[t] } as CSSProperties}
          >
            <div className={styles.trackHead}>
              <i aria-hidden="true" />
              <span>{track.name}</span>
              <small>{String(track.clips.length).padStart(2, '0')}</small>
            </div>
            {track.clips.map(({ item, index }, row) => {
              const state = stateOf(index)
              const selected = view.selected === index
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    clips.current[index] = node
                  }}
                  type="button"
                  className={styles.clip}
                  style={{ '--n': index } as CSSProperties}
                  data-state={state}
                  data-selected={selected}
                  aria-pressed={state === 'playing'}
                  tabIndex={focus[0] === t && focus[1] === row ? 0 : -1}
                  onClick={() => press(index)}
                  onFocus={() => setFocus([t, row])}
                  onKeyDown={(event) => onKeyDown(event, t, row)}
                >
                  <span className={styles.clipFill} aria-hidden="true" />
                  <span className={styles.clipHead} aria-hidden="true">
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <i className={styles.clipIcon} />
                  </span>
                  <span className={styles.clipTitle}>{item.question}</span>
                  <Wave seed={item.id} count={26} />
                  {state === 'queued' || state === 'playing' ? (
                    <span className={styles.srOnly}>
                      {state === 'queued' ? ' (queued)' : ' (playing)'}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <footer className={styles.foot}>
        <span className={styles.leds} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </span>
        <p>Press a clip. It launches on the next beat.</p>
        <a className={styles.cta} href={`mailto:${email}`}>
          Still unsure? Email me
        </a>
      </footer>

      {/* Without a script nothing can launch, so the whole FAQ is plain text. */}
      <noscript>
        <style>{`.${styles.tracks},.${styles.master},.${styles.transport},.${styles.foot}{display:none}`}</style>
        <dl className={styles.plain}>
          {FAQ_ITEMS.map((item) => (
            <div key={item.id}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </noscript>
    </section>
  )
}
