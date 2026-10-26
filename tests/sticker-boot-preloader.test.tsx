import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import StickerBootPreloader, {
  STICKER_BOOT_TIMELINE,
  StickerBootCover,
} from '@/components/ui/sticker-boot-preloader'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

describe('<StickerBootPreloader />', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
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

  it('paints the same cobalt room for the server cover', () => {
    act(() => root.render(<StickerBootCover />))
    const cover = host.querySelector('[data-boot-cover]')
    expect(cover).not.toBeNull()
    expect(cover!.className).toContain('groundPaint')
  })

  it('peels after the read, then completes exactly at the end of the schedule', () => {
    const done = jest.fn()
    act(() => root.render(<StickerBootPreloader onComplete={done} />))

    const overlay = host.querySelector('[data-boot-storm]')
    expect(overlay).not.toBeNull()
    expect((overlay as HTMLElement).dataset.leaving).toBe('false')

    act(() => {
      jest.advanceTimersByTime(STICKER_BOOT_TIMELINE.leave)
    })
    expect((overlay as HTMLElement).dataset.leaving).toBe('true')
    expect(done).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(
        STICKER_BOOT_TIMELINE.total - STICKER_BOOT_TIMELINE.leave,
      )
    })
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('gives reduced motion a short held beat and calls back', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query.includes('reduced-motion'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    })
    const done = jest.fn()
    act(() => root.render(<StickerBootPreloader onComplete={done} />))
    act(() => {
      jest.advanceTimersByTime(STICKER_BOOT_TIMELINE.reduced)
    })
    expect(done).toHaveBeenCalledTimes(1)
  })
})
