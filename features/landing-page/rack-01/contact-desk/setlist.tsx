'use client'

import {
  Fragment,
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
import { FAQ_ITEMS, SIDES, TRACKS, type FaqEntry } from './contact-content'
import { createEngine, type Engine, type EngineView } from './scene-engine'
import { linearFocus, tracksOf, wordsOf } from './scene-logic'
import styles from './setlist.module.css'
import { useReveal } from './use-reveal'

/** One accent per side, taken from the controller's own pad colours. */
const SIDE_COLORS = [
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

const two = (n: number) => String(n).padStart(2, '0')

/**
 * The FAQ, as a printed setlist and a lyric sheet, set straight onto the
 * section's own graph paper. No chassis, no screen, no panel: type, rules and
 * one stage to read on.
 *
 * ## The idea
 *
 * The questions are songs. They are listed in running order in three groups
 * (Side A, Side B, Encore), and a song does not start when you press it, it
 * starts on the next beat of a live 120 BPM clock, which is what makes a press
 * feel performed. Its answer then plays as **a lyric sheet**: the whole answer
 * is set in big type at once, so nothing reflows, and the words light up one
 * after another as the playhead passes, with a highlighter block riding the
 * word being sung. A scribble draws itself under the playing title, a giant
 * outlined numeral behind the stage kicks on the beat, and a lamp that follows
 * the pointer lights the graph paper under it.
 *
 * ## How it is wired
 *
 * The playback machine is `scene-engine.ts` and it never touches React for the
 * per-frame work. It writes one number, `--p` (0 to 1), onto the stage and onto
 * the playing song, and every visual here is CSS arithmetic on that number: a
 * word's brightness is `clamp(0, p·n − i, 1)` for its index `i` out of `n`, the
 * highlighter is a parabola in the same distance (so it peaks on the current
 * word and is zero on either side of it), the scribble is a dash offset. A
 * playing song is sixty custom-property writes a second and no renders.
 *
 * ## What it keeps from a real FAQ
 *
 * Real buttons in a keyboard list (up and down walk it, Home and End jump,
 * Enter or Space plays, Escape stops); the answer announced once, whole, in a
 * polite live region while the animated copy is `aria-hidden`; a `#hash` deep
 * link per question and a Copy link; and, without a script, every question and
 * answer as plain text. Reduced motion is a complete alternative: no clock, no
 * beat, no sweep, and a press selects a song and lights the whole lyric.
 */
export function Setlist({ email }: { email: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [reveal, revealState] = useReveal<HTMLElement>(0.15)
  const tracks = useMemo(() => tracksOf(FAQ_ITEMS), [])

  const [view, setView] = useState<EngineView>(INITIAL)
  const [auto, setAuto] = useState(false)
  const [copied, setCopied] = useState(false)
  const [focus, setFocus] = useState(0)

  const lamp = useRef<HTMLDivElement | null>(null)
  const stage = useRef<HTMLDivElement | null>(null)
  const timeEl = useRef<HTMLSpanElement | null>(null)
  const songs = useRef<(HTMLLIElement | null)[]>([])
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
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
        master: () => stage.current,
        typed: () => null,
        time: () => timeEl.current,
        bar: () => null,
        clip: (index) => songs.current[index],
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

  // The loop runs while the setlist is on screen.
  useEffect(() => {
    const node = reveal.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      engine.current?.setVisible(entries.some((e) => e.isIntersecting))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reveal])

  // A #hash that names a question plays it at once and brings it into view.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      const index = FAQ_ITEMS.findIndex((item) => item.id === id)
      if (index < 0) return
      engine.current?.launch(index, true)
      setFocus(index)
      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      window.setTimeout(
        () =>
          reveal.current?.scrollIntoView({
            block: 'start',
            behavior: still ? 'auto' : 'smooth',
          }),
        80,
      )
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [reveal])

  // It arrives mid-performance: shortly after the setlist is on the page, the
  // first song queues itself, unless the visitor has already done something.
  useEffect(() => {
    if (revealState !== 'in') return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(
      () => {
        if (!engine.current?.touched()) engine.current?.launch(0)
      },
      still ? 0 : 1500,
    )
    return () => window.clearTimeout(id)
  }, [revealState])

  const press = (index: number) => {
    // Pressing the song that is playing or queued stops it and lights the whole
    // lyric; pressing any other plays that one.
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
    // On a narrow screen the stage sits above the list; bring it into view.
    if (window.matchMedia('(max-width: 900px)').matches) {
      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      stage.current?.scrollIntoView({
        block: 'nearest',
        behavior: still ? 'auto' : 'smooth',
      })
    }
  }

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key === 'Escape') {
      engine.current?.stop()
      return
    }
    const to = linearFocus(event.key, index, FAQ_ITEMS.length)
    if (to < 0) return
    event.preventDefault()
    setFocus(to)
    buttons.current[to]?.focus()
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

  // The lamp follows the pointer. Its custom properties live on one childless
  // element, so moving the pointer restyles that and nothing else.
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    lamp.current?.style.setProperty('--mx', `${event.clientX - box.left}px`)
    lamp.current?.style.setProperty('--my', `${event.clientY - box.top}px`)
  }

  const current: FaqEntry | null =
    view.selected === null ? null : FAQ_ITEMS[view.selected]
  const side = current ? TRACKS.indexOf(current.track) : -1
  const words = useMemo(
    () => (current ? wordsOf(current.answer) : []),
    [current],
  )
  const status =
    view.playing !== null
      ? 'Now playing'
      : view.queued !== null
        ? 'Cueing'
        : current
          ? 'Loaded'
          : 'Standing by'
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
      className={styles.set}
      data-reveal={revealState}
      data-beat="0"
      aria-labelledby={`${uid}-title`}
      onPointerMove={onPointerMove}
    >
      <div className={styles.lamp} ref={lamp} aria-hidden="true" />

      <header className={styles.head}>
        <h3 id={`${uid}-title`}>Before you write</h3>
        <span aria-hidden="true">
          {two(FAQ_ITEMS.length)} songs · {TRACKS.length} sides
        </span>
      </header>

      <div className={styles.grid}>
        <div className={styles.list}>
          {tracks.map((track, t) => (
            <div
              key={track.name}
              role="group"
              aria-label={`${SIDES[track.name]}: ${track.name}`}
              className={styles.side}
              style={{ '--c': SIDE_COLORS[t] } as CSSProperties}
            >
              <div className={styles.sideHead} aria-hidden="true">
                <i />
                <span>{SIDES[track.name]}</span>
                <em>{track.name}</em>
              </div>
              <ol className={styles.songs}>
                {track.clips.map(({ item, index }) => {
                  const state = stateOf(index)
                  return (
                    <li
                      key={item.id}
                      ref={(node) => {
                        songs.current[index] = node
                      }}
                      className={styles.song}
                      style={{ '--n': index } as CSSProperties}
                      data-state={state}
                      data-selected={view.selected === index}
                    >
                      <button
                        ref={(node) => {
                          buttons.current[index] = node
                        }}
                        type="button"
                        className={styles.songBtn}
                        aria-pressed={state === 'playing'}
                        tabIndex={focus === index ? 0 : -1}
                        onClick={() => press(index)}
                        onFocus={() => setFocus(index)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                      >
                        <span className={styles.num} aria-hidden="true">
                          {two(index + 1)}
                        </span>
                        <span className={styles.title}>
                          {item.question}
                          <svg
                            className={styles.scribble}
                            viewBox="0 0 120 8"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <path
                              pathLength={1}
                              d="M1 5 C 14 1, 28 8, 44 4 S 76 1, 92 5 S 112 7, 119 3"
                            />
                          </svg>
                        </span>
                        <i className={styles.icon} aria-hidden="true" />
                        {state === 'queued' || state === 'playing' ? (
                          <span className={styles.srOnly}>
                            {state === 'queued' ? ' (queued)' : ' (playing)'}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>

        <div
          ref={stage}
          className={styles.stage}
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
                side >= 0 ? SIDE_COLORS[side] : 'var(--deck-orange, #ff5a1f)',
              '--n': words.length,
              '--k': view.selected ?? 0,
            } as CSSProperties
          }
        >
          <span
            key={view.selected ?? 'none'}
            className={styles.ghost}
            data-playing={view.playing !== null}
            aria-hidden="true"
          >
            {current ? two(view.selected! + 1) : '··'}
          </span>

          <p className={styles.meta} aria-hidden="true">
            <span>
              {status}
              {current ? ` · ${SIDES[current.track]}` : ''}
            </span>
            <span ref={timeEl}>00:00 / 00:00</span>
          </p>

          <div role="region" aria-live="polite" aria-label="Answer">
            <h4 className={styles.q}>
              {current
                ? current.question
                : 'Pick a song. It starts on the next beat.'}
            </h4>
            {current ? <p className={styles.srOnly}>{current.answer}</p> : null}
          </div>

          <p className={styles.lyrics} aria-hidden="true">
            {words.map((word, i) => (
              <Fragment key={`${view.selected}-${i}`}>
                <span
                  className={styles.w}
                  style={{ '--i': i } as CSSProperties}
                >
                  {word}
                </span>{' '}
              </Fragment>
            ))}
          </p>

          <div className={styles.rail} aria-hidden="true">
            {FAQ_ITEMS.map((item, i) => (
              <i
                key={item.id}
                className={styles.tick}
                data-on={view.selected === i}
                style={{ '--t': i } as CSSProperties}
              />
            ))}
            <b className={styles.cursor} />
          </div>

          <div className={styles.tools}>
            <button
              type="button"
              onClick={() =>
                engine.current?.launch(
                  ((view.selected ?? -1) + 1) % FAQ_ITEMS.length,
                )
              }
            >
              Next song
            </button>
            <button type="button" onClick={() => engine.current?.stop()}>
              Stop
            </button>
            <button
              type="button"
              aria-pressed={auto}
              onClick={() => setAuto((v) => !v)}
            >
              Auto
            </button>
            <button type="button" onClick={copyLink} disabled={!current}>
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>

      <a className={styles.cta} href={`mailto:${email}`}>
        <span>Still unsure? Email me</span>
        <i aria-hidden="true" />
      </a>

      {/* Without a script nothing can play, so the whole FAQ is plain text. */}
      <noscript>
        <style>{`.${styles.grid},.${styles.head}{display:none}`}</style>
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
