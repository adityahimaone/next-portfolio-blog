import type { CSSProperties } from 'react'
import type { ArrangementClip as ClipData } from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The one clip component, used by the hero arrangement and by About.
 *
 * A clip is a `<div>` unless it is selectable, in which case it is a `<button>`
 * — the About tracks are the only selectable ones, and a `<div>` with a click
 * handler is not reachable by keyboard.
 */
export function ArrangementClip({
  clip,
  onSelect,
  selected,
}: {
  clip: ClipData
  onSelect?: () => void
  selected?: boolean
}) {
  const className = [
    styles.clip,
    clip.kind === 'name' ? styles.clipName : '',
    clip.kind === 'profile' ? styles.clipProfile : '',
    selected ? styles.clipSelected : '',
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--clip-start': clip.start,
    '--clip-end': clip.end,
    '--clip-color': clip.color,
    // Overlapping clips share a lane in rows rather than on top of each other.
    '--clip-top': clip.top ?? 0,
    '--clip-height': clip.height ?? 1,
  } as CSSProperties

  // The name clip's label is the document's single `h1`. It is a heading that
  // happens to be a clip label, rather than a heading placed over the scene —
  // which is the difference between the name being part of the arrangement and
  // the name being a plate on top of it.
  //
  // The two words are set on two lines, and that is arithmetic rather than
  // taste: §2 derives the ceiling from the widest word, `HIMAWAN`, because
  // `ADITYA HIMAWAN` on one line is wider than any frame this hero supports.
  // One word per line is what makes that derivation true.
  const body = (
    <span className={styles.clipBody}>
      {clip.kind === 'name' ? (
        <>
          <h1 className={styles.clipNameTitle}>
            {clip.label.split(' ').map((word) => (
              <span key={word}>{word}</span>
            ))}
          </h1>
          <span className={styles.srOnly}> — Frontend Engineer, Jakarta</span>
        </>
      ) : (
        <strong>{clip.label}</strong>
      )}
      {clip.notes ? (
        <span className={styles.notes} aria-hidden="true">
          {clip.notes.map((note, index) => (
            <i key={index} style={{ '--note': note } as CSSProperties} />
          ))}
        </span>
      ) : clip.detail ? (
        <span className={styles.clipDetail}>{clip.detail}</span>
      ) : null}
      {clip.kind === 'profile' ? (
        <span className={styles.clipWash} aria-hidden="true" />
      ) : null}
    </span>
  )

  if (!onSelect) {
    return (
      <div className={className} style={style}>
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {body}
    </button>
  )
}
