'use client'

import { useId, useMemo, useState } from 'react'
import {
  NOTE_LIMIT,
  PROJECT_TYPES,
  TIMELINES,
  composeBrief,
} from './contact-content'
import styles from './contact-desk.module.css'
import { useReveal } from './use-reveal'

type Copy = 'idle' | 'copied' | 'failed'

/**
 * The brief builder: a few controls that compose the first email.
 *
 * The controller above is the way in; this is what people usually need once
 * they are in, which is something to say. Pick the kind of work and the timing,
 * add a line, and the LCD shows the message exactly as it will arrive. "Open in
 * mail" is a plain `mailto:` link, so it works without a script and in any mail
 * client; "Copy" is there for the people who live in a web mail tab.
 *
 * Nothing is sent anywhere by this page. There is no form endpoint and no
 * stored note: the text exists in this component and in the link.
 */
export function ContactBriefBuilder({ email }: { email: string }) {
  const [type, setType] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [copy, setCopy] = useState<Copy>('idle')
  const [reveal, revealState] = useReveal<HTMLElement>()
  const id = useId()

  const brief = useMemo(
    () => composeBrief({ type, timeline, note }, email),
    [type, timeline, note, email],
  )
  const timelinePos = TIMELINES.findIndex((t) => t.id === timeline)

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${email}\nSubject: ${brief.subject}\n\n${brief.body}`,
      )
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
    window.setTimeout(() => setCopy('idle'), 2200)
  }

  return (
    <section
      ref={reveal}
      data-reveal={revealState}
      className={`${styles.panel} ${styles.builder}`}
      aria-labelledby={`${id}-title`}
    >
      <header className={styles.panelHead}>
        <div>
          <strong>AH / BRIEF</strong>
          <span>Compose the first message</span>
        </div>
        <h3 id={`${id}-title`}>Brief builder</h3>
        <small>mailto</small>
      </header>

      <div className={styles.builderBody}>
        <div className={styles.controls}>
          <fieldset className={styles.field}>
            <legend>Kind of work</legend>
            <div className={styles.typePads}>
              {PROJECT_TYPES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={styles.typePad}
                  aria-pressed={type === choice.id}
                  onClick={() => setType(type === choice.id ? null : choice.id)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>Timing</legend>
            <div
              className={styles.switch}
              data-has={timelinePos >= 0}
              style={
                { '--pos': Math.max(0, timelinePos) } as React.CSSProperties
              }
            >
              <span className={styles.switchThumb} aria-hidden="true" />
              {TIMELINES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={timeline === choice.id}
                  onClick={() =>
                    setTimeline(timeline === choice.id ? null : choice.id)
                  }
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.field}>
            <label htmlFor={`${id}-note`} className={styles.fieldLabel}>
              One line about it
            </label>
            <textarea
              id={`${id}-note`}
              className={styles.note}
              rows={3}
              maxLength={NOTE_LIMIT}
              value={note}
              placeholder="What is it, and what is the hard part?"
              onChange={(event) => setNote(event.target.value)}
            />
            <small className={styles.count}>
              {note.length}/{NOTE_LIMIT}
            </small>
          </div>
        </div>

        <div className={styles.output}>
          <pre
            className={styles.lcd}
            aria-live="polite"
            aria-label="Message preview"
          >
            <span>TO&nbsp;&nbsp;&nbsp;&nbsp;{email}</span>
            {'\n'}
            <span>SUBJ&nbsp;&nbsp;{brief.subject}</span>
            {'\n\n'}
            {brief.body}
          </pre>
          <div className={styles.actions}>
            <a className={styles.send} href={brief.href}>
              Open in mail
            </a>
            <button
              type="button"
              className={styles.copyKey}
              onClick={copyBrief}
            >
              {copy === 'copied'
                ? 'Copied'
                : copy === 'failed'
                  ? 'Select the text'
                  : 'Copy brief'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
