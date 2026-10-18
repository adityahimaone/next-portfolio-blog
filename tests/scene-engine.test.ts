/** @jest-environment node */
import { FAQ_ITEMS } from '@/features/landing-page/rack-01/contact-desk/contact-content'
import {
  createEngine,
  type EngineView,
} from '@/features/landing-page/rack-01/contact-desk/scene-engine'
import { clipDuration } from '@/features/landing-page/rack-01/contact-desk/scene-logic'

/** A DOM node reduced to what the engine writes: custom properties, attributes, text. */
const node = () => {
  const props: Record<string, string> = {}
  const attrs: Record<string, string> = {}
  return {
    props,
    attrs,
    textContent: '',
    style: { setProperty: (k: string, v: string) => void (props[k] = v) },
    setAttribute: (k: string, v: string) => void (attrs[k] = v),
  }
}

type Harness = ReturnType<typeof setup>

function setup(reducedMotion = false) {
  let clockNow = 10_000 // a clock that starts mid-beat is the realistic case
  let frames: ((t: number) => void)[] = []
  const g = globalThis as unknown as Record<string, unknown>
  g.requestAnimationFrame = (cb: (t: number) => void) => {
    frames.push(cb)
    return frames.length
  }
  g.cancelAnimationFrame = () => {
    frames = []
  }
  jest.spyOn(performance, 'now').mockImplementation(() => clockNow)

  const unit = node()
  const master = node()
  const typed = node()
  const time = node()
  const bar = node()
  const clips = FAQ_ITEMS.map(() => node())
  let view: EngineView = {
    selected: null,
    playing: null,
    queued: null,
    played: [],
  }

  const engine = createEngine({
    items: FAQ_ITEMS,
    setView: (update) => void (view = update(view)),
    reduced: () => reducedMotion,
    els: {
      unit: () => unit as unknown as HTMLElement,
      master: () => master as unknown as HTMLElement,
      typed: () => typed as unknown as HTMLElement,
      time: () => time as unknown as HTMLElement,
      bar: () => bar as unknown as HTMLElement,
      clip: (i) => clips[i] as unknown as HTMLElement,
    },
  })

  /** Run every frame callback that is waiting, at the current clock. */
  const flush = () => {
    const pending = frames
    frames = []
    pending.forEach((cb) => cb(clockNow))
  }
  const advance = (ms: number, step = 16) => {
    for (let t = 0; t < ms; t += step) {
      clockNow += step
      flush()
    }
  }
  return {
    engine,
    unit,
    master,
    typed,
    time,
    bar,
    clips,
    advance,
    flush,
    now: () => clockNow,
    set: (t: number) => void (clockNow = t),
    view: () => view,
    pending: () => frames.length,
  }
}

afterEach(() => jest.restoreAllMocks())

describe('the scene engine', () => {
  let h: Harness
  beforeEach(() => {
    h = setup()
  })

  it('queues a press and does not start until the next beat', () => {
    h.set(10_100) // 100ms into a 500ms beat
    h.engine.launch(2)
    expect(h.view().queued).toBe(2)
    expect(h.view().playing).toBeNull()
    h.advance(300) // 400ms in: still inside the beat
    expect(h.view().playing).toBeNull()
    h.advance(200) // past the boundary at 10_500
    expect(h.view().playing).toBe(2)
    expect(h.view().queued).toBeNull()
    expect(h.view().selected).toBe(2)
  })

  it('waits at most one beat', () => {
    h.set(10_001)
    h.engine.launch(0)
    h.advance(520)
    expect(h.view().playing).toBe(0)
  })

  it('ends the playing clip and resets the stage the moment another is queued', () => {
    h.engine.launch(0, true)
    h.advance(1500)
    expect(Number(h.master.props['--p'])).toBeGreaterThan(0)
    h.engine.launch(3)
    expect(h.view().playing).toBeNull()
    expect(h.view().played).toEqual([0])
    expect(h.view().selected).toBe(3)
    expect(h.master.props['--p']).toBe('0')
    // The old clip must not keep writing onto the new clip's stage.
    h.advance(100)
    expect(h.master.props['--p']).toBe('0')
    h.advance(600)
    expect(h.view().playing).toBe(3)
  })

  it('launches immediately when asked to, as a deep link does', () => {
    h.engine.launch(4, true)
    expect(h.view().playing).toBe(4)
  })

  it('advances the playhead, the typed text and the clock together', () => {
    h.engine.launch(1, true)
    const duration = clipDuration(FAQ_ITEMS[1].answer)
    h.advance(duration / 2)
    const p = Number(h.clips[1].props['--p'])
    expect(p).toBeGreaterThan(0.4)
    expect(p).toBeLessThan(0.6)
    expect(h.master.props['--p']).toBe(h.clips[1].props['--p'])
    const answer = FAQ_ITEMS[1].answer
    expect(h.typed.textContent.length).toBeGreaterThan(answer.length * 0.4)
    expect(h.typed.textContent.length).toBeLessThan(answer.length * 0.6)
    expect(answer.startsWith(h.typed.textContent)).toBe(true)
    expect(h.time.textContent).toMatch(/^00:0\d \/ 00:\d\d$/)
  })

  it('finishes with the whole answer, the playhead reset, and the clip marked played', () => {
    h.engine.launch(3, true)
    h.advance(clipDuration(FAQ_ITEMS[3].answer) + 200)
    expect(h.view().playing).toBeNull()
    expect(h.view().played).toEqual([3])
    expect(h.typed.textContent).toBe(FAQ_ITEMS[3].answer)
    expect(h.clips[3].props['--p']).toBe('0')
    expect(h.master.props['--p']).toBe('1')
    expect(h.time.textContent).toBe('00:00 / 00:00')
  })

  it('keeps the beat on the unit, one value per beat, wrapping at four', () => {
    h.set(10_000)
    h.engine.setVisible(true)
    const seen = new Set<string>()
    for (let i = 0; i < 160; i += 1) {
      h.advance(16)
      const beat = h.unit.attrs['data-beat']
      if (beat !== undefined) seen.add(beat)
    }
    expect([...seen].sort()).toEqual(['0', '1', '2', '3'])
  })

  it('stop shows the whole answer, and cancels a queued clip', () => {
    h.engine.launch(5, true)
    h.advance(1000)
    h.engine.stop()
    expect(h.view().playing).toBeNull()
    expect(h.typed.textContent).toBe(FAQ_ITEMS[5].answer)

    h.set(h.now() + 10)
    h.engine.launch(6)
    h.engine.stop()
    expect(h.view().queued).toBeNull()
    h.advance(1200)
    expect(h.view().playing).toBeNull()
  })

  it('replaces a playing clip with the next one and resets the old playhead', () => {
    h.engine.launch(0, true)
    h.advance(800)
    h.engine.launch(1, true)
    expect(h.view().playing).toBe(1)
    expect(h.clips[0].props['--p']).toBe('0')
  })

  it('moves on by itself when auto is on, and wraps from the last clip', () => {
    h.engine.setAuto(true)
    h.engine.launch(FAQ_ITEMS.length - 1, true)
    h.advance(clipDuration(FAQ_ITEMS[FAQ_ITEMS.length - 1].answer) + 800)
    expect(h.view().playing).toBe(0)
  })

  it('does not move on when auto is off', () => {
    h.engine.launch(0, true)
    h.advance(clipDuration(FAQ_ITEMS[0].answer) + 1500)
    expect(h.view().playing).toBeNull()
    expect(h.view().queued).toBeNull()
  })

  it('only keeps a loop going while something needs one', () => {
    expect(h.pending()).toBe(0) // nothing yet: an idle page runs nothing
    h.engine.launch(0, true)
    expect(h.pending()).toBe(1)
    h.advance(clipDuration(FAQ_ITEMS[0].answer) + 200)
    h.flush()
    expect(h.pending()).toBe(0) // finished and off screen: the loop has stopped
    h.engine.setVisible(true)
    expect(h.pending()).toBe(1) // on screen: the beat runs
    h.engine.setVisible(false)
    h.flush()
    expect(h.pending()).toBe(0)
  })

  it('reports whether the visitor has done anything', () => {
    expect(h.engine.touched()).toBe(false)
    h.engine.launch(0)
    expect(h.engine.touched()).toBe(true)
  })

  it('stops for good when destroyed', () => {
    h.engine.launch(0, true)
    h.engine.destroy()
    h.advance(500)
    expect(h.pending()).toBe(0)
  })
})

describe('with reduced motion', () => {
  it('selects the clip and prints the whole answer at once, with no loop', () => {
    const h = setup(true)
    h.engine.launch(7)
    expect(h.view().selected).toBe(7)
    expect(h.view().playing).toBeNull()
    expect(h.view().queued).toBeNull()
    expect(h.typed.textContent).toBe(FAQ_ITEMS[7].answer)
    expect(h.master.props['--p']).toBe('1')
    expect(h.pending()).toBe(0)
  })
})

describe('without a typed-text element', () => {
  it('plays, advances and finishes without one (the lyric sheet lights by CSS)', () => {
    const h2 = setup()
    // Rebuild the engine with no typed element.
    const engine = createEngine({
      items: FAQ_ITEMS,
      setView: () => undefined,
      reduced: () => false,
      els: {
        unit: () => null,
        master: () => h2.master as unknown as HTMLElement,
        typed: () => null,
        time: () => null,
        bar: () => null,
        clip: () => null,
      },
    })
    expect(() => {
      engine.launch(0, true)
      h2.advance(clipDuration(FAQ_ITEMS[0].answer) + 300)
    }).not.toThrow()
    expect(h2.master.props['--p']).toBe('1')
    engine.destroy()
  })
})
