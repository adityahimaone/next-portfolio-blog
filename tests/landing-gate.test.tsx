import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { STORM_TIMELINE } from '@/components/ui/signal-storm-preloader'
import { LandingGate } from '@/features/landing-page/components/landing-gate'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

/**
 * The gate plays the preloader once per session and leaves the page it covers
 * untouched. What matters here is the contract: the page is always rendered, the
 * boot is shown once, and a failing `sessionStorage` is the harmless kind of
 * failure.
 *
 * The ordering is the other half of it. The cover is part of the server's HTML —
 * it is in the tree on the *first* render, before any effect — and the real
 * overlay replaces it a frame later. A regression that moves the cover back
 * behind an effect is exactly the bug this guards: the hero paints first, and
 * the boot arrives on top of a page the visitor has already read.
 */
describe('<LandingGate />', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    window.sessionStorage.clear()
    document.documentElement.removeAttribute('data-boot')
    document.documentElement.removeAttribute('style')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    })
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })
  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  const mount = () =>
    act(() =>
      root.render(
        <LandingGate>
          <main id="page">the page</main>
        </LandingGate>,
      ),
    )

  it('renders the page with the boot cover already up, and the storm a frame later', () => {
    mount()
    expect(host.querySelector('#page')).not.toBeNull()
    // The server's half: present on the first render, before any effect.
    const cover = host.querySelector('[data-boot-cover]')
    expect(cover).not.toBeNull()
    // The cover has to be the storm's own ground, not a lookalike.
    expect(cover!.className).toContain('groundPaint')
    expect(host.querySelector('[data-boot-storm]')).toBeNull()

    act(() => {
      jest.advanceTimersByTime(20)
    })
    // Handed over, not stacked: one layer at a time.
    expect(host.querySelector('[data-boot-cover]')).toBeNull()
    const storm = host.querySelector('[data-boot-storm]')
    expect(storm).not.toBeNull()
    expect(storm!.className).toContain('z-[100]')
    expect(host.querySelector('#page')).not.toBeNull()
  })

  it('removes the storm when it ends and remembers it for the session', () => {
    mount()
    // First the frame that puts the overlay up, then the preloader's own run: a render
    // scheduled by a timer lands when its `act` ends, so the overlay's clock
    // starts with the second one.
    act(() => {
      jest.advanceTimersByTime(20)
    })
    act(() => {
      jest.advanceTimersByTime(STORM_TIMELINE.total)
    })
    expect(host.querySelector('[data-boot-storm]')).toBeNull()
    expect(host.querySelector('[data-boot-cover]')).toBeNull()
    expect(host.querySelector('#page')).not.toBeNull()
    expect(window.sessionStorage.getItem('aditya-landing-session-boot')).toBe(
      '1',
    )
  })

  it('takes the head script’s cover down when the boot completes', () => {
    // The `<head>` script writes this before the first paint; the component is
    // the only thing that can withdraw it afterwards.
    document.documentElement.setAttribute('data-boot', 'on')
    document.documentElement.style.setProperty('--boot-play', 'paused')
    mount()
    act(() => {
      jest.advanceTimersByTime(20)
    })
    expect(document.documentElement.hasAttribute('data-boot')).toBe(true)
    act(() => {
      jest.advanceTimersByTime(STORM_TIMELINE.total)
    })
    expect(document.documentElement.hasAttribute('data-boot')).toBe(false)
  })

  it('does not play again in the same session', () => {
    window.sessionStorage.setItem('aditya-landing-session-boot', '1')
    mount()
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(host.querySelector('[data-boot-storm]')).toBeNull()
    expect(host.querySelector('[data-boot-cover]')).toBeNull()
    expect(host.querySelector('#page')).not.toBeNull()
  })

  it('skips the boot, and still renders the page, when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    mount()
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(host.querySelector('#page')).not.toBeNull()
    expect(host.querySelector('[data-boot-storm]')).toBeNull()
    expect(host.querySelector('[data-boot-cover]')).toBeNull()
  })

  it('hands the hero’s letters back if it unmounts before the storm takes them', () => {
    // Only the head script has touched them at this point: the gate is torn
    // down inside the frame that would have mounted the storm.
    const other = document.createElement('div')
    document.body.appendChild(other)
    const otherRoot = createRoot(other)
    document.documentElement.style.setProperty('--boot-play', 'paused')
    act(() =>
      otherRoot.render(
        <LandingGate>
          <main>the page</main>
        </LandingGate>,
      ),
    )
    act(() => otherRoot.unmount())
    other.remove()
    expect(document.documentElement.style.getPropertyValue('--boot-play')).toBe(
      '',
    )
    expect(document.documentElement.hasAttribute('data-boot')).toBe(false)
  })
})
