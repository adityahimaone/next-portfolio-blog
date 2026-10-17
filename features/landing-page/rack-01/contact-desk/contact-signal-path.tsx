'use client'

import { useId } from 'react'
import { PATH } from './contact-content'
import styles from './contact-desk.module.css'
import { useReveal } from './use-reveal'

/**
 * The signal path: how a project moves, as four stages patched together.
 *
 * It is an ordered list, because it is one, with the cables drawn between the
 * items as decoration. The jacks and cables are `aria-hidden`; what a screen
 * reader gets is four numbered steps in order.
 */
export function ContactSignalPath() {
  const [reveal, revealState] = useReveal<HTMLElement>()
  const id = useId()
  return (
    <section
      ref={reveal}
      data-reveal={revealState}
      className={`${styles.panel} ${styles.path}`}
      aria-labelledby={`${id}-title`}
    >
      <header className={styles.panelHead}>
        <div>
          <strong>AH / ROUTING</strong>
          <span>Input to output</span>
        </div>
        <h3 id={`${id}-title`}>Signal path</h3>
        <small>04 stages</small>
      </header>
      <ol className={styles.stages}>
        {PATH.map((stage, index) => (
          <li
            key={stage.title}
            className={styles.stage}
            style={{ '--i': index } as React.CSSProperties}
          >
            <span className={styles.jack} aria-hidden="true" />
            <span className={styles.stageStep}>{stage.step}</span>
            <h4>{stage.title}</h4>
            <p>{stage.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
