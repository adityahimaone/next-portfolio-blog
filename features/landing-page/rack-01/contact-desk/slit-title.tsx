import { Fragment, type CSSProperties } from 'react'
import styles from './contact-desk.module.css'

/**
 * A headline set in capitals that rises, letter by letter, through a hard
 * horizontal slit: each line clips its own overflow, and each capital sits a
 * share of its height below the baseline until the section arrives.
 *
 * It is a single `h2` with an `aria-label` of the whole text and every visible
 * letter `aria-hidden`, so a screen reader hears a heading and not a spelling
 * lesson. `\n` in `text` breaks the line.
 *
 * Hovering lifts the letters clear of the slit (pointer devices only); the
 * resting state is the slit, which is the design. `slit` is how much of each
 * capital it hides, 0 to 0.5; 0 sets the word whole.
 */
export function SlitTitle({
  text,
  id,
  slit = 0.4,
  className = '',
}: {
  text: string
  id?: string
  slit?: number
  className?: string
}) {
  const lines = text.split('\n')
  const cut = Math.min(0.5, Math.max(0, slit))
  let index = 0
  return (
    <h2
      id={id}
      className={`${styles.title} ${className}`.trim()}
      aria-label={lines.join(' ')}
      data-slit={cut > 0}
      style={
        {
          // Capitals are about 0.72em tall; the drop is a share of that, plus a
          // hair so the baseline never shows a sliver.
          '--cut':
            cut > 0 ? `calc(${(cut * 0.72).toFixed(3)}em + 0.05em)` : '0px',
        } as CSSProperties
      }
    >
      {lines.map((line, lineIndex) => (
        <span className={styles.line} key={lineIndex} aria-hidden="true">
          {line.split(' ').map((word, wordIndex, words) => (
            <Fragment key={wordIndex}>
              <span className={styles.word}>
                {Array.from(word).map((letter, letterIndex) => (
                  <span
                    className={styles.ch}
                    key={letterIndex}
                    style={{ '--i': index++ } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </h2>
  )
}
