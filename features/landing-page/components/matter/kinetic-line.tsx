import styles from './matter.module.css'

export function KineticLine({
  text,
  dir = 1,
  className,
}: {
  text: string
  dir?: 1 | -1
  className?: string
}) {
  const words = text.split(' ')
  return (
    <p
      className={[styles.statement, className].filter(Boolean).join(' ')}
      data-reveal
      style={{ '--dir': dir } as React.CSSProperties}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className={styles.wMask}>
            <span
              className={styles.w}
              style={{ '--w': index } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}
