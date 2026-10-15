'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

import styles from './arrangement.module.css'

/** Each word of the name and the index of its first letter along the line. */
function nameWords(label: string) {
  const words = label.split(' ')
  return words.map((word, index) => ({
    word,
    start: words.slice(0, index).reduce((sum, w) => sum + w.length, 0),
  }))
}

/**
 * The hero's name, set to fit.
 *
 * The name is the brand, so it is set as large as the lane will take, and the
 * display face it is set in (Syne ExtraBold) is among the widest type there
 * is: a size chosen against the viewport alone overflowed the clip at some
 * widths and was cut off at its edge. Guessing a `vw` that is safe everywhere
 * is a guess about glyph widths that a font swap silently breaks, so this
 * measures instead.
 *
 * It measures at the nominal size, then writes one number, `--name-fit`, the
 * share of that size that fits (never above 1). The stylesheet multiplies the
 * font size by it. Both measurements are layout widths (`offsetWidth` and
 * `clientWidth`), which the camera's transforms do not touch, so the name fits
 * the clip it is in at every zoom, not the clip as it is currently drawn.
 *
 * It re-measures when the clip resizes and when the display face has loaded,
 * since a width measured in the fallback font is the wrong width.
 */
export function NameTitle({ label }: { label: string }) {
  const title = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const element = title.current
    const body = element?.parentElement
    if (!element || !body) return

    const fit = () => {
      element.style.setProperty('--name-fit', '1')
      const style = getComputedStyle(element)
      const padding = parseFloat(style.paddingLeft) || 0
      const em = parseFloat(style.fontSize) || 0

      // Width. The last glyph overhangs its box by the letter-spacing, so the
      // line needs a little more than its measured width, and a little air is
      // left on the right so the last letter is never on the edge.
      const available = body.clientWidth - padding - 16
      const needed = element.scrollWidth - padding + em * 0.12
      const byWidth =
        needed > 0 && available > 0 ? Math.min(1, available / needed) : 1

      // Height, only where the clip has a fixed height to overflow: a clip that
      // grows with its content (the phone layout) is never too short for it.
      const byHeight =
        element.offsetHeight > 0 && body.clientHeight < element.offsetHeight
          ? Math.min(1, (body.clientHeight / element.offsetHeight) * 0.94)
          : 1

      element.style.setProperty(
        '--name-fit',
        Math.min(byWidth, byHeight).toFixed(4),
      )
    }

    fit()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
    observer?.observe(body)
    void document.fonts?.ready.then(fit)

    return () => observer?.disconnect()
  }, [label])

  return (
    <h1 ref={title} className={styles.clipNameTitle} aria-label={label}>
      {/* The name is the brand, so it is set as a *waveform*: every letter its
          own bar of the wave drawn behind it. The letters rise out of their
          words on load, then keep a slow, phase-shifted swell, so the name
          reads as signal rather than as a heading. The accessible name is the
          label; the letters are `aria-hidden`. */}
      {nameWords(label).map(({ word, start }) => (
        <span
          key={`${word}-${start}`}
          className={styles.nameWord}
          aria-hidden="true"
        >
          {Array.from(word).map((char, charIndex) => (
            <span
              key={charIndex}
              className={styles.nameChar}
              style={{ '--c': start + charIndex } as CSSProperties}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
