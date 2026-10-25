import styles from './studio.module.css'

/**
 * The divider is a cable, not a rule.
 *
 * Each one is mounted between two sections and carries the same line the
 * section edges carry, at the same x. The node is the join: the line is drawn
 * through it from the previous section's exit to the next section's entry, so
 * the page reads as one continuous signal rather than a stack of unrelated
 * bands. The label is a real link to the section it opens, which is why it is
 * not `aria-hidden`.
 */
export function SignalRail({
  index,
  label,
  href,
  meta,
  variant = 'default',
}: {
  index: string
  label: string
  href: string
  meta?: string
  variant?: 'default' | 'bridge'
}) {
  return (
    <div
      className={`${styles.rail} ${variant === 'bridge' ? styles.railBridge : ''}`}
      data-rail
      data-rail-variant={variant}
    >
      <span className={styles.railLine} data-rail-line aria-hidden="true" />
      <span className={styles.railNode} data-rail-node aria-hidden="true">
        <span className={styles.railNodeCore} />
      </span>
      <a className={styles.railLabel} href={href} data-rail-label>
        <span>{index}</span>
        <span>{label}</span>
        <i aria-hidden="true" />
        {meta ? <span className={styles.railMeta}>{meta}</span> : null}
      </a>
    </div>
  )
}
