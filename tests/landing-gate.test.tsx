import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { LandingGate } from '@/features/landing-page/components/landing-gate'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

/**
 * The gate plays the preloader once per session and leaves the page it covers
 * untouched. What matters here is the contract: the page is always rendered, the
 * boot is shown once, and a failing `sessionStorage` is the harmless kind of
 * failure.
 */
describe('<LandingGate />', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    window.sessionStorage.clear()
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

  it('always renders the page, and puts the poster over it a frame later', () => {
    mount()
    expect(host.querySelector('#page')).not.toBeNull()
    expect(host.querySelector('[aria-hidden="true"].fixed')).toBeNull()
    act(() => {
      jest.advanceTimersByTime(20)
    })
    const overlay = host.querySelector('[aria-hidden="true"].fixed')
    expect(overlay).not.toBeNull()
    expect(overlay!.className).toContain('z-[100]')
    expect(host.querySelector('#page')).not.toBeNull()
  })

  it('removes the poster when it ends and remembers it for the session', () => {
    mount()
    // First the frame that puts the poster up, then its own 1.4s: a render
    // scheduled by a timer lands when its `act` ends, so the poster's clock
    // starts with the second one.
    act(() => {
      jest.advanceTimersByTime(20)
    })
    act(() => {
      jest.advanceTimersByTime(1400)
    })
    expect(host.querySelector('[aria-hidden="true"].fixed')).toBeNull()
    expect(host.querySelector('#page')).not.toBeNull()
    expect(window.sessionStorage.getItem('aditya-landing-session-boot')).toBe(
      '1',
    )
  })

  it('does not play again in the same session', () => {
    window.sessionStorage.setItem('aditya-landing-session-boot', '1')
    mount()
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(host.querySelector('[aria-hidden="true"].fixed')).toBeNull()
    expect(host.querySelector('#page')).not.toBeNull()
  })

  it('skips the poster, and still renders the page, when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    mount()
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(host.querySelector('#page')).not.toBeNull()
    expect(host.querySelector('[aria-hidden="true"].fixed')).toBeNull()
  })
})
