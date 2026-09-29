import styles from './rack-01.module.css'

/**
 * Shared by every numbered section. Lives here rather than inside rack-01.tsx
 * so the work section can render the same heading without the circular import
 * back into the page shell.
 */
export function SectionHeading({
  index,
  eyebrow,
  children,
}: {
  index: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.sectionHeading}>
      <div className={styles.silkscreen}>
        <span className={styles.sectionIndex}>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h2>{children}</h2>
    </div>
  )
}
