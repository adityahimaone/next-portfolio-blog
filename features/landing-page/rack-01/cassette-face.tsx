'use client'

import { CASSETTE_THEMES } from './shared'
import { EXPERIENCES } from '../constants'
import styles from './rack-01.module.css'

/**
 * The printed face of a cassette, shared by the experience deck and the eject
 * handoff so the two are the same object rather than two drawings of one.
 *
 * The handoff has to be a clone. It was a hand-drawn approximation before, and
 * the differences were obvious side by side: a different border radius, a
 * label that was not the deck's label, reels that were rings instead of
 * toothed wheels. Any of those reads as "a different cassette" the instant the
 * deck's own shell fades out and this one takes its place.
 *
 * Rendered inside whichever shell the caller supplies, so the outer geometry
 * (a slot in the carousel, or a free-flying box on the body) stays with the
 * caller and the interior stays here.
 */
export function CassetteFace({ index }: { index: number }) {
  const item = EXPERIENCES[index]

  return (
    <>
      <span className={styles.cassetteBrand}>
        <b>AH / STUDIO</b> / TYPE II · HIGH BIAS 70μs
      </span>
      <div className={styles.cassetteLabel}>
        <small>
          {item.type} / {String(index + 1).padStart(2, '0')}
        </small>
        <strong>{item.company}</strong>
        <span>{item.role}</span>
      </div>
      <div className={styles.cassetteMechanism}>
        <span className={styles.tapeWheel}>
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <span className={styles.cassetteTapePath}>
          <i />
          <b />
        </span>
        <span className={styles.tapeWheel}>
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
      {/* Pin, head, pin. The assembly lays out with `space-around`, so the
          trailing pin is load-bearing: without it the head block sits left of
          centre with a bare gap down the right-hand side. */}
      <div className={styles.cassetteHeadAssembly} aria-hidden="true">
        <i />
        <b />
        <i />
      </div>
      <span className={styles.cassetteFooter}>{item.period}</span>
    </>
  )
}

/** The per-cassette custom properties, for a caller drawing its own shell. */
export function cassetteThemeVars(index: number): React.CSSProperties {
  const theme = CASSETTE_THEMES[index % CASSETTE_THEMES.length]
  return {
    '--cassette-shell': theme.shell,
    '--cassette-shell-deep': theme.shellDeep,
    '--cassette-label': theme.label,
    '--cassette-ink': theme.ink,
    '--cassette-accent': theme.accent,
  } as React.CSSProperties
}

/**
 * Just the two the tab strip uses. The tabs tint their border and text from the
 * matching cassette rather than carrying a palette of their own, but they do
 * not draw a shell, so the shell and ink are not set here.
 */
export function cassetteAccentVars(index: number): React.CSSProperties {
  const theme = CASSETTE_THEMES[index % CASSETTE_THEMES.length]
  return {
    '--cassette-label': theme.label,
    '--cassette-accent': theme.accent,
  } as React.CSSProperties
}
