import styles from './work.module.css'

/**
 * Section heading for the work section only.
 *
 * Deliberately not the shared `SectionHeading` from rack-01: that one inherits
 * six generations of cascade from `rack-01.module.css` — including a
 * `max-width: 1000px` and a mobile `clamp(43px, 13vw, 70px)` — so reusing it
 * inside the player shell produced a 70px heading that clipped against the
 * banner. Everything here is scoped to this module and sized off `vh`, which is
 * what a fixed-height player stage actually needs.
 */
export function WorkHeading({
  index,
  eyebrow,
  children,
}: {
  index: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.workHeading}>
      <p className={styles.workEyebrow}>
        <span className={styles.workIndex}>{index}</span>
        <span aria-hidden="true" className={styles.workSlash}>
          /
        </span>
        <span>{eyebrow}</span>
      </p>
      {/* vh-based so the heading always fits the fixed 100svh stage, and
          balanced so a two-word title breaks evenly instead of orphaning. */}
      <h2 className={styles.workTitle}>{children}</h2>
    </div>
  )
}
