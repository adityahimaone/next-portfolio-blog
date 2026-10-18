import type { FaqEntry } from './contact-content'
import {
  beatIndex,
  clipDuration,
  clock,
  progressAt,
  transportAt,
  typedAt,
} from './scene-logic'

/**
 * The scene launcher's playback machine: the clock, the queue, the playhead.
 *
 * It is a plain module and not part of the component for two reasons. It owns a
 * `requestAnimationFrame` loop, a timer's worth of mutable state and a set of
 * DOM writes, and none of that belongs in a render function, where it would
 * have to be fenced off from React's rules one line at a time. And it makes the
 * contract plain: React says *what happened* (a press, a stop, the unit
 * arriving on screen); the engine says *what changed* (a view to render); the
 * per-frame work, which is most of the work, never touches React at all.
 *
 * ## What a frame does
 *
 * Three things and nothing else. It advances the beat (a `data-beat` on the
 * unit, which the stylesheet turns into LED and pulse animation); it launches a
 * queued clip if a beat boundary has just passed, which is the whole of "a clip
 * starts on the next beat"; and it advances a playing clip (a `--p` custom
 * property on the clip and the master, the typed text, the clock). The first
 * two are single attribute writes. The last is a few property writes on small
 * subtrees. State is committed to React only on a transition.
 *
 * The loop runs while the unit is on screen or something is playing or queued,
 * and stops otherwise, so an idle page costs nothing.
 */

export type EngineView = {
  /** The clip whose answer is on the screen. */
  selected: number | null
  playing: number | null
  queued: number | null
  played: number[]
}

export type EngineDeps = {
  items: readonly FaqEntry[]
  /** Commit a transition to React. */
  setView: (update: (view: EngineView) => EngineView) => void
  /** Read live, so a change to the user's preference applies at once. */
  reduced: () => boolean
  els: {
    unit: () => HTMLElement | null
    master: () => HTMLElement | null
    typed: () => HTMLElement | null
    time: () => HTMLElement | null
    bar: () => HTMLElement | null
    clip: (index: number) => HTMLElement | null
  }
}

export type Engine = {
  launch: (index: number, immediate?: boolean) => void
  stop: () => void
  setAuto: (on: boolean) => void
  setVisible: (on: boolean) => void
  touched: () => boolean
  destroy: () => void
}

export function createEngine(deps: EngineDeps): Engine {
  const { items, els } = deps
  let playing: number | null = null
  let queued: number | null = null
  let startAt = 0
  let duration = 0
  let lastBeat = -1
  let visible = false
  let running = false
  let raf = 0
  let touched = false
  let auto = false
  let destroyed = false

  const writeProgress = (index: number | null, p: number) => {
    els.master()?.style.setProperty('--p', String(p))
    if (index !== null) els.clip(index)?.style.setProperty('--p', String(p))
  }

  const showWhole = (index: number) => {
    const typed = els.typed()
    if (typed) typed.textContent = items[index].answer
    writeProgress(index, 1)
  }

  const finish = (index: number, advance: boolean) => {
    playing = null
    showWhole(index)
    els.clip(index)?.style.setProperty('--p', '0')
    const time = els.time()
    if (time) time.textContent = '00:00 / 00:00'
    deps.setView((view) => ({
      ...view,
      playing: null,
      played: view.played.includes(index)
        ? view.played
        : [...view.played, index],
    }))
    if (advance && auto) {
      const following = (index + 1) % items.length
      queued = following
      lastBeat = beatIndex(performance.now())
      deps.setView((view) => ({ ...view, queued: following }))
    }
  }

  const start = (index: number, now: number) => {
    if (playing !== null && playing !== index) {
      els.clip(playing)?.style.setProperty('--p', '0')
    }
    queued = null
    playing = index
    startAt = now
    duration = clipDuration(items[index].answer)
    const typed = els.typed()
    if (typed) typed.textContent = ''
    writeProgress(index, 0)
    const time = els.time()
    if (time) time.textContent = `00:00 / ${clock(duration)}`
    deps.setView((view) => ({
      ...view,
      selected: index,
      playing: index,
      queued: null,
    }))
  }

  const tick = (now: number) => {
    raf = 0
    running = false
    if (destroyed) return

    const beat = beatIndex(now)
    if (beat !== lastBeat) {
      lastBeat = beat
      els.unit()?.setAttribute('data-beat', String(beat % 4))
      // A queued clip launches on the beat, not on the press.
      if (queued !== null) start(queued, now)
      const bar = els.bar()
      if (playing !== null && bar) bar.textContent = transportAt(now - startAt)
    }

    if (playing !== null) {
      const elapsed = now - startAt
      const p = progressAt(elapsed, duration)
      writeProgress(playing, p)
      const typed = els.typed()
      if (typed) typed.textContent = typedAt(items[playing].answer, p)
      const time = els.time()
      if (time) time.textContent = `${clock(elapsed)} / ${clock(duration)}`
      if (p >= 1) finish(playing, true)
    }

    if (visible || playing !== null || queued !== null) ensureLoop()
  }

  const ensureLoop = () => {
    if (running || destroyed || deps.reduced()) return
    running = true
    raf = requestAnimationFrame(tick)
  }

  return {
    launch(index, immediate = false) {
      touched = true
      if (deps.reduced()) {
        // No loop with reduced motion: a press selects the clip and the whole
        // answer appears at once.
        playing = null
        queued = null
        deps.setView((view) => ({
          ...view,
          selected: index,
          playing: null,
          queued: null,
        }))
        showWhole(index)
        return
      }
      if (immediate) {
        start(index, performance.now())
      } else {
        queued = index
        lastBeat = beatIndex(performance.now())
        deps.setView((view) => ({ ...view, selected: index, queued: index }))
      }
      ensureLoop()
    },
    stop() {
      touched = true
      if (queued !== null) {
        queued = null
        deps.setView((view) => ({ ...view, queued: null }))
      }
      if (playing !== null) finish(playing, false)
    },
    setAuto(on) {
      auto = on
    },
    setVisible(on) {
      visible = on
      if (on) ensureLoop()
    },
    touched: () => touched,
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      running = false
    },
  }
}
